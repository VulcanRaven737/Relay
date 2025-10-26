'use client'

import { useState, useEffect } from 'react'
import { formatDateTime, formatDuration, formatCurrency, getSessionStats } from '@/lib/utils'

// Uses charging_session table (with auto-calculated duration/cost via triggers)
export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<any>(null)
  const [liveStats, setLiveStats] = useState<any>(null)
  const [clientStartTime, setClientStartTime] = useState<Date | null>(null)

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // When a new active session is detected, calculate client start time based on DB start_time
    if (activeSession && !clientStartTime) {
      // Parse the database UTC time and calculate how long ago the session started
      const dbStartTime = new Date(activeSession.start_time + 'Z') // Force UTC parsing
      const now = new Date()
      const elapsedMs = now.getTime() - dbStartTime.getTime()
      
      // Set client start time to NOW minus the elapsed time
      // This way the timer will show the correct elapsed time from DB
      setClientStartTime(new Date(now.getTime() - elapsedMs))
    } else if (!activeSession) {
      setClientStartTime(null)
    }
  }, [activeSession, clientStartTime])

  useEffect(() => {
    // Update live stats for active session every second using client-side timer
    if (activeSession && clientStartTime) {
      const updateLiveStats = () => {
        const now = new Date()
        const totalSeconds = Math.floor((now.getTime() - clientStartTime.getTime()) / 1000)
        const durationMinutes = totalSeconds / 60
        
        // Use port's max_power_output if available, otherwise fallback to 0.1 kW/min
        const chargingRate = activeSession.port?.max_power_output 
          ? activeSession.port.max_power_output / 60 // Convert kW to kW per minute
          : 0.1
        
        const energyConsumed = durationMinutes * chargingRate
        const cost = energyConsumed * 15.0
        
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        
        setLiveStats({
          durationMinutes: Math.floor(durationMinutes),
          totalSeconds,
          hours,
          minutes,
          seconds,
          energyConsumed,
          cost,
          timerDisplay: hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`
        })
      }
      
      updateLiveStats()
      const interval = setInterval(updateLiveStats, 1000)
      return () => clearInterval(interval)
    }
  }, [activeSession, clientStartTime])

  const fetchSessions = async () => {
    const response = await fetch('/api/sessions')
    const data = await response.json()
    setSessions(data.sessions)
    setActiveSession(data.activeSession)
  }

  const handleEndSession = async (sessionId: number) => {
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
    })
    fetchSessions()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Charging Sessions</h1>

        {/* Active Session */}
        {activeSession && liveStats && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">⚡ Active Session</h2>
              <span className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                Charging
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-primary-100 dark:text-primary-200 text-sm">Started At</p>
                <p className="text-lg font-semibold">{formatDateTime(activeSession.start_time)}</p>
              </div>
              <div>
                <p className="text-primary-100 dark:text-primary-200 text-sm">Station</p>
                <p className="text-lg font-semibold">{activeSession.station_name}</p>
              </div>
              <div>
                <p className="text-primary-100 dark:text-primary-200 text-sm">Vehicle</p>
                <p className="text-lg font-semibold">{activeSession.vehicle_plate}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <div>
                  <p className="text-primary-100 dark:text-primary-200 text-sm">Duration</p>
                  <p className="text-2xl font-bold font-mono">{liveStats.timerDisplay}</p>
                </div>
                <div>
                  <p className="text-primary-100 dark:text-primary-200 text-sm">Energy Consumed</p>
                  <p className="text-2xl font-bold">{liveStats.energyConsumed.toFixed(2)} kWh</p>
                </div>
                <div>
                  <p className="text-primary-100 dark:text-primary-200 text-sm">Current Cost</p>
                  <p className="text-2xl font-bold">₹{liveStats.cost.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleEndSession(activeSession.session_id)}
                  className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-gray-700 transition"
                >
                  End Session
                </button>
                <p className="text-xs text-primary-100 dark:text-primary-200 mt-2">
                  💵 Payment: Cash (Auto-completed)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Start New Session */}
        {!activeSession && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Start New Session</h2>
            <a
              href="/stations"
              className="block text-center bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold"
            >
              Find a Charging Station
            </a>
          </div>
        )}

        {/* Session History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">Session History</h2>
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div
                key={session.session_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{session.station_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.vehicle_plate} - {session.vehicle_model}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.end_time
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {session.end_time ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Start Time</p>
                    <p className="font-medium dark:text-gray-200">{formatDateTime(session.start_time)}</p>
                  </div>
                  {session.end_time && (
                    <>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Duration</p>
                        <p className="font-medium dark:text-gray-200">{formatDuration(session.duration)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Energy</p>
                        <p className="font-medium dark:text-gray-200">{parseFloat(session.energy_consumed || 0).toFixed(2)} kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Cost</p>
                        <p className="font-medium text-primary-600 dark:text-primary-400">{formatCurrency(session.cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Payment</p>
                        <p className={`font-medium ${
                          session.payment_status === 'Completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {session.payment_status || 'Pending'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No charging sessions yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Start your first session to see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
