import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import LeadCard from './LeadCard'
import LeadDetailsModal from './LeadDetailsModal'
import { RefreshCw, Search } from 'lucide-react'

const PaidLeadsSection = ({ onRefresh }) => {
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPaidLeads()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = leads.filter(transaction =>
        transaction.leads.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.leads.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.leads.affiliates.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLeads(filtered)
    } else {
      setFilteredLeads(leads)
    }
  }, [searchTerm, leads])

  const fetchPaidLeads = async () => {
    setLoading(true)
    try {
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
        .eq('status', 'Paid')
        .order('paid_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
      setFilteredLeads(data || [])
    } catch (error) {
      toast.error('Failed to load paid leads')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (transaction) => {
    setSelectedLead({ ...transaction.leads, transaction })
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Paid Leads ({filteredLeads.length})</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11 w-full"
            />
          </div>
          <button
            onClick={fetchPaidLeads}
            className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No Results Found' : 'No Paid Leads Yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'Paid leads will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(transaction => (
            <LeadCard
              key={transaction.id}
              lead={transaction.leads}
              transaction={transaction}
              type="paid"
              onViewDetails={() => handleViewDetails(transaction)}
            />
          ))}
        </div>
      )}

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

export default PaidLeadsSection
