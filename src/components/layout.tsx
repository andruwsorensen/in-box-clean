'use client'

import React, { useState, createContext, useContext } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { GetStarted } from './get-started'
import { Statistics } from './statistics'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
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
  )
}