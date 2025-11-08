import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const MarkAsPaidModal = ({ transaction, onClose, onSuccess }) => {
  const [referenceId, setReferenceId] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Simple URL format validation
  const isValidUrl = (url) => /^https?:\/\/.+\..+$/.test(url)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!referenceId.trim()) {
      toast.error('Reference ID required')
      return
    }
    if (!isValidUrl(proofUrl)) {
      toast.error('Please enter a valid URL (http/https)')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'Paid',
          paid_at: new Date().toISOString(),
          payment_reference_id: referenceId,
          payment_proof_url: proofUrl,
          payment_notes: notes
        })
        .eq('id', transaction.id)
      if (error) throw error
      toast.success('Payment marked as paid with proof!')
      onSuccess()
    } catch (error) {
      toast.error('Failed to mark as paid')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark">Payment Proof</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block font-medium mb-1">Payment Reference ID *</label>
            <input
              value={referenceId}
              onChange={e => setReferenceId(e.target.value)}
              className="input-field"
              placeholder="UTR12345678 / Bank TXN ID"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Payment Proof URL *</label>
            <input
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              className="input-field"
              placeholder="https://drive.google.com/..."
              required
              type="url"
            />
            <p className="text-xs opacity-60 mt-1">
              Paste the public link of your payment screenshot (Drive/Imgur etc.)
            </p>
          </div>
          <div>
            <label className="block font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Paid via UPI to +91xxx at 8:30PM"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              className="btn-secondary flex-1"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn-primary flex-1"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Marking as Paid...' : 'Mark as Paid & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default MarkAsPaidModal
