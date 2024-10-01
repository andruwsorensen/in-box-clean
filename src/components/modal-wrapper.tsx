import { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ModalWrapperProps {
  title: string
  children: ReactNode
  onNext: () => void
}

export function ModalWrapper({ title, children, onNext }: ModalWrapperProps) {
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
            onClick={onNext}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}