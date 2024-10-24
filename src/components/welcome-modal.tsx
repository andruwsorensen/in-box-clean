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

      // Fetch the email details and save to the database in batches
      const batchSize = 250;
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
        const chunkSize = 50;
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

      router.replace('/main');
      router.refresh();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error processing emails:', error);
    }
  }

  const headerContent = (
      <div className="relative w-full h-60">
        <Image
          src={welcomeImage}
          alt="Welcome to InBoxClean"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
  )

  return (
    <ModalWrapper
      title="Welcome to InBoxClean! 🗑️" 
      onNext={handleNext}
      isOpen={isOpen}
      headerContent={headerContent}
    >
      <div className="space-y-4">
        <CardDescription className="text-center text-black mt">
        InBoxClean helps you declutter your inbox by unsubscribing from unwanted emails and deleting old messages.
        </CardDescription>
      </div>
    </ModalWrapper>
  )
}