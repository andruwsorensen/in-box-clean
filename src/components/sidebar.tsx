'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BellOff, Trash2 } from 'lucide-react'
import Image from 'next/image'
import logo from '../public/images/logo.png'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-black text-white p-4 rounded-r-xl">
      <div className="flex items-center mb-14">
        <Image
          src={logo}
          alt="InBoxClean"
          width={200}
          height={50}
          style= {{
            maxWidth: '70%',
          }}
        />
      </div>
      <nav>
        <Link href="/subscriptions" className={`block w-full text-left py-2 px-4 rounded ${pathname === '/subscriptions' ? 'bg-gray-800' : 'hover:bg-gray-800'} mb-2 flex items-center`}>
          <BellOff className="mr-2" size={20} />
          Unsubscribe
        </Link>
        <Link href="/delete" className={`block w-full text-left py-2 px-4 rounded ${pathname === '/delete' ? 'bg-gray-800' : 'hover:bg-gray-800'} mb-2 flex items-center`}>
          <Trash2 className="mr-2" size={20} />
          Delete
        </Link>
        {/* 
        <Link href="/main/all-emails" className={`block w-full text-left py-2 px-4 rounded ${pathname === '/main/all-emails' ? 'bg-gray-800' : 'hover:bg-gray-800'} flex items-center`}>
          <Mail className="mr-2" size={20} />
          All Emails
        </Link> 
        */}
      </nav>
    </div>
  )
}