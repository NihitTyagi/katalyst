import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import PendingLeadsSection from '@/components/admin/PendingLeadsSection'
import ConvertedLeadsSection from '@/components/admin/ConvertedLeadsSection'
import PaidLeadsSection from '@/components/admin/PaidLeadsSection'

const ManageLeads = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [stats, setStats] = useState({
    pending: 0,
    converted: 0,
    paid: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Count pending leads
      const { count: pendingCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending')

      // Count converted (unpaid) leads
      const { count: convertedCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending')

      // Count paid leads
      const { count: paidCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Paid')

      setStats({
        pending: pendingCount || 0,
        converted: convertedCount || 0,
        paid: paidCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStats()
  }

  const tabs = [
    { id: 'pending', label: 'Pending Leads', count: stats.pending, color: 'yellow' },
    { id: 'converted', label: 'Converted (Unpaid)', count: stats.converted, color: 'blue' },
    { id: 'paid', label: 'Paid Leads', count: stats.paid, color: 'green' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Manage Leads</h1>
        <p className="text-gray-600">Convert leads, process payments, and track completed transactions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-sm opacity-80 mb-1">Pending Review</div>
          <div className="text-4xl font-bold">{stats.pending}</div>
          <div className="text-sm opacity-80 mt-1">Leads awaiting action</div>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-80 mb-1">Payment Pending</div>
          <div className="text-4xl font-bold">{stats.converted}</div>
          <div className="text-sm opacity-80 mt-1">Converted, awaiting payment</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-80 mb-1">Completed</div>
          <div className="text-4xl font-bold">{stats.paid}</div>
          <div className="text-sm opacity-80 mt-1">Fully paid leads</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2 border-b pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white text-primary' : 'bg-white text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'pending' && (
          <PendingLeadsSection onRefresh={handleRefresh} />
        )}
        {activeTab === 'converted' && (
          <ConvertedLeadsSection onRefresh={handleRefresh} />
        )}
        {activeTab === 'paid' && (
          <PaidLeadsSection onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  )
}

export default ManageLeads
