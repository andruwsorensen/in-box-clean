'use client'

import React, { useState, createContext, useContext } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { GetStarted } from './get-started'
import { Statistics } from './statistics'

interface StatisticsContextType {
  deletedCount: number
  unsubscribedCount: number
  handleDeletedCountUpdate: (count: number) => void
  handleUnsubscribedCountUpdate: (count: number) => void
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined)

export const useStatistics = () => {
  const context = useContext(StatisticsContext)
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider')
  }
  return context
}

const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deletedCount, setDeletedCount] = useState(0)
  const [unsubscribedCount, setUnsubscribedCount] = useState(0)

  const handleDeletedCountUpdate = (count: number) => {
    setDeletedCount(prevCount => prevCount + count)
  }

  const handleUnsubscribedCountUpdate = (count: number) => {
    setUnsubscribedCount(prevCount => prevCount + count)
  }

  return (
    <StatisticsContext.Provider value={{
      deletedCount,
      unsubscribedCount,
      handleDeletedCountUpdate,
      handleUnsubscribedCountUpdate
    }}>
      {children}
    </StatisticsContext.Provider>
  )
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <StatisticsProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
            <aside className="w-80 bg-white p-4 overflow-y-auto">
              {/* <GetStarted /> // To be implemented later need */}
              <Statistics />
            </aside>
          </div>
        </div>
      </div>
    </StatisticsProvider>
  )
}