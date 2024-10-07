'use client'

import { useStatistics } from './layout'

export function Statistics() {
  const { unsubscribedCount, deletedCount } = useStatistics()

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-4xl font-bold">{unsubscribedCount}</span>
          <span className="text-4xl font-bold">{deletedCount}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Unsubscribed</span>
          <span>Deleted</span>
        </div>
      </div>
    </div>
  )
}