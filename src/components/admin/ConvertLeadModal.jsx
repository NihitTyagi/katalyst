import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { X, DollarSign, Percent, CheckCircle } from 'lucide-react'

const ConvertLeadModal = ({ lead, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [rewardRate, setRewardRate] = useState(10)
  const [loading, setLoading] = useState(false)

  const reward = amount ? (parseFloat(amount) * rewardRate / 100) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      // Update lead status and amounts
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: 'Converted',
          amount: parseFloat(amount),
          reward: reward
        })
        .eq('id', lead.id)

      if (leadError) throw leadError

      toast.success(`Lead converted successfully! Reward: ₹${reward.toLocaleString()}`)
      onSuccess()
    } catch (error) {
      toast.error('Failed to convert lead')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark">Convert Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Converting Lead:</h3>
            <p className="text-lg font-medium text-dark">{lead.name}</p>
            <p className="text-sm text-gray-600">{lead.email}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Project Amount (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-11"
                placeholder="50000"
                required
                min="0"
                step="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the total project value in rupees
            </p>
          </div>

          {/* Reward Rate */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Reward Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={rewardRate}
                onChange={(e) => setRewardRate(e.target.value)}
                className="input-field pl-11"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default is 10%. Adjust if needed.
            </p>
          </div>

          {/* Calculation Summary */}
          {amount && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-dark mb-3">Calculation Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Project Amount:</span>
                <span className="font-semibold">₹{parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Reward Rate:</span>
                <span className="font-semibold">{rewardRate}%</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-dark">Affiliate Earns:</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{reward.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={loading || !amount}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Convert Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConvertLeadModal
