import { Eye, CheckCircle, XCircle, DollarSign, Calendar, User } from 'lucide-react'

const LeadCard = ({ lead, transaction, type, onViewDetails, onConvert, onReject, onMarkAsPaid }) => {
  const getStatusColor = () => {
    if (type === 'pending') return 'bg-yellow-100 text-yellow-800'
    if (type === 'converted') return 'bg-blue-100 text-blue-800'
    if (type === 'paid') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Handler functions that pass lead object, not event
  const handleViewDetails = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onViewDetails(lead)  // ← Pass lead object
  }

  const handleConvert = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onConvert(lead)  // ← Pass lead object
  }

  const handleReject = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onReject(lead)  // ← Pass lead object
  }

  const handleMarkAsPaid = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onMarkAsPaid()  // This one is fine as is
  }

  return (
    <div className="card hover:shadow-lg transition-all border-l-4 border-primary">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark mb-1">{lead.name}</h3>
          <p className="text-sm text-gray-600">{lead.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {type === 'pending' && 'Pending'}
          {type === 'converted' && 'Payment Pending'}
          {type === 'paid' && 'Paid'}
        </span>
      </div>

      {/* Affiliate Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User size={16} className="text-primary" />
          <span className="font-medium">Referred by:</span>
          <span>{lead.affiliates?.name || 'Unknown'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 ml-6">
          Code: {lead.affiliates?.referral_code || 'N/A'}
        </div>
      </div>

      {/* Amount Info (for converted/paid) */}
      {(type === 'converted' || type === 'paid') && transaction && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Project Amount</div>
            <div className="text-lg font-bold text-dark">
              ₹{transaction.amount.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Reward</div>
            <div className="text-lg font-bold text-green-600">
              ₹{transaction.reward_earned.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Date Info */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Calendar size={14} />
        {type === 'paid' && transaction?.paid_at ? (
          <span>Paid on {formatDate(transaction.paid_at)}</span>
        ) : (
          <span>Submitted on {formatDate(lead.created_at)}</span>
        )}
      </div>

      {/* Project Requirements Preview */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Project:</div>
        <p className="text-sm text-gray-700 line-clamp-2">
          {lead.project_requirements || 'No description provided'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={handleViewDetails}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Eye size={16} />
          View Details
        </button>

        {type === 'pending' && (
          <>
            <button
              onClick={handleConvert}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium"
            >
              <CheckCircle size={16} />
              Convert
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              title="Reject"
            >
              <XCircle size={16} />
            </button>
          </>
        )}

        {type === 'converted' && (
          <button
            onClick={handleMarkAsPaid}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <DollarSign size={16} />
            Mark as Paid
          </button>
        )}
      </div>
    </div>
  )
}

export default LeadCard
