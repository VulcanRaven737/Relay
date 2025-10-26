'use client'

import { useState, useEffect } from 'react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import ProtectedRoute from '@/components/ProtectedRoute'

// Admin Dashboard - uses all tables, especially maintenance_log
function AdminPageContent() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [stations, setStations] = useState([])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    const response = await fetch('/api/admin/dashboard')
    const data = await response.json()
    setStats(data.stats)
    setMaintenanceLogs(data.maintenanceLogs)
    setStations(data.stations)
  }

  if (!stats) return <div className="p-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          {['overview', 'stations', 'maintenance', 'revenue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Total Stations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStations}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Total Ports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPorts}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-primary-600">{stats.activeSessions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Port Status Distribution</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Available</span>
                    <span className="text-green-600 font-semibold">{stats.availablePorts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">In Use</span>
                    <span className="text-yellow-600 font-semibold">{stats.inUsePorts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Maintenance</span>
                    <span className="text-red-600 font-semibold">{stats.maintenancePorts}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Sessions Today</span>
                    <span className="font-semibold">{stats.sessionsToday}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Revenue Today</span>
                    <span className="font-semibold">{formatCurrency(stats.revenueToday)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">New Users</span>
                    <span className="font-semibold">{stats.newUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab - uses maintenance_log table */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Maintenance Logs</h2>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                + New Log
              </button>
            </div>

            <div className="space-y-4">
              {maintenanceLogs.map((log: any) => (
                <div key={log.log_id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{log.station_name}</h3>
                      <p className="text-sm text-gray-600">Port {log.port_id} - {log.technicianname}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      log.status === 'Fixed'
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{log.issue}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reported:</span>
                      <span className="ml-2 font-medium">{formatDateTime(log.maintain_date)}</span>
                    </div>
                    {log.fix_date && (
                      <div>
                        <span className="text-gray-600">Fixed:</span>
                        <span className="ml-2 font-medium">{formatDateTime(log.fix_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stations Tab */}
        {activeTab === 'stations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Stations</h2>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                + Add Station
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stations.map((station: any) => (
                <div key={station.station_id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{station.operatorname}</h3>
                      <p className="text-sm text-gray-600">{station.location}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700">Edit</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Ports</p>
                      <p className="font-semibold">{station.total_ports}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="font-semibold text-green-600">{station.available_ports}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sessions</p>
                      <p className="font-semibold">{station.sessions}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold text-primary-600">{formatCurrency(station.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Tab - uses getstationrevenue() function */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Revenue Analytics</h2>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Station Revenue (This Month)</h3>
              <div className="space-y-3">
                {stations.map((station: any) => (
                  <div key={station.station_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold text-gray-900">{station.operatorname}</p>
                      <p className="text-sm text-gray-600">{station.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">{formatCurrency(station.revenue)}</p>
                      <p className="text-xs text-gray-600">via getstationrevenue()</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminPageContent />
    </ProtectedRoute>
  )
}
