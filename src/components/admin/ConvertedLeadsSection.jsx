import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import LeadCard from './LeadCard'
import LeadDetailsModal from './LeadDetailsModal'
import { RefreshCw } from 'lucide-react'

const ConvertedLeadsSection = ({ onRefresh }) => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchConvertedLeads()
  }, [])

  const fetchConvertedLeads = async () => {
    setLoading(true)
    try {
      // ONLY query transactions table for converted leads
      // This is the single source of truth
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          leads (
            *,
            affiliates (
              name,
              email,
              referral_code
            )
          )
        `)
        .eq('status', 'Pending')  // Transaction status = Pending (not yet paid)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Filter out any that might have invalid lead data
      const validLeads = data?.filter(t => t.leads !== null) || []
      
      setLeads(validLeads)
    } catch (error) {
      toast.error('Failed to load converted leads')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (transaction) => {
    setSelectedLead({ ...transaction.leads, transaction })
    setShowDetailsModal(true)
  }

  const handleMarkAsPaid = async (transaction) => {
    if (!confirm(`Mark payment of ₹${transaction.reward_earned.toLocaleString()} as paid?`)) return

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'Paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (error) throw error

      toast.success('Payment marked as paid!')
      fetchConvertedLeads()
      onRefresh()
    } catch (error) {
      toast.error('Failed to update payment status')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Payments</h3>
        <p className="text-gray-600">All converted leads have been paid.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Converted Leads - Payment Pending ({leads.length})</h2>
        <button
          onClick={fetchConvertedLeads}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(transaction => (
          <LeadCard
            key={transaction.id}
            lead={transaction.leads}
            transaction={transaction}
            type="converted"
            onViewDetails={() => handleViewDetails(transaction)}
            onMarkAsPaid={() => handleMarkAsPaid(transaction)}
          />
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedLead(null)
          }}
        />
      )}
    </div>
  )
}

export default ConvertedLeadsSection
