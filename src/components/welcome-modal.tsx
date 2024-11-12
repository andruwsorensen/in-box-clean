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

interface ProcessingStatus {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
}

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(true);
    const [progress, setProgress] = useState<ProcessingStatus | null>(null);
    const router = useRouter();

    // Process a batch of emails
    async function processEmailBatch(batch: EmailListItem[]) {
      const detailsResponse = await fetch('/api/emails/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const batchDetails: EmailListItem[] = await detailsResponse.json();
      
      // Process database operations in smaller chunks
      const chunkSize = 50;
      const chunks = [];
      
      for (let i = 0; i < batchDetails.length; i += chunkSize) {
        chunks.push(batchDetails.slice(i, i + chunkSize));
      }
      
      // Process database chunks in parallel (5 at a time)
      const dbChunkResults = [];
      for (let i = 0; i < chunks.length; i += 5) {
        const currentChunks = chunks.slice(i, i + 5);
        const chunkPromises = currentChunks.map(chunk =>
          fetch('/api/emails/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chunk),
          }).then(res => res.json())
        );
        
        const results = await Promise.all(chunkPromises);
        dbChunkResults.push(...results);
      }
      
      return dbChunkResults;
    }

    const handleNext = async () => {
      try {
        // Fetch the list of emails
        const listResponse = await fetch('/api/emails/list');
        if (!listResponse.ok) {
          throw new Error('Failed to fetch emails');
        }
        const emails: EmailListItem[] = await listResponse.json();
        
        // Initialize progress
        setProgress({
          processed: 0,
          total: emails.length,
          currentBatch: 0,
          totalBatches: Math.ceil(emails.length / 250)
        });

        // Process in parallel batches of 250 emails
        const batchSize = 250;
        const batches = [];
        
        for (let i = 0; i < emails.length; i += batchSize) {
          batches.push(emails.slice(i, i + batchSize));
        }

        // Process 3 batches in parallel at a time
        for (let i = 0; i < batches.length; i += 3) {
          const currentBatches = batches.slice(i, i + 3);
          const batchPromises = currentBatches.map((batch, index) => {
            return processEmailBatch(batch).then(result => {
              setProgress(prev => prev && {
                ...prev,
                processed: prev.processed + batch.length,
                currentBatch: i + index + 1
              });
              return result;
            });
          });

          await Promise.all(batchPromises);
        }

        router.replace('/main');
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
          
          {progress && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded">
                <div 
                  className="bg-blue-500 rounded h-2 transition-all duration-200" 
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Processing batch {progress.currentBatch} of {progress.totalBatches}
                <br />
                {progress.processed} of {progress.total} emails processed
              </p>
            </div>
          )}
        </div>
      </ModalWrapper>
    )
}