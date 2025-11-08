import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trophy, TrendingUp, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const Leaderboard = () => {
  const [topByEarnings, setTopByEarnings] = useState([])
  const [topByConversions, setTopByConversions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      // Top by earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliates')
        .select('name, total_earned, conversion_count')
        .order('total_earned', { ascending: false })
        .limit(3)

      if (earningsError) throw earningsError

      // Top by conversions
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('affiliates')
        .select('name, total_earned, conversion_count')
        .order('conversion_count', { ascending: false })
        .limit(3)

      if (conversionsError) throw conversionsError

      setTopByEarnings(earningsData || [])
      setTopByConversions(conversionsData || [])
    } catch (error) {
      toast.error('Failed to load leaderboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index) => {
    const icons = ['🥇', '🥈', '🥉']
    return icons[index] || '🏅'
  }

  const getRankColor = (index) => {
    const colors = [
      'from-yellow-400 to-yellow-600',
      'from-gray-400 to-gray-600',
      'from-orange-400 to-orange-600',
    ]
    return colors[index] || 'from-primary to-primary-dark'
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
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Trophy size={48} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-dark mb-2">Leaderboard</h1>
        <p className="text-gray-600 text-lg">Top performing affiliates of the month</p>
      </div>

      {/* Top Earners */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-primary" size={28} />
          <h2 className="text-2xl font-bold">Top Earners</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topByEarnings.map((affiliate, index) => (
            <div
              key={index}
              className={`card bg-gradient-to-br ${getRankColor(index)} text-white transform transition-transform hover:scale-105`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{getRankIcon(index)}</div>
                <div className="text-3xl font-bold mb-2">#{index + 1}</div>
                <div className="text-xl font-semibold mb-4">{affiliate.name}</div>
                <div className="bg-white/20 rounded-lg p-4 space-y-2">
                  <div>
                    <div className="text-sm opacity-80">Total Earned</div>
                    <div className="text-2xl font-bold">
                      ₹{affiliate.total_earned.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Conversions</div>
                    <div className="text-xl font-semibold">
                      {affiliate.conversion_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Converters */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Award className="text-primary" size={28} />
          <h2 className="text-2xl font-bold">Most Conversions</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topByConversions.map((affiliate, index) => (
            <div
              key={index}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{getRankIcon(index)}</div>
                <div>
                  <div className="text-2xl font-bold">#{index + 1}</div>
                  <div className="text-lg font-semibold text-dark">
                    {affiliate.name}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Conversions</div>
                  <div className="text-2xl font-bold text-green-600">
                    {affiliate.conversion_count}
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Earned</div>
                  <div className="text-xl font-bold text-primary">
                    ₹{affiliate.total_earned.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-12 card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="text-center">
          <p className="text-gray-700">
            <span className="font-semibold">Want to see your name here?</span> Start referring more clients and climb the leaderboard! Leaderboard updates daily.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
