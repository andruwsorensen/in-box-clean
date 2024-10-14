'use client'

import { useState, useEffect } from 'react'
import { ModalWrapper } from './modal-wrapper'
import { CardDescription } from "@/components/ui/card"

export function ScanningModal() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const newProgress = oldProgress + 1
        return newProgress
      })
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleNext = () => {
    console.log('Scanning completed')
    // Add logic to move to the next step
  }

  const circumference = 2 * Math.PI * 45 // 45 is the radius of the circle
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <ModalWrapper 
      title="Scanning your inbox 🔎"
      onNext={handleNext}
      isOpen={true}
    >
      <div className="space-y-6">
        <CardDescription className="text-center">
          We are analyzing your inbox to identify potential unsubscribe candidates.
        </CardDescription>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className="text-orange-500"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}