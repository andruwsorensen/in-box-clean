'use client'

import { useState, useEffect } from 'react'
import statsData from '../data/stats.json'

export function Statistics() {
  const [stats, setStats] = useState(statsData)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-4xl font-bold">{stats.unsubscribed}</span>
          <span className="text-4xl font-bold">{stats.deleted}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Unsubscribed</span>
          <span>Deleted</span>
        </div>
      </div>
    </div>
  )
}