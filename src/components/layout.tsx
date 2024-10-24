'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from './sidebar'
import { Header } from './header'
import { StatsProvider } from '../contexts/StatsContext'
import WelcomeModal from './welcome-modal'
import RightSidebar from './right-sidebar'
import { SessionProvider } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutProps) {
  const [showModal, setShowModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setShowModal(searchParams.has('showModal'));
  }, [searchParams, router]);

  return (
    <SessionProvider>
    <StatsProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
        <RightSidebar />
      </div>
      {showModal && <WelcomeModal />}
    </StatsProvider>
    </SessionProvider>
  )
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}