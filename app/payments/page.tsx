'use client'

import { useState, useEffect } from 'react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import Aurora from '@/components/Aurora'

// Uses payment and charging_session tables
export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState<{total: number, pending: number, completed: number}>({ total: 0, pending: 0, completed: 0 })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(Array.isArray(data.payments) ? data.payments : [])
      setStats(data.stats || { total: 0, pending: 0, completed: 0 })
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
      setStats({ total: 0, pending: 0, completed: 0 })
    }
  }

  const handlePayment = async (paymentId: number) => {
    await fetch(`/api/payments/${paymentId}/process`, {
      method: 'POST',
    })
    fetchPayments()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Payment History</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(stats.pending)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.completed)}</p>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">All Payments</h2>
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div
                key={payment.pay_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {payment.station_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(payment.pay_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      payment.pay_status === 'Completed'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : payment.pay_status === 'Pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {payment.pay_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Payment Method</p>
                    <p className="font-medium dark:text-gray-200 flex items-center gap-1">
                      {payment.pay_method === 'Cash' && '💵'}
                      {payment.pay_method === 'Card' && '💳'}
                      {payment.pay_method === 'UPI' && '📱'}
                      {payment.pay_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Energy</p>
                    <p className="font-medium dark:text-gray-200">{parseFloat(payment.energy_consumed || 0).toFixed(2)} kWh</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium dark:text-gray-200">{payment.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Session ID</p>
                    <p className="font-medium dark:text-gray-200">#{payment.session_id}</p>
                  </div>
                </div>

                {payment.pay_status === 'Pending' && (
                  <button
                    onClick={() => handlePayment(payment.pay_id)}
                    className="w-full bg-primary-600 dark:bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold"
                  >
                    Pay Now
                  </button>
                )}

                {payment.pay_status === 'Completed' && (
                  <button
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Download Invoice
                  </button>
                )}
              </div>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No payment history</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Your payments will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
