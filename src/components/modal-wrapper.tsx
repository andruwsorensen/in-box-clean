import { ReactNode, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ModalWrapperProps {
  title: string
  children: ReactNode
  onNext: () => void
  isOpen: boolean
  headerContent?: ReactNode
}

export function ModalWrapper({ title, children, onNext, isOpen, headerContent }: ModalWrapperProps) {
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
        <CardHeader className="flex justify-between">
          {headerContent}
        </CardHeader>
        <CardContent>
        <CardTitle className="text-2xl font-bold text-center mb-3">{title}</CardTitle>
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