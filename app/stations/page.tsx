'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Aurora from '@/components/Aurora'
import { calculateEstimatedChargeTime, calculateEstimatedCost, formatDuration, formatCurrency } from '@/lib/utils'
import Fuse from 'fuse.js'

// Uses charging_station and charging_port tables
export default function StationsPage() {
  const router = useRouter()
  const [allStations, setAllStations] = useState<any[]>([])
  const [stations, setStations] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [useGPSSort, setUseGPSSort] = useState(true)
  const [filters, setFilters] = useState({
    connectorType: '',
    availability: 'all',
  })
  const [showMyConnectorsOnly, setShowMyConnectorsOnly] = useState(true)
  const [myConnectorTypes, setMyConnectorTypes] = useState<string[]>([])
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [selectedPort, setSelectedPort] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [startingSession, setStartingSession] = useState(false)

  useEffect(() => {
    requestLocation()
    fetchVehicles()
    fetchStations()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [filters, searchQuery, userLocation, allStations, useGPSSort, showMyConnectorsOnly, myConnectorTypes])

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationError('')
        },
        (error) => {
          setLocationError('Unable to access location. Please enable location services.')
          console.error('Location error:', error)
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        const vehicleList = Array.isArray(data) ? data : []
        setVehicles(vehicleList)
        
        // Extract unique connector types from all user vehicles
        const connectorTypes = Array.from(new Set(vehicleList.map((v: any) => v.connectortype)))
        setMyConnectorTypes(connectorTypes)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations')
      const data = await response.json()
      
      let stationsList = Array.isArray(data) ? data : []
      
      // Add distance to each station if location available
      if (userLocation) {
        stationsList = stationsList.map((station: any) => {
          // Use actual latitude/longitude from database
          if (station.latitude && station.longitude) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              station.latitude,
              station.longitude
            )
            return { ...station, distance }
          }
          return station
        })
      }
      
      setAllStations(stationsList)
    } catch (error) {
      console.error('Error fetching stations:', error)
      setAllStations([])
    }
  }

  // Fuzzy search configuration
  const fuse = useMemo(() => {
    return new Fuse(allStations, {
      keys: ['operatorname', 'location', 'contact'],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      includeScore: true,
    })
  }, [allStations])

  const applyFiltersAndSearch = () => {
    let filteredStations = [...allStations]

    // Apply fuzzy search if query exists
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery)
      filteredStations = searchResults.map(result => result.item)
      setUseGPSSort(false) // Disable GPS sorting when searching
    } else {
      setUseGPSSort(true) // Enable GPS sorting when not searching
    }

    // Apply "My Connectors Only" filter - show stations with at least one matching connector
    if (showMyConnectorsOnly && myConnectorTypes.length > 0) {
      filteredStations = filteredStations.filter((station: any) => 
        station.ports?.some((port: any) => myConnectorTypes.includes(port.connectortype))
      )
    }

    // Apply manual connector type filter (takes precedence if set)
    if (filters.connectorType) {
      filteredStations = filteredStations.filter((station: any) => 
        station.ports?.some((port: any) => port.connectortype === filters.connectorType)
      )
    }

    // Apply availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'Available') {
        filteredStations = filteredStations.filter((station: any) => station.available_ports > 0)
      } else if (filters.availability === 'In Use') {
        filteredStations = filteredStations.filter((station: any) => 
          station.available_ports === 0 && station.total_ports > 0
        )
      }
    }

    // Sort by distance if GPS enabled and location available
    // ALWAYS show all stations (or at least top 50) even if far away
    if (useGPSSort && userLocation && !searchQuery.trim()) {
      // Sort by distance but don't filter by distance - show all stations
      filteredStations = filteredStations
        .map(station => {
          // If station has lat/lng, calculate distance
          if (station.latitude && station.longitude) {
            return station
          }
          // If no lat/lng, assign a large distance so it appears at the end
          return { ...station, distance: 9999 }
        })
        .sort((a: any, b: any) => {
          const distA = a.distance ?? 9999
          const distB = b.distance ?? 9999
          return distA - distB
        })
        .slice(0, 50) // Show top 50 nearest stations instead of just 20
    }

    setStations(filteredStations)
  }

  const fetchNearbyStations = async () => {
    // This function is now replaced by fetchStations + applyFiltersAndSearch
    await fetchStations()
  }

  const handleStartSession = async () => {
    if (!selectedPort || !selectedVehicle) {
      alert('Please select a charging port and vehicle')
      return
    }

    setStartingSession(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          port_id: parseInt(selectedPort),
          vehicle_id: parseInt(selectedVehicle),
        }),
      })

      if (response.ok) {
        router.push('/sessions')
      } else {
        const error = await response.json()
        alert(`Failed to start session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Please try again.')
    } finally {
      setStartingSession(false)
      setSelectedStation(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-40 -z-0 pointer-events:none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Charging Stations</h1>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by station name, location, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              🔍 Searching for "{searchQuery}" • {stations.length} result{stations.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* My Vehicles Connector Filter */}
        {myConnectorTypes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="myConnectorsOnly"
                    checked={showMyConnectorsOnly}
                    onChange={(e) => setShowMyConnectorsOnly(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="myConnectorsOnly" className="ml-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Show only stations compatible with my vehicles
                  </label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {myConnectorTypes.map((type: string) => (
                  <span 
                    key={type}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-semibold rounded-full"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            {showMyConnectorsOnly && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                ✓ Showing stations with {myConnectorTypes.join(', ')} connectors
              </p>
            )}
          </div>
        )}

        {/* Location Status */}
        {locationError && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">⚠️ {locationError}</p>
            <p className="text-sm mt-1">Showing all available stations</p>
            <button 
              onClick={requestLocation}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry location access
            </button>
          </div>
        )}

        {userLocation && useGPSSort && !searchQuery && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">✓ Location detected - Sorted by proximity</p>
            <p className="text-sm mt-1">📍 Showing stations nearest to you first</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connector Type
              </label>
              <select
                value={filters.connectorType}
                onChange={(e) => setFilters({ ...filters, connectorType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="AC Type 2">AC Type 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="AC Type 1">Type 1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Stations</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ connectorType: '', availability: 'all' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Station List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station: any) => (
            <div key={station.station_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{station.operatorname}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {station.location}</p>
                  {station.distance && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
                      🚗 {station.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {station.avg_rating && (
                    <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                      <span className="text-lg font-bold mr-1">{station.avg_rating.toFixed(1)}</span>
                      <span>⭐</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                  <span className="font-medium dark:text-gray-200">{station.contact}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Available Ports:</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {station.available_ports} / {station.total_ports}
                  </span>
                </div>
              </div>

              {/* Port Status */}
              {station.ports && station.ports.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Charging Ports:</p>
                  <div className="space-y-1">
                    {station.ports.map((port: any) => {
                      const isCompatible = myConnectorTypes.includes(port.connectortype)
                      return (
                        <div key={port.port_id} className="flex justify-between items-center text-xs">
                          <span className={`flex items-center ${isCompatible ? 'font-semibold dark:text-white' : 'dark:text-gray-300'}`}>
                            {isCompatible && <span className="mr-1">✓</span>}
                            {port.connectortype} ({port.max_power_output}kW)
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            port.status === 'Available' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            port.status === 'In Use' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {port.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedStation(station)}
                disabled={station.available_ports === 0}
                className="block w-full text-center bg-primary-600 dark:bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {station.available_ports > 0 ? 'Start Session' : 'No Ports Available'}
              </button>
            </div>
          ))}
        </div>

        {stations.length === 0 && !locationError && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery 
                ? `No stations found matching "${searchQuery}"`
                : 'No charging stations available'
              }
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {searchQuery 
                ? 'Try a different search term or clear filters'
                : 'Try adjusting your filters or check back later'
              }
            </p>
          </div>
        )}

        {stations.length === 0 && locationError && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Loading stations...
            </p>
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Start Charging Session
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Station: {selectedStation.operatorname}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Location: {selectedStation.location}</p>
            </div>

            {/* Select Port */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Charging Port
                {myConnectorTypes.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (✓ = Compatible with your vehicle{vehicles.length > 1 ? 's' : ''})
                  </span>
                )}
              </label>
              <select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a port...</option>
                {selectedStation.ports
                  ?.filter((port: any) => port.status === 'Available')
                  .map((port: any) => {
                    const isCompatible = myConnectorTypes.includes(port.connectortype)
                    return (
                      <option key={port.port_id} value={port.port_id}>
                        {isCompatible ? '✓ ' : ''}{port.connectortype} - {port.max_power_output}kW - ₹15/kWh
                      </option>
                    )
                  })}
              </select>
            </div>

            {/* Select Vehicle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map((vehicle: any) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.no_plate} - {vehicle.maker_model} ({vehicle.connectortype})
                  </option>
                ))}
              </select>
            </div>

            {vehicles.length === 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                ⚠️ No vehicles registered. Please add a vehicle first.
              </p>
            )}

            {/* Charging Estimates */}
            {selectedVehicle && selectedPort && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-300 mb-3">
                  Charging Estimates (0% to 100%)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary-700 dark:text-primary-400">Estimated Time</p>
                    <p className="text-lg font-bold text-primary-900 dark:text-primary-200">
                      {(() => {
                        const port = selectedStation.ports?.find((p: any) => p.port_id === parseInt(selectedPort))
                        const powerKW = port?.max_power_output || 6 // Default to 6kW if not found
                        const batterySize = 50 // 50 kWh average
                        const timeHours = batterySize / powerKW
                        const timeMinutes = Math.ceil(timeHours * 60)
                        return `${Math.floor(timeHours)}h ${Math.ceil((timeHours % 1) * 60)}m`
                      })()}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
                      ~{(() => {
                        const port = selectedStation.ports?.find((p: any) => p.port_id === parseInt(selectedPort))
                        const powerKW = port?.max_power_output || 6
                        const batterySize = 50
                        return (batterySize / powerKW).toFixed(1)
                      })()} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-700 dark:text-primary-400">Estimated Cost</p>
                    <p className="text-lg font-bold text-primary-900 dark:text-primary-200">
                      {formatCurrency(50 * 15.0)}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
                      @ ₹15/kWh
                    </p>
                  </div>
                </div>
                <p className="text-xs text-primary-600 dark:text-primary-500 mt-3">
                  💡 Based on 50 kWh battery, {(() => {
                    const port = selectedStation.ports?.find((p: any) => p.port_id === parseInt(selectedPort))
                    return port?.max_power_output || 6
                  })()} kW charging rate
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedStation(null)
                  setSelectedPort('')
                  setSelectedVehicle('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSession}
                disabled={!selectedPort || !selectedVehicle || startingSession}
                className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {startingSession ? 'Starting...' : 'Start Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
