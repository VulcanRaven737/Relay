'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { useAuth } from './AuthProvider'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isAdmin, logout, loading } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Don't show navigation while loading
  if (loading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ⚡ Relay
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Not authenticated - show minimal nav
  if (!isAuthenticated) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ⚡ Relay
            </Link>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Authenticated - show full nav with role-based items
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ⚡ Relay
          </Link>

          <div className="hidden md:flex space-x-6">
            <NavLink href="/stations" active={isActive('/stations')}>
              Stations
            </NavLink>
            <NavLink href="/sessions" active={isActive('/sessions')}>
              Sessions
            </NavLink>
            <NavLink href="/vehicles" active={isActive('/vehicles')}>
              Vehicles
            </NavLink>
            <NavLink href="/payments" active={isActive('/payments')}>
              Payments
            </NavLink>
            <NavLink href="/analytics" active={isActive('/analytics')}>
              Analytics
            </NavLink>
            {isAdmin && (
              <NavLink href="/admin" active={isActive('/admin')}>
                Admin
              </NavLink>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/reviews"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              Reviews
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`${
        active
          ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
      } pb-1 transition`}
    >
      {children}
    </Link>
  )
}
