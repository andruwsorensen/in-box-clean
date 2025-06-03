'use client'

import React, { useEffect, useState } from 'react'
import { useStats } from '../contexts/StatsContext'
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Stats {
  unsubscribed: number;
  deleted: number;
}

export function Statistics() {
  const [stats, setStats] = useState<Stats>({ unsubscribed: 0, deleted: 0 });
  const [isResetting, setIsResetting] = useState(false);
  const { triggerRefetch } = useStats();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: new Headers({
          'Content-Type': 'application/json',
          'x-server-token': process.env.SERVER_TOKEN || ''
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const response = await fetch('/api/stats/reset', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          'x-server-token': process.env.SERVER_TOKEN || ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset stats');
      }
      
      await fetchStats(); // Refresh stats after reset
    } catch (error) {
      console.error('Error resetting stats:', error);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [triggerRefetch]);

  return (
    <div className="bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Statistics</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isResetting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Stats
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Statistics</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all your statistics to zero. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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