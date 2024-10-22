import Image from "next/image"
import welcomeImage from "../public/images/welcome-modal-image.png"
import { ModalWrapper } from './modal-wrapper'
import { CardDescription } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { useState } from "react"

interface EmailListItem {
  id: string;
  threadId: string;
  snippet: string;
}

interface DatabaseOperationResult {
  inserted: number;
  updated: number;
}

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

  const handleNext = async () => {
    try {
      console.log('Fetching list of emails...');
      // Fetch the list of emails
      const listResponse = await fetch('/api/emails/list');
      if (!listResponse.ok) {
        throw new Error('Failed to fetch emails');
      }
      const emails: EmailListItem[] = await listResponse.json();
      console.log(`Fetched ${emails.length} emails`);

      // Fetch the email details and save to the database in batches of 100
      const batchSize = 100;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(emails.length / batchSize)}`);
        const detailsResponse = await fetch('/api/emails/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch email details');
        }
        const batchDetails: EmailListItem[] = await detailsResponse.json();
        console.log(`Fetched ${batchDetails.length} email details for batch ${i / batchSize + 1}`);

        // Save the batch to the database in smaller chunks
        const chunkSize = 25;
        for (let j = 0; j < batchDetails.length; j += chunkSize) {
          const chunk = batchDetails.slice(j, j + chunkSize);
          console.log(`Saving chunk ${j / chunkSize + 1} of ${Math.ceil(batchDetails.length / chunkSize)} for batch ${i / batchSize + 1}`);
          const dbResponse = await fetch('/api/emails/db', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk),
          });
          if (!dbResponse.ok) {
            throw new Error('Failed to save emails to database');
          }
          const dbResult: DatabaseOperationResult = await dbResponse.json();
          console.log('Chunk saved to database:', dbResult);
        }
      }

      console.log('Emails processed successfully');

      // Navigate to the main page
      console.log('Navigating to main page...');
      router.replace('/main');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error processing emails:', error);
      // Here you might want to show an error message to the user
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