import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DollarSign, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import InvoiceModal from '@/components/InvoiceModal'

const Wallet = () => {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    total_earned: 0,
    pending: 0,
    paid: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, total_earned')
        .eq('user_id', user.id)
        .single()
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          leads (name, email)
        `)
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      const pending = transactionData
        ?.filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.reward_earned, 0) || 0
      const paid = transactionData
        ?.filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + t.reward_earned, 0) || 0
      setStats({
        total_earned: affiliate.total_earned || 0,
        pending,
        paid,
      })
      setTransactions(transactionData || [])
    } catch (error) {
      toast.error('Failed to load wallet data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Paid: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Wallet</h1>
        <p className="text-gray-600">Track your earnings and reward history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={32} />
            <span className="text-sm opacity-80">Total Earned</span>
          </div>
          <div className="text-3xl font-bold">
            ₹{stats.total_earned.toLocaleString()}
          </div>
          <p className="text-sm opacity-80 mt-2">Lifetime earnings</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={32} />
            <span className="text-sm opacity-80">Pending</span>
          </div>
          <div className="text-3xl font-bold">
            ₹{stats.pending.toLocaleString()}
          </div>
          <p className="text-sm opacity-80 mt-2">Awaiting payment</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={32} />
            <span className="text-sm opacity-80">Paid Out</span>
          </div>
          <div className="text-3xl font-bold">
            ₹{stats.paid.toLocaleString()}
          </div>
          <p className="text-sm opacity-80 mt-2">Successfully paid</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Start converting leads to see your earnings here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Lead Name</th>
                  <th className="text-left py-3 px-4">Project Amount</th>
                  <th className="text-left py-3 px-4">Reward</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Paid On</th>
                  <th className="text-left py-3 px-4">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {transaction.leads?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      ₹{transaction.reward_earned.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.paid_at
                        ? new Date(transaction.paid_at).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4">
                      {transaction.status === 'Paid' && transaction.payment_proof_url ? (
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowInvoiceModal(true);
                          }}
                          className="underline text-teal-600 font-medium"
                        >
                          Invoice
                        </button>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInvoiceModal && selectedTransaction && (
        <InvoiceModal
          txn={selectedTransaction}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Payment Info */}
      <div className="mt-6 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">Payment Information</h3>
        <p className="text-sm text-gray-700">
          Rewards are processed monthly. Pending payments will be transferred to your registered account within 5-7 business days after the end of each month.
        </p>
      </div>
    </div>
  )
}

export default Wallet
