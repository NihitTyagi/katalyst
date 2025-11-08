import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DollarSign, Users, TrendingUp, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_earned: 0,
    total_leads: 0,
    conversion_count: 0,
    pending_reward: 0,
  })
  const [referralCode, setReferralCode] = useState('')
  const [recentLeads, setRecentLeads] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch affiliate data
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (affiliateError) throw affiliateError

      setReferralCode(affiliate.referral_code)

      // Fetch ALL transactions (pending and paid)
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('reward_earned, status')
        .eq('affiliate_id', affiliate.id)

      // Calculate pending reward (status = 'Pending')
      const pendingTotal = allTransactions
        ?.filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.reward_earned, 0) || 0

      // Calculate paid reward (status = 'Paid')
      const paidTotal = allTransactions
        ?.filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + t.reward_earned, 0) || 0

      setStats({
        total_earned: paidTotal, // ← Changed: Only show PAID rewards
        total_leads: affiliate.total_leads || 0,
        conversion_count: affiliate.conversion_count || 0,
        pending_reward: pendingTotal, // ← This shows unpaid rewards
      })

      // Fetch recent leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentLeads(leads || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  const copyReferralCode = () => {
  navigator.clipboard.writeText(`${window.location.origin}/affiliate?ref=${referralCode}`)
  setCopied(true)
  toast.success('Referral link copied to clipboard!')
  setTimeout(() => setCopied(false), 2000)
}


  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Converted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
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
        <h1 className="text-3xl font-bold text-dark mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your performance and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={32} />
            <span className="text-sm opacity-80">Total Rewards</span>
          </div>
          <div className="text-3xl font-bold">₹{stats.total_earned.toLocaleString()}</div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={32} />
            <span className="text-sm opacity-80">Total Leads</span>
          </div>
          <div className="text-3xl font-bold">{stats.total_leads}</div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={32} />
            <span className="text-sm opacity-80">Conversions</span>
          </div>
          <div className="text-3xl font-bold">{stats.conversion_count}</div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={32} />
            <span className="text-sm opacity-80">Pending</span>
          </div>
          <div className="text-3xl font-bold">₹{stats.pending_reward.toLocaleString()}</div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 font-mono text-sm break-all">
            {window.location.origin}/affiliate?ref={referralCode}
          </div>
          <button
            onClick={copyReferralCode}
            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          💡 Share this link with potential clients !
        </p>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
        {recentLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No leads yet. Start referring clients to earn rewards!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Reward</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{lead.name}</td>
                    <td className="py-3 px-4">{lead.email}</td>
                    <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
                    <td className="py-3 px-4">
                      {lead.reward ? `₹${lead.reward.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
