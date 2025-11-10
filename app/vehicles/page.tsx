'use client'

import { useState, useEffect } from 'react'
import Aurora from '@/components/Aurora'

// Uses vehicle table
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    no_plate: '',
    maker_model: '',
    batteryhealth: '',
    connectortype: '',
    date_of_purchase: '',
    dist_travelled: 0,
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setVehicles(data)
      } else {
        console.error('Invalid vehicles data:', data)
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setShowForm(false)
        fetchVehicles()
        // Reset form
        setFormData({
          no_plate: '',
          maker_model: '',
          batteryhealth: '',
          connectortype: '',
          date_of_purchase: '',
          dist_travelled: 0,
        })
      } else {
        const error = await response.json()
        console.error('Error creating vehicle:', error)
        alert('Failed to create vehicle: ' + (error.details || error.error))
      }
    } catch (error) {
      console.error('Error submitting vehicle:', error)
      alert('Failed to create vehicle')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Vehicles</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            {showForm ? 'Cancel' : '+ Add Vehicle'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Register New Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.no_plate}
                    onChange={(e) => setFormData({ ...formData, no_plate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DL-01-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maker & Model
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.maker_model}
                    onChange={(e) => setFormData({ ...formData, maker_model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tesla Model 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Battery Health
                  </label>
                  <select
                    required
                    value={formData.batteryhealth}
                    onChange={(e) => setFormData({ ...formData, batteryhealth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="Excellent">Excellent (90-100%)</option>
                    <option value="Good">Good (75-89%)</option>
                    <option value="Fair">Fair (60-74%)</option>
                    <option value="Poor">Poor (&lt;60%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Connector Type
                  </label>
                  <select
                    required
                    value={formData.connectortype}
                    onChange={(e) => setFormData({ ...formData, connectortype: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="AC Type 2">Type 2</option>
                    <option value="CCS">CCS</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="AC Type 1">Type 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Purchase
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_purchase}
                    onChange={(e) => setFormData({ ...formData, date_of_purchase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Distance Travelled (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.dist_travelled}
                    onChange={(e) => setFormData({ ...formData, dist_travelled: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
              >
                Register Vehicle
              </button>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div key={vehicle.vehicle_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vehicle.maker_model}</h3>
                <span className="text-2xl">🚗</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plate:</span>
                  <span className="font-semibold dark:text-gray-200">{vehicle.no_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Battery:</span>
                  <span className="font-semibold dark:text-gray-200">{vehicle.batteryhealth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connector:</span>
                  <span className="font-semibold dark:text-gray-200">{vehicle.connectortype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                  <span className="font-semibold dark:text-gray-200">{vehicle.dist_travelled.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No vehicles registered yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Add your first vehicle to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
