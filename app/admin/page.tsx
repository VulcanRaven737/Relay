'use client'

import { useState, useEffect } from 'react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import Aurora from '@/components/Aurora'
import ProtectedRoute from '@/components/ProtectedRoute'

// Admin Dashboard - uses all tables, especially maintenance_log
function AdminPageContent() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [maintenancePorts, setMaintenancePorts] = useState<any[]>([])
  const [allPorts, setAllPorts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [stations, setStations] = useState([])
  const [showAddStationModal, setShowAddStationModal] = useState(false)
  const [newStation, setNewStation] = useState({
    operatorname: '',
    location: '',
    contact: '',
    latitude: '',
    longitude: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminData()
    fetchMaintenancePorts()
    fetchAllPorts()
    fetchReviews()
  }, [])

    const fetchAdminData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setStations(data.stations)
        setMaintenanceLogs(data.maintenanceLogs)
      } else {
        setError(data.error || 'Failed to fetch admin data')
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMaintenancePorts = async () => {
    try {
      const response = await fetch('/api/admin/maintenance-ports')
      const data = await response.json()

      if (response.ok) {
        setMaintenancePorts(data.ports)
      } else {
        console.error('Error fetching maintenance ports:', data.error)
      }
    } catch (err) {
      console.error('Error fetching maintenance ports:', err)
    }
  }

  const fetchAllPorts = async (filter = 'all') => {
    try {
      const response = await fetch(`/api/admin/ports?status=${filter}`)
      const data = await response.json()

      if (response.ok) {
        setAllPorts(data.ports)
      } else {
        console.error('Error fetching ports:', data.error)
      }
    } catch (err) {
      console.error('Error fetching ports:', err)
    }
  }

  const fetchReviews = async () => {
    try {
      // Use admin endpoint to fetch ALL reviews
      const response = await fetch('/api/admin/reviews')
      const data = await response.json()
      if (response.ok) {
        setReviews(data)
      } else {
        console.error('Error fetching reviews:', data.error)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  const updatePortStatus = async (portId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/ports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portId, newStatus }),
      })

      if (response.ok) {
        // Refresh data
        await Promise.all([fetchAllPorts(statusFilter), fetchAdminData(), fetchMaintenancePorts()])
      } else {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Failed to update port status'))
      }
    } catch (err) {
      console.error('Error updating port status:', err)
      alert('Failed to update port status')
    }
  }

  const markPortAsAvailable = async (portId: number) => {
    try {
      const response = await fetch('/api/admin/maintenance-ports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portId }),
      })

      if (response.ok) {
        // Refresh both maintenance ports and admin data to update stats
        await Promise.all([fetchMaintenancePorts(), fetchAdminData()])
      } else {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Failed to update port status'))
      }
    } catch (err) {
      console.error('Error marking port as available:', err)
      alert('Failed to update port status')
    }
  }

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorname: newStation.operatorname,
          location: newStation.location,
          contact: newStation.contact,
          latitude: newStation.latitude ? parseFloat(newStation.latitude) : null,
          longitude: newStation.longitude ? parseFloat(newStation.longitude) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create station')

      // Reset form and close modal
      setNewStation({
        operatorname: '',
        location: '',
        contact: '',
        latitude: '',
        longitude: '',
      })
      setShowAddStationModal(false)
      
      // Refresh data
      await fetchAdminData()
      alert('Station created successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to create station')
    } finally {
      setLoading(false)
    }
  }

  if (!stats) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-40 pointer-events-none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Overview</h1>
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                    {['overview', 'stations', 'maintenance', 'revenue', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'stations' ? 'Port Management' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg shadow-lg p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm">Total Stations</p>
                  <span className="text-3xl">🏢</span>
                </div>
                <p className="text-4xl font-bold">{stats.totalStations}</p>
                <p className="text-blue-100 text-xs mt-2">Across all locations</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg shadow-lg p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm">Total Ports</p>
                  <span className="text-3xl">🔌</span>
                </div>
                <p className="text-4xl font-bold">{stats.totalPorts}</p>
                <p className="text-purple-100 text-xs mt-2">{stats.availablePorts} available now</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-lg shadow-lg p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm">Active Sessions</p>
                  <span className="text-3xl">⚡</span>
                </div>
                <p className="text-4xl font-bold">{stats.activeSessions}</p>
                <p className="text-orange-100 text-xs mt-2">Charging right now</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg shadow-lg p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm">Total Revenue</p>
                  <span className="text-3xl">💰</span>
                </div>
                <p className="text-4xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-green-100 text-xs mt-2">All-time earnings</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Port Status Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2">📊</span>
                  Port Status Distribution
                </h2>
                <div className="space-y-4">
                  {/* Available */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{stats.availablePorts}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.availablePorts / stats.totalPorts) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {((stats.availablePorts / stats.totalPorts) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  {/* In Use */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Use</span>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.inUsePorts}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.inUsePorts / stats.totalPorts) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {((stats.inUsePorts / stats.totalPorts) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Under Maintenance</span>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.underMaintenancePorts}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.underMaintenancePorts / stats.totalPorts) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {((stats.underMaintenancePorts / stats.totalPorts) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  {/* Out of Order */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Out of Order</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{stats.outOfOrderPorts}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.outOfOrderPorts / stats.totalPorts) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {((stats.outOfOrderPorts / stats.totalPorts) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2">📈</span>
                  Today's Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessionsToday}</p>
                    </div>
                    <div className="text-4xl">🔋</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Today</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenueToday)}</p>
                    </div>
                    <div className="text-4xl">💵</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsers}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Stations by Revenue */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">🏆</span>
                Top Stations by Revenue (This Month)
              </h2>
              <div className="space-y-3">
                {stations
                  .sort((a: any, b: any) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((station: any, index: number) => {
                    const maxRevenue = Math.max(...stations.map((s: any) => s.revenue))
                    const percentage = (station.revenue / maxRevenue) * 100
                    
                    return (
                      <div key={station.station_id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{station.operatorname}</span>
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(station.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {station.sessions} sessions • {station.available_ports}/{station.total_ports} ports available
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Stations Tab */}
        {activeTab === 'stations' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Port Management</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Manage all charging ports across stations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAddStationModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center font-medium"
                >
                  <span className="mr-2">➕</span> Add Station
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    fetchAllPorts(e.target.value)
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Ports</option>
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Out of Order">Out of Order</option>
                </select>
                <button 
                  onClick={() => fetchAllPorts(statusFilter)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                >
                  <span className="mr-2">🔄</span> Refresh
                </button>
              </div>
            </div>

            {/* Ports Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPorts.length > 0 ? (
                allPorts.map((port: any) => (
                  <div 
                    key={port.port_id} 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 transition-all hover:shadow-lg border-l-4"
                    style={{
                      borderLeftColor: 
                        port.status === 'Available' ? '#10b981' :
                        port.status === 'In Use' ? '#f59e0b' :
                        port.status === 'Under Maintenance' ? '#eab308' :
                        '#ef4444'
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {port.charging_station.operatorname}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {port.charging_station.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        port.status === 'Available'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : port.status === 'In Use'
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          : port.status === 'Under Maintenance'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {port.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Port ID:</span>
                        <span className="font-medium text-gray-900 dark:text-white">#{port.port_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Connector:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{port.connectortype}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Power:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{port.max_power_output} kW</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Change Status:
                      </label>
                      <select
                        value={port.status}
                        onChange={(e) => updatePortStatus(port.port_id, e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Out of Order">Out of Order</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">🔌</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No ports found
                  </p>
                </div>
              )}
            </div>

            {/* Station Overview Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🏢</span>
                All Charging Stations
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station: any) => (
                  <div key={station.station_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {station.operatorname}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <span className="mr-1">📍</span>
                          {station.location}
                        </p>
                        {station.contact && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                            <span className="mr-1">📞</span>
                            {station.contact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Ports</p>
                        <p className="font-bold text-gray-900 dark:text-white">{station.total_ports}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Available</p>
                        <p className="font-bold text-green-600 dark:text-green-400">{station.available_ports}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Sessions</p>
                        <p className="font-bold text-gray-900 dark:text-white">{station.sessions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Revenue</p>
                        <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                          {formatCurrency(station.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Ports</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Ports that are Out of Order or Under Maintenance
                </p>
              </div>
              <button
                onClick={fetchMaintenancePorts}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
              >
                <span className="mr-2">🔄</span> Refresh
              </button>
            </div>

            <div className="space-y-4">
              {maintenancePorts.length > 0 ? (
                maintenancePorts.map((port: any) => (
                  <div 
                    key={port.port_id} 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">🔌</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {port.charging_station.operatorname}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {port.charging_station.location}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Port ID:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">#{port.port_id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Connector:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{port.connectortype}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Max Power:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{port.max_power_output} kW</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Contact:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {port.charging_station.contact || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            port.status === 'Out of Order'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {port.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => markPortAsAvailable(port.port_id)}
                        className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center font-medium shadow-sm"
                        title="Mark as Available"
                      >
                        <span className="mr-2">✓</span>
                        Mark Available
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center transition-colors">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No ports require maintenance
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    All charging ports are operational
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Current month performance powered by getstationrevenue()
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm">Total Revenue</p>
                  <span className="text-3xl">💰</span>
                </div>
                <p className="text-4xl font-bold">
                  {formatCurrency(stations.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0))}
                </p>
                <p className="text-green-100 text-xs mt-2">Across all stations</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm">Active Stations</p>
                  <span className="text-3xl">🏢</span>
                </div>
                <p className="text-4xl font-bold">{stations.filter((s: any) => s.revenue > 0).length}</p>
                <p className="text-blue-100 text-xs mt-2">Generating revenue</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm">Avg per Station</p>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-4xl font-bold">
                  {formatCurrency(
                    stations.length > 0 
                      ? stations.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0) / stations.length 
                      : 0
                  )}
                </p>
                <p className="text-purple-100 text-xs mt-2">Per charging station</p>
              </div>
            </div>

            {/* Revenue Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2">📈</span>
                  Station Performance
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Station
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ports
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stations.length > 0 ? (
                      stations
                        .sort((a: any, b: any) => b.revenue - a.revenue)
                        .map((station: any, index: number) => {
                          const totalRevenue = stations.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0)
                          const percentage = totalRevenue > 0 ? (station.revenue / totalRevenue) * 100 : 0
                          
                          return (
                            <tr key={station.station_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                                  style={{
                                    backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#e5e7eb',
                                    color: index < 3 ? '#fff' : '#374151'
                                  }}
                                >
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {station.operatorname}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {percentage.toFixed(1)}% of total revenue
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                  {station.sessions}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  charges
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {station.available_ports}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">/{station.total_ports}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  available
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                  {formatCurrency(station.revenue)}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                                  <div 
                                    className="bg-primary-600 dark:bg-primary-400 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">📊</div>
                            <p>No revenue data available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  All reviews from customers across all stations
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchReviews}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                >
                  <span className="mr-2">🔄</span> Refresh
                </button>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                </div>
              </div>
            </div>

            {/* Average Rating Card */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm mb-1">Average Rating</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-5xl font-bold">
                      {reviews.length > 0 
                        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : '0.0'
                      }
                    </span>
                    <span className="text-4xl">⭐</span>
                  </div>
                  <p className="text-yellow-100 text-xs mt-2">Out of 5.0</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-100 space-y-1">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = reviews.filter((r: any) => r.rating === rating).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="w-12">{rating} ⭐</span>
                          <div className="w-24 bg-yellow-600 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <div key={review.review_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.user_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {review.user_name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(review.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {review.station_name}
                            </h4>
                            <span className="text-gray-500 dark:text-gray-400">•</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {review.station_location}
                            </p>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {review.comments}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                          <span className="text-2xl">⭐</span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {review.rating}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center transition-colors">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No reviews yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Reviews from customers will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Station Modal */}
      {showAddStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Charging Station
            </h2>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operator Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStation.operatorname}
                  onChange={(e) => setNewStation({ ...newStation, operatorname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., PowerCharge Station"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={newStation.location}
                  onChange={(e) => setNewStation({ ...newStation, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 123 Main St, City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact *
                </label>
                <input
                  type="text"
                  required
                  value={newStation.contact}
                  onChange={(e) => setNewStation({ ...newStation, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., +1 555-0100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newStation.latitude}
                    onChange={(e) => setNewStation({ ...newStation, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="37.7749"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newStation.longitude}
                    onChange={(e) => setNewStation({ ...newStation, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="-122.4194"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                * Required fields
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStationModal(false)
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
