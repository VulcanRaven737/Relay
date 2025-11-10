'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import Aurora from '@/components/Aurora'

// Uses calculateusertotalspending() and getstationrevenue() DB functions
// Also uses charging_session, payment, and review tables
export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState<any>(null)
  const [chartData, setChartData] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/user')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setUserStats(data.stats)
      setChartData(data.chartData)
      setError('')
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-gray-900 dark:text-white text-xl font-semibold mb-2">Unable to load analytics</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )

  if (!userStats) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-40 -z-0 pointer-events:none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={0.1}
          speed={0.5}
        />
      </div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analytics Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white rounded-lg shadow-md p-6">
            <p className="text-primary-100 dark:text-primary-200 text-sm mb-1">Total Spending</p>
            <p className="text-3xl font-bold">{formatCurrency(userStats.totalSpending)}</p>
            <p className="text-primary-100 dark:text-primary-200 text-xs mt-2">Via DB function</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalSessions}</p>
            <p className="text-green-600 dark:text-green-400 text-xs mt-2">+{userStats.sessionsThisMonth} this month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Energy Consumed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalEnergy.toFixed(1)} kWh</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">Lifetime total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Avg Session Cost</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(userStats.avgSessionCost)}</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">Per session</p>
          </div>
        </div>

        {/* Usage Patterns */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Favorite Stations</h2>
            <div className="space-y-3">
              {userStats.favoriteStations?.length > 0 ? (
                userStats.favoriteStations.map((station: any, index: number) => (
                  <div key={station.station_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{station.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{station.visits} visits</p>
                      </div>
                    </div>
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {formatCurrency(station.spent)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No charging sessions yet</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Sessions this month</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.sessionsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Spent this month</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(userStats.spentThisMonth)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Energy this month</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.energyThisMonth.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average duration</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.avgDuration} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charging History Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Charging History (Last 6 Months)</h2>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end justify-around space-x-2">
              {chartData.map((data: any) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 dark:bg-primary-600 rounded-t transition-all hover:bg-primary-600 dark:hover:bg-primary-500"
                    style={{ height: `${(data.sessions / Math.max(...chartData.map((d: any) => d.sessions), 1)) * 100}%`, minHeight: data.sessions > 0 ? '20px' : '0' }}
                  ></div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{data.month}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.sessions}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No charging history yet</p>
          )}
        </div>

        {/* Vehicle Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Vehicle Usage</h2>
          {userStats.vehicles?.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {userStats.vehicles.map((vehicle: any) => (
                <div key={vehicle.vehicle_id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{vehicle.model}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                      <span className="font-medium dark:text-gray-200">{vehicle.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Energy:</span>
                      <span className="font-medium dark:text-gray-200">{vehicle.energy.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                      <span className="font-medium text-primary-600 dark:text-primary-400">{formatCurrency(vehicle.cost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No vehicles registered yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
