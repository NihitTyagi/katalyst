import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import AddLeadModal from '@/components/leads/AddLeadModal'

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [searchTerm, statusFilter, leads])

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Include transactions status for each lead
      const { data, error } = await supabase
        .from('leads')
        .select('*, transactions:transactions(status)')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      toast.error('Failed to load leads')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = leads

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      )
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">My Leads</h1>
          <p className="text-gray-600">Manage and track all your referred clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Converted">Converted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No leads found</p>
            <p className="text-sm mt-2">Try adjusting your filters or add a new lead</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Reward</th>
                  <th className="text-left py-3 px-4">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  // check if lead has paid transaction
                  const isPaid = lead.transactions?.some(txn => txn.status === 'Paid');
                  const statusToShow = isPaid ? 'Paid' : lead.status;

                  return (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{lead.name}</td>
                      <td className="py-3 px-4">{lead.email}</td>
                      <td className="py-3 px-4">{lead.phone}</td>
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">Paid</span>
                        ) : (
                          getStatusBadge(statusToShow)
                        )}
                      </td>
                      <td className="py-3 px-4">{lead.amount ? `₹${lead.amount.toLocaleString()}` : '-'}</td>
                      <td className={`py-3 px-4 font-semibold ${isPaid ? 'text-teal-600': ''}`}>
                        {lead.reward ? `₹${lead.reward.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="text-sm text-gray-600">Pending Leads</div>
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'Pending').length}</div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-gray-600">Converted Leads</div>
          <div className="text-2xl font-bold text-green-600">{leads.filter(l => l.status === 'Converted').length}</div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-gray-600">Rejected Leads</div>
          <div className="text-2xl font-bold text-red-600">{leads.filter(l => l.status === 'Rejected').length}</div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            fetchLeads()
          }}
        />
      )}
    </div>
  )
}

export default Leads
