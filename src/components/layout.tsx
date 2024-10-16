'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from './sidebar'
import { Header } from './header'
// import { GetStarted } from './get-started'
import { Statistics } from './statistics'
import { StatsProvider } from '../contexts/StatsContext'
import WelcomeModal from './welcome-modal'

interface LayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkPrerequisites = async () => {
      try {
        // const session = await auth()
        // if (!session) {
        //   router.push('/');
        //   return;
        // }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking prerequisites:', error);
        router.push('/');
      }
    };

    checkPrerequisites();
    setShowModal(searchParams.has('showModal'));
  }, [searchParams, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StatsProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          {!showModal && (
            <div className="flex-1 flex overflow-hidden">
              <main className="flex-1 overflow-y-auto p-4">
                {children}
              </main>
              <aside className="w-80 bg-white p-4 overflow-y-auto">
                {/* <GetStarted /> // To be implemented later need */}
                <Statistics />
              </aside>
            </div>
          )}
        </div>
      </div>
      {showModal && <WelcomeModal />}
    </StatsProvider>
  )
}

export default function Layout({ children }: LayoutProps,) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}
