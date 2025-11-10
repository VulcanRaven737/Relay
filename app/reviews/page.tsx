'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import Aurora from '@/components/Aurora'

// Uses review and charging_station tables
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [stations, setStations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    station_id: '',
    rating: 5,
    comments: '',
  })

  useEffect(() => {
    fetchReviews()
    fetchUserStations()
  }, [])

  const fetchReviews = async () => {
    const response = await fetch('/api/reviews')
    const data = await response.json()
    setReviews(data)
  }

  const fetchUserStations = async () => {
    const response = await fetch('/api/stations/user-stations')
    const data = await response.json()
    setStations(data)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setShowForm(false)
    fetchReviews()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage your station reviews</p>
          </div>
          <div className="relative group">
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!isLoading && stations.length === 0}
              className={`px-6 py-2 rounded-lg transition ${
                !isLoading && stations.length === 0
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {showForm ? 'Cancel' : '+ Add Review'}
            </button>
            {!isLoading && stations.length === 0 && !showForm && (
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg z-10">
                You need to use a charging station before you can leave a review
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Write a Review</h2>
            {stations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  You haven't used any charging stations yet.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Start a charging session to be able to leave a review!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Station (only stations you've used)
                  </label>
                  <select
                    required
                    value={formData.station_id}
                    onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a station...</option>
                    {stations.map((station: any) => (
                      <option key={station.station_id} value={station.station_id}>
                        {station.operatorname} - {station.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating: {formData.rating} / 5
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="text-3xl focus:outline-none"
                      >
                        {star <= formData.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.review_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{review.station_name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{review.station_location}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{review.rating}/5</span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comments}</p>

              <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
                <span>{formatDate(review.date)}</span>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't written any reviews yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Start by reviewing a station you've used</p>
          </div>
        )}
      </div>
    </div>
  )
}
