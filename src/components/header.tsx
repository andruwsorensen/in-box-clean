'use client'

import { Settings, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-gray-500">
          Simplify your email management and enjoy a more organized, stress-free inbox.
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
        </button>
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          C
        </div>
      </div>
    </header>
  )
}