'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import logo from "../public/images/logo.png"
import { useState } from "react"

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth');
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12">
        <div className="flex items-center mb-8">
        <Image 
          src={logo}
          alt="InBoxClean"
          style={{
            maxWidth: '60%',
            height: 'auto',
          }}
        />
        </div>
        <h1 className="text-white text-5xl font-bold leading-tight mb-4">
          Unsubscribe, Delete,
          <br />
          and Breathe Easy
        </h1>
        <p className="text-gray-400 text-xl">
          Simplify your email management and enjoy a more
          <br />
          organized, stress-free inbox.
        </p>
      </div>

      {/* Right side */}
      <div className="flex-1 bg-white rounded-l-3xl flex flex-col justify-center px-12 py-12 relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link href="/main">
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
              Try it now
            </Button>
          </Link>
        </div>
        <div className="mb-8">
          <span className="text-6xl" role="img" aria-label="Waving hand">👋</span>
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Unsubscribe, Delete,
          <br />
          and Breathe Easy
        </h1>
        <p className="text-gray-600 text-xl mb-8">
          Simplify your email management and enjoy a more
          <br />
          organized, stress-free inbox.
        </p>
        <Button
          className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-full py-3 px-6 hover:bg-gray-100 transition-colors w-64"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img src="https://img.logo.dev/google.com?token=pk_a9iCu7gpS1uTxP1K1fZeIw" alt="Google logo" width={24} height={24} className="mr-2 rounded-full" />
          {isLoading ? 'Loading...' : 'Sign in with Google'}
        </Button>
        <a href="#" className="text-sm text-gray-500 mt-4 hover:underline">
          Terms?
        </a>
      </div>
    </div>
  )
}