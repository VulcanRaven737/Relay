'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    // Clear any client-side cache
    router.push('/')
    router.refresh()
    // Force a hard reload to clear all state
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  // Don't show navigation while loading
  if (loading) {
    return (
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg rounded-2xl transition-colors">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
              <Image src="/icon.jpg" alt="Relay Logo" width={32} height={32} className="rounded" />
              <span>Relay</span>
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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-lg rounded-2xl transition-colors">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
              <Image src="/icon.jpg" alt="Relay Logo" width={32} height={32} className="rounded" />
              <span>Relay</span>
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
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg rounded-2xl transition-colors">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            <Image src="/icon.jpg" alt="Relay Logo" width={32} height={32} className="rounded" />
            <span>Relay</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            {isAdmin ? (
              // Admin users only see Admin Dashboard
              <NavLink href="/admin" active={isActive('/admin')}>
                Admin Dashboard
              </NavLink>
            ) : (
              // Regular users see all user features
              <>
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
                <NavLink href="/reviews" active={isActive('/reviews')}>
                  Reviews
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
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
