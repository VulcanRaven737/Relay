'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import ThemeToggle from '@/components/ThemeToggle'
import Aurora from '@/components/Aurora'
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
    <div className="relative overflow-hidden min-h-screen">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-50 -z-0 pointer-events-none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
              <Image src="/icon.jpg" alt="Relay Logo" width={80} height={80} className="rounded-lg" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary-400 to-green-400 bg-clip-text text-transparent leading-tight pb-2">
              Relay
            </h1>
          </div>
          <p className="text-xl md:text-3xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The future of EV charging is here. Find stations, manage sessions, and power your journey with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-800 dark:bg-gray-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">
            Why Choose Relay?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-base max-w-2xl mx-auto">
            Everything you need to manage your electric vehicle charging experience
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureHighlight
              icon="🗺️"
              title="Smart Station Discovery"
              description="Find nearby charging stations with real-time availability and filter by connector type"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureHighlight
              icon="⚡"
              title="Seamless Sessions"
              description="Start, monitor, and manage your charging sessions with automatic cost calculation"
              gradient="from-primary-500 to-green-500"
            />
            <FeatureHighlight
              icon="📊"
              title="Detailed Analytics"
              description="Track your usage patterns, spending, and environmental impact"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureHighlight
              icon="💳"
              title="Easy Payments"
              description="Secure payment processing with detailed history and invoice downloads"
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureHighlight
              icon="🚗"
              title="Vehicle Management"
              description="Register multiple EVs and track battery health and connector compatibility"
              gradient="from-red-500 to-pink-500"
            />
            <FeatureHighlight
              icon="⭐"
              title="Community Reviews"
              description="Rate stations and read reviews from other EV drivers"
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-700 dark:to-green-700 rounded-3xl p-10 md:p-12 text-white mb-16 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Trusted by Thousands</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-base md:text-lg opacity-90">Charging Stations</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-base md:text-lg opacity-90">Active Users</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-base md:text-lg opacity-90">Sessions Completed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 md:p-12 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900 dark:text-white">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of EV drivers using Relay every day
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-500 dark:to-green-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Create Your Free Account →
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard for logged-in users
function DashboardView() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeSessions: 0,
    recentPayments: 0,
    registeredVehicles: 0,
  })

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (isAdmin) {
      router.push('/admin')
      return
    }
    
    // Fetch user stats for regular users
    fetchUserStats()
  }, [isAdmin, router])

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
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-40 -z-0 pointer-events-none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
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
  gradient,
}: {
  icon: string
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
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
