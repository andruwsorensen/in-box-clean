import Image from "next/image"
import logo from "../public/images/logo.png"
import { ModalWrapper } from './modal-wrapper'
import { CardDescription } from "@/components/ui/card"

export default function WelcomeModal() {
  const handleNext = () => {
    // Handle next action here
    console.log('Welcome modal next button clicked')
  }

  return (
    <ModalWrapper title="Welcome to InBoxClean!" onNext={handleNext}>
      <div className="space-y-4">
        <div className="relative w-full h-40 -mt-6 -mx-6">
          <Image
            src={logo}
            alt="Welcome to InBoxClean"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <CardDescription className="text-center">
          Brief Description with value proposition here. But for now this because I don't know what to write
        </CardDescription>
      </div>
    </ModalWrapper>
  )
}