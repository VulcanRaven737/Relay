'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

// Uses calculateusertotalspending() and getstationrevenue() DB functions
// Also uses charging_session, payment, and review tables
export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState<any>(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    const response = await fetch('/api/analytics/user')
    const data = await response.json()
    setUserStats(data.stats)
    setChartData(data.chartData)
  }

  if (!userStats) return <div className="p-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg shadow-md p-6">
            <p className="text-primary-100 text-sm mb-1">Total Spending</p>
            <p className="text-3xl font-bold">{formatCurrency(userStats.totalSpending)}</p>
            <p className="text-primary-100 text-xs mt-2">Via DB function</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{userStats.totalSessions}</p>
            <p className="text-green-600 text-xs mt-2">+{userStats.sessionsThisMonth} this month</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Energy Consumed</p>
            <p className="text-3xl font-bold text-gray-900">{userStats.totalEnergy} kWh</p>
            <p className="text-gray-500 text-xs mt-2">Lifetime total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Avg Session Cost</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(userStats.avgSessionCost)}</p>
            <p className="text-gray-500 text-xs mt-2">Per session</p>
          </div>
        </div>

        {/* Usage Patterns */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Favorite Stations</h2>
            <div className="space-y-3">
              {userStats.favoriteStations?.map((station: any, index: number) => (
                <div key={station.station_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{station.name}</p>
                      <p className="text-sm text-gray-600">{station.visits} visits</p>
                    </div>
                  </div>
                  <span className="text-primary-600 font-semibold">
                    {formatCurrency(station.spent)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Sessions this month</span>
                <span className="text-2xl font-bold text-gray-900">{userStats.sessionsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Spent this month</span>
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(userStats.spentThisMonth)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Energy this month</span>
                <span className="text-2xl font-bold text-gray-900">{userStats.energyThisMonth} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average duration</span>
                <span className="text-2xl font-bold text-gray-900">{userStats.avgDuration} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charging History Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Charging History (Last 6 Months)</h2>
          <div className="h-64 flex items-end justify-around space-x-2">
            {chartData.map((data: any) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                  style={{ height: `${(data.sessions / Math.max(...chartData.map((d: any) => d.sessions))) * 100}%` }}
                ></div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-600">{data.month}</p>
                  <p className="text-sm font-semibold text-gray-900">{data.sessions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Vehicle Usage</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {userStats.vehicles?.map((vehicle: any) => (
              <div key={vehicle.vehicle_id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{vehicle.model}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions:</span>
                    <span className="font-medium">{vehicle.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Energy:</span>
                    <span className="font-medium">{vehicle.energy} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium text-primary-600">{formatCurrency(vehicle.cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
