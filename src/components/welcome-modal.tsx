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
          InBoxClean is an app that helps you declutter your inbox by unsubscribing from unwanted emails and deleting old messages. With its intelligent scanning and easy-to-use interface, you can regain control over your inbox and enjoy a more organized and stress-free email experience.
        </CardDescription>
      </div>
    </ModalWrapper>
  )
}