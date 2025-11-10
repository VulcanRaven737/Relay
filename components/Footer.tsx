'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-2">
            <Image src="/icon.jpg" alt="Relay Logo" width={32} height={32} className="rounded" />
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Relay</span>
          </div>

          {/* Right side - Copyright and messages */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-2 md:space-y-0 text-sm">
            <span className="hidden md:inline text-gray-500 dark:text-gray-500"></span>
            <p className="text-gray-500 dark:text-gray-500">
              Created with ❤️ by Abhay and Abhinav
            </p>
            <span className="hidden md:inline text-gray-500 dark:text-gray-500">•</span>
            <p className="text-gray-500 dark:text-gray-500 italic">
              Since every website needs a footer :)
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
