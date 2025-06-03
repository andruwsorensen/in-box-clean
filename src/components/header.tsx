'use client'

import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const getHeaderContent = () => {
    switch (pathname) {
      case '/main/dashboard':
        return {
          title: 'Dashboard 📊',
          description: 'Track your email cleanup progress and subscription management stats.'
        }
      case '/main/settings':
        return {
          title: 'Settings ⛭', 
          description: 'Customize your email management preferences and account settings.'
        }
      case '/delete':
        return {
          title: 'Delete Emails 🗑️',
          description: 'Safely remove individual emails or groups of messages from your inbox.'
        }
      case '/main/all-emails':
        return {
          title: 'All Emails 📥',
          description: 'View and organize all emails in your inbox.'
        }
      case '/subscriptions':
        return {
          title: 'Subscriptions 📧',
          description: 'Manage your email subscriptions and unsubscribe from unwanted emails.'
        }
      default:
        return {
          title: 'Unsubscribe 📧',
          description: 'Simplify your email management and enjoy a more organized, stress-free inbox.'
        }
    }
  }

  const { title, description } = getHeaderContent()

  return (
    <header className="bg-white p-4 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
        <p className="text-sm">
          {description}
        </p>
      </div>
    </header>
  )
}