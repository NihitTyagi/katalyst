import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import LeadCard from './LeadCard'
import LeadDetailsModal from './LeadDetailsModal'
import ConvertLeadModal from './ConvertLeadModal'
import { RefreshCw } from 'lucide-react'

const PendingLeadsSection = ({ onRefresh }) => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [leadToConvert, setLeadToConvert] = useState(null)

  useEffect(() => {
    fetchPendingLeads()
  }, [])

  const fetchPendingLeads = async () => {
    setLoading(true)
    try {
      // Fetch all pending leads with their transactions
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          affiliates (
            name,
            email,
            referral_code
          )
        `)
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get all transactions for these leads
      const leadIds = data?.map(lead => lead.id) || []
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('lead_id')
        .in('lead_id', leadIds)

      const leadIdsWithTransactions = new Set(
        transactions?.map(t => t.lead_id) || []
      )

      // Filter: Only show leads WITHOUT transactions
      const trulyPendingLeads = data?.filter(
        lead => !leadIdsWithTransactions.has(lead.id)
      ) || []

      setLeads(trulyPendingLeads)
    } catch (error) {
      toast.error('Failed to load pending leads')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (lead) => {
    setSelectedLead(lead)
    setShowDetailsModal(true)
  }

  const handleConvert = (lead) => {
    setLeadToConvert(lead)
    setShowConvertModal(true)
  }

  const handleReject = async (lead) => {
    if (!confirm(`Are you sure you want to reject lead from ${lead.name}?`)) return

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'Rejected' })
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead rejected')
      fetchPendingLeads()
      onRefresh()
    } catch (error) {
      toast.error('Failed to reject lead')
      console.error(error)
    }
  }

  const handleConvertSuccess = () => {
    setShowConvertModal(false)
    setLeadToConvert(null)
    fetchPendingLeads()
    onRefresh()
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
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No pending leads at the moment.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Pending Leads ({leads.length})</h2>
        <button
          onClick={fetchPendingLeads}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            type="pending"
            onViewDetails={handleViewDetails}
            onConvert={handleConvert}
            onReject={handleReject}
          />
        ))}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedLead(null)
          }}
        />
      )}

      {showConvertModal && leadToConvert && (
        <ConvertLeadModal
          lead={leadToConvert}
          onClose={() => {
            setShowConvertModal(false)
            setLeadToConvert(null)
          }}
          onSuccess={handleConvertSuccess}
        />
      )}
    </div>
  )
}

export default PendingLeadsSection
