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

interface ProcessingStatus {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  currentStep: string;
  detailsProgress: number;
  dbProgress: number;
  limitReached: boolean;
}

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<ProcessingStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const EMAIL_LIMIT = 5000;

    async function processEmailBatch(batch: EmailListItem[], batchNumber: number): Promise<unknown[]> {
      setProgress(prev => ({
        ...prev!,
        detailsProgress: 0,
        currentStep: `Processing batch ${batchNumber}`,
        dbProgress: 0
      }));

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

      setProgress(prev => ({
        ...prev!,
          detailsProgress: 100,
          currentStep: `Saving batch ${batchNumber}`,
          dbProgress: 0
      }));

      const dbResponse = await fetch('/api/emails/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchDetails),
      });

      if (!dbResponse.ok) {
          throw new Error(`Failed to save batch ${batchNumber}`);
      }

      setProgress(prev => ({
        ...prev!,
          dbProgress: 100,
        processed: prev!.processed + batch.length
      }));

      return [await dbResponse.json()];
    }

    const handleNext = async () => {
      try {
        setError(null);
        setIsLoading(true);

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
        
        const limitReached = emails.length > EMAIL_LIMIT;
        const limitedEmails = emails.slice(0, EMAIL_LIMIT);

        const response = await fetch('/api/check-ids', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              ids: limitedEmails.map(email => email.id)
          })
      });
      
      const { newIds, count } = await response.json();
      //? Change this if you want it to work on Vercel, probably to 100
        const batchSize = 200;
        const batches = [];
        for (let i = 0; i < count; i += batchSize) {
          batches.push(newIds.slice(i, i + batchSize));
        }

        setProgress({
          processed: 0,
          total: count,
          currentBatch: 0,
          totalBatches: batches.length,
          currentStep: 'Starting',
          detailsProgress: 0,
          dbProgress: 0,
          limitReached
        });
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          await processEmailBatch(batch, i + 1);
          setProgress(prev => ({
            ...prev!,
            currentBatch: i + 1
          }));
        }        

        router.replace('/subscriptions');
        setIsOpen(false);
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
      }
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
            <>
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
              {progress && progress.limitReached && (
                <p className="text-sm text-yellow-600 text-center">
                  Note: We&apos;ve limited processing to the first {EMAIL_LIMIT} emails due to system constraints.
                </p>
              )}
              <p className="text-sm text-center">
                Processed {progress ? progress.processed : 0} of {progress ? progress.total : 0} emails
              </p>
            </>
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