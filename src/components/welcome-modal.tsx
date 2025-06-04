import Image from "next/image"
import welcomeImage from "../public/images/welcome-modal-image.png"
import { ModalWrapper } from './modal-wrapper'
import { CardDescription } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { useState } from "react"

const USE_BATCHES = false; // Set to false to process all at once
const USE_CHUNKS = false;  // Set to false to send all details to DB at once

interface EmailListItem {
  id: string;
  threadId: string;
  snippet: string;
}

interface ProcessingStatus {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
}

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<ProcessingStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Process a batch of emails
    async function processEmailBatch(batch: EmailListItem[]) {
      const detailsResponse = await fetch('/api/emails/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'x-server-token': process.env.SERVER_TOKEN || ''
        },
        body: JSON.stringify(batch),
      });
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const batchDetails: EmailListItem[] = await detailsResponse.json();

      if (!USE_CHUNKS) {
        // Send all details to DB at once
        const dbResponse = await fetch('/api/emails/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batchDetails),
        });
        return [await dbResponse.json()];
      }

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
        setError(null);
        setIsLoading(true);

        // Fetch the list of emails
        console.log('Fetching emails list...');
        const listResponse = await fetch('/api/emails/list', {
          headers: new Headers({
            'Content-Type': 'application/json',
            'x-server-token': process.env.SERVER_TOKEN || ''
          })
        });
        if (!listResponse.ok) {
          throw new Error('Failed to fetch emails');
        }
        const emails: EmailListItem[] = await listResponse.json();
        
        // Limit to 5000 emails
        // const limitedEmails = emails.slice(0, 5000);

        // Only get emails not already in the database
        const response = await fetch('/api/check-ids', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              ids: emails.map(email => email.id)
          })
      });
      
      const { newIds, count } = await response.json();

        // Initialize progress
        setProgress({
          processed: 0,
          total: count,
          currentBatch: 0,
          totalBatches: USE_BATCHES ? Math.ceil(count / 500) : 1
        });

        if (!USE_BATCHES) {
          // Process all emails in one go
          await processEmailBatch(newIds);
        } else {
          // Process in parallel batches of 500 emails
          const batchSize = 500;
          const batches = [];
          for (let i = 0; i < count; i += batchSize) {
            batches.push(newIds.slice(i, i + batchSize));
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
        }

        router.replace('/subscriptions');
        setIsOpen(false);
        router.refresh();
      } catch (error) {
        // ... unchanged ...
      } finally {
        setIsLoading(false);
      }
    }

    const headerContent = isLoading ? null : (
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
        title={isLoading ? "Scanning for emails 📧" : "Welcome to InBoxClean! 🗑️"} 
        onNext={handleNext}
        isOpen={isOpen}
        headerContent={headerContent}
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-orange-500"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 - (progress ? (progress.processed / progress.total) : 0) * 2 * Math.PI * 45}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-semibold">{Math.round((progress ? (progress.processed / progress.total) : 0) * 100)}%</span>
              </div>
            </div>
          ) : (
            <CardDescription className="text-center text-black mt">
              {error ? (
                <div className="text-red-500">
                  Error: {error}
                </div>
              ) : (
                "InBoxClean helps you declutter your inbox by unsubscribing from unwanted emails and deleting old emails."
              )}
            </CardDescription>
          )}
        </div>
      </ModalWrapper>
    )
}