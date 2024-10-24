'use client'

import React, { useEffect, useState } from 'react'
import { useStats } from '../contexts/StatsContext'

interface Stats {
  unsubscribed: number;
  deleted: number;
}

export function Statistics() {
  const [stats, setStats] = useState<Stats>({ unsubscribed: 0, deleted: 0 });
  const { triggerRefetch } = useStats();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [triggerRefetch]);

  return (
    <div className="bg-gray-100 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <div className="flex justify-between space-x-2">
        <div className="bg-white rounded-lg p-5 shadow-md flex-1">
          <div className="text-4xl font-bold mb-2">{stats.unsubscribed}</div>
          <div className="text-sm text-gray-500">Unsubscribed</div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md flex-1">
          <div className="text-4xl font-bold mb-2">{stats.deleted}</div>
          <div className="text-sm text-gray-500">Deleted</div>
        </div>
      </div>
    </div>
  )
}