import { X, Mail, Phone, User, FileText, Calendar, DollarSign, Award } from 'lucide-react'

const LeadDetailsModal = ({ lead, onClose }) => {
  if (!lead) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Converted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lead Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Status</h3>
            {getStatusBadge(lead.status)}
          </div>

          {/* Lead Information */}
          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Full Name</div>
                  <div className="font-medium">{lead.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Email Address</div>
                  <div className="font-medium">{lead.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <div className="font-medium">{lead.phone}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Submitted On</div>
                  <div className="font-medium">{formatDate(lead.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate Information */}
          <div className="card bg-primary/5">
            <h3 className="text-lg font-semibold mb-4">Referred By</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Affiliate Name</div>
                  <div className="font-medium">{lead.affiliates?.name || 'Unknown'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Affiliate Email</div>
                  <div className="font-medium">{lead.affiliates?.email || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="text-primary mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Referral Code</div>
                  <div className="font-mono font-medium bg-white px-3 py-1 rounded inline-block">
                    {lead.affiliates?.referral_code || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Requirements */}
          <div className="card bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Project Requirements
            </h3>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {lead.project_requirements || 'No project requirements provided'}
              </p>
            </div>
          </div>

          {/* Transaction Details (if exists) */}
          {lead.transaction && (
            <div className="card bg-green-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="text-primary" size={20} />
                Transaction Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Project Amount</div>
                  <div className="text-2xl font-bold text-dark">
                    ₹{lead.transaction.amount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{lead.transaction.reward_earned.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                  <div className={`text-lg font-semibold ${
                    lead.transaction.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {lead.transaction.status}
                  </div>
                </div>
                {lead.transaction.paid_at && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Paid On</div>
                    <div className="text-sm font-medium">
                      {formatDate(lead.transaction.paid_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailsModal
