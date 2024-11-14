'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "../public/images/logo.png"
import landingPageImage from "../public/images/landing-page-image.png"
import { Clock, Trash2, Shield } from "lucide-react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useMediaQuery } from 'react-responsive'

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/main?showModal=true" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black md:flex-row">
      {/* Left side */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative md:px-12">
        {!isSmallScreen && (
          <div className="absolute top-0 left-0 p-8">
            <Image 
              src={logo}
              alt="InBoxClean"
              width={200}
              height={50}
              style={{
                maxWidth: '70%',
              }}
            />
          </div>
        )}
        <div className="w-full max-w-3xl flex flex-col items-center">
          <div className="max-w-3xl">
            <h1 className="text-white text-2xl sm:text-xl md:text-4xl font-bold leading-tight mb-4">
              Unsubscribe, Delete,
              <br />
              and Breathe Easy
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg md:text-xl mb-8">
              Simplify your email management and enjoy a more
              <br />
              organized, stress-free inbox.
            </p>
          </div>
          <Image
            src={landingPageImage}
            alt="App example"
            style={{
              maxWidth: '95%',
              height: 'auto',
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 bg-white rounded-l-3xl flex flex-col items-center justify-center px-8 py-12 relative md:px-12">
        {!isSmallScreen && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800 hover:text-white" onClick={handleGoogleSignIn}>
              Try it now
            </Button>
          </div>
        )}

        <div className="w-full max-w-md space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Simplify Your Inbox</h2>
          
          <div className="space-y-6">
            <FeatureItem 
              icon={Clock} 
              title="Save Time" 
              description="Quickly unsubscribe from unwanted emails"
            />
            <FeatureItem 
              icon={Trash2} 
              title="Reduce Clutter" 
              description="Easily delete and organize your emails"
            />
            <FeatureItem 
              icon={Shield} 
              title="Enhance Privacy" 
              description="Control who has access to your email"
            />
          </div>

          <Button
            className="w-full mt-8 flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-full py-3 px-6 hover:bg-gray-100 transition-colors"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Image
              src="https://img.logo.dev/google.com?token=pk_a9iCu7gpS1uTxP1K1fZeIw"
              alt="Google logo"
              width={24}
              height={24}
              className="mr-2 rounded-full"
            />
            {isLoading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary rounded-full p-2">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}