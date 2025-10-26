'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <DashboardView /> : <LandingView />
}

// Marketing landing page for logged-out users
function LandingView() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Welcome to <span className="text-primary-600 dark:text-primary-400">Relay</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The future of EV charging is here. Find stations, manage sessions, and power your journey with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary-600 dark:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Relay?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureHighlight
              icon="🗺️"
              title="Smart Station Discovery"
              description="Find nearby charging stations with real-time availability and filter by connector type"
            />
            <FeatureHighlight
              icon="⚡"
              title="Seamless Sessions"
              description="Start, monitor, and manage your charging sessions with automatic cost calculation"
            />
            <FeatureHighlight
              icon="📊"
              title="Detailed Analytics"
              description="Track your usage patterns, spending, and environmental impact"
            />
            <FeatureHighlight
              icon="💳"
              title="Easy Payments"
              description="Secure payment processing with detailed history and invoice downloads"
            />
            <FeatureHighlight
              icon="🚗"
              title="Vehicle Management"
              description="Register multiple EVs and track battery health and connector compatibility"
            />
            <FeatureHighlight
              icon="⭐"
              title="Community Reviews"
              description="Rate stations and read reviews from other EV drivers"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-12 text-white mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Charging Stations</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Sessions Completed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of EV drivers using Relay every day
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-primary-600 dark:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition transform hover:scale-105"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>
    </div>
  )
}

// Dashboard for logged-in users
function DashboardView() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    activeSessions: 0,
    recentPayments: 0,
    registeredVehicles: 0,
  })

  useEffect(() => {
    // Fetch user stats
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      // Fetch sessions to get active session count
      const sessionsRes = await fetch('/api/sessions')
      const sessionsData = await sessionsRes.json()
      
      // Fetch payments to get recent payments count
      const paymentsRes = await fetch('/api/payments')
      const paymentsData = await paymentsRes.json()
      
      // Fetch vehicles to get registered vehicles count
      const vehiclesRes = await fetch('/api/vehicles')
      const vehiclesData = await vehiclesRes.json()
      
      setStats({
        activeSessions: sessionsData.activeSession ? 1 : 0,
        recentPayments: paymentsData.payments?.length || 0,
        registeredVehicles: Array.isArray(vehiclesData) ? vehiclesData.length : 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        activeSessions: 0,
        recentPayments: 0,
        registeredVehicles: 0,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Sessions"
            value={stats.activeSessions}
            icon="⚡"
            color="primary"
          />
          <StatCard
            title="Recent Payments"
            value={stats.recentPayments}
            icon="💳"
            color="green"
          />
          <StatCard
            title="Registered Vehicles"
            value={stats.registeredVehicles}
            icon="🚗"
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              title="Find Stations"
              description="Locate nearby charging points"
              href="/stations"
              icon="🗺️"
            />
            <ActionCard
              title="Start Session"
              description="Begin charging your vehicle"
              href="/sessions"
              icon="⚡"
            />
            <ActionCard
              title="My Vehicles"
              description="Manage your EV fleet"
              href="/vehicles"
              icon="🚗"
            />
            <ActionCard
              title="View Analytics"
              description="Check your usage stats"
              href="/analytics"
              icon="📊"
            />
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Admin Access</h3>
            <p className="mb-4 opacity-90">You have administrative privileges</p>
            <Link
              href="/admin"
              className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="text-center p-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: string
  color: string
}) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold`}>
          {value}
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 font-medium">{title}</h3>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}
