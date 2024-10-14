import { ReactNode, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ModalWrapperProps {
  title: string
  children: ReactNode
  onNext: () => void
  isOpen: boolean
}

export function ModalWrapper({ title, children, onNext, isOpen }: ModalWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleNextClick = async () => {
    setIsLoading(true)
    try {
      await onNext()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return null
  } 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleNextClick}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}