'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

// Uses review and charging_station tables
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [stations, setStations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    station_id: '',
    rating: 5,
    comments: '',
  })

  useEffect(() => {
    fetchReviews()
    fetchStations()
  }, [])

  const fetchReviews = async () => {
    const response = await fetch('/api/reviews')
    const data = await response.json()
    setReviews(data)
  }

  const fetchStations = async () => {
    const response = await fetch('/api/stations')
    const data = await response.json()
    setStations(data)
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
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Review'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Station
                </label>
                <select
                  required
                  value={formData.station_id}
                  onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.review_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{review.station_name}</h3>
                  <p className="text-sm text-gray-600">{review.station_location}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                  <span className="text-2xl font-bold">{review.rating}/5</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comments}</p>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>By {review.user_name}</span>
                <span>{formatDate(review.date)}</span>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm">Be the first to review a station</p>
          </div>
        )}
      </div>
    </div>
  )
}
