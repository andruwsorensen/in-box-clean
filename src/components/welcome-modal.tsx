import Image from "next/image"
import welcomeImage from "../public/images/welcome-modal-image.png"
import { ModalWrapper } from './modal-wrapper'
import { CardDescription } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { useState } from "react"

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

  const handleNext = async () => {
    try {
      const response = await fetch('/api/emails');
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      router.replace('/main');
      router.refresh();
      setIsOpen(false);
   } catch (error) {
    console.log('Error fetching emails:', error);
   }
  }

  return (
    <ModalWrapper
      title="Welcome to InBoxClean!" 
      onNext={handleNext}
      isOpen={isOpen}
    >
      <div className="space-y-4">
        <div className="relative w-full h-40 -mt-6 -mx-6">
          <Image
            src={welcomeImage}
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