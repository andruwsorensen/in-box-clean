'use client'

import Link from 'next/link'
import { BellOff, Trash2, Mail } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="w-64 bg-black text-white p-4">
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rounded">
          IB
        </div>
        <span className="ml-2 text-xl font-semibold">InBoxClean</span>
      </div>
      <nav>
        <Link href="/main" className="block w-full text-left py-2 px-4 rounded hover:bg-gray-800 mb-2 flex items-center">
          <BellOff className="mr-2" size={20} />
          Unsubscribe
        </Link>
        <Link href="/main/delete" className="block w-full text-left py-2 px-4 rounded hover:bg-gray-800 mb-2 flex items-center">
          <Trash2 className="mr-2" size={20} />
          Delete
        </Link>
        <Link href="/main/all-emails" className="block w-full text-left py-2 px-4 rounded hover:bg-gray-800 flex items-center">
          <Mail className="mr-2" size={20} />
          All Emails
        </Link>
      </nav>
    </div>
  )
}