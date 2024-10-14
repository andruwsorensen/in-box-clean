import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { ConfirmationDialog } from './confirmation-dialog'

interface SubscriptionItemProps {
  name: string
  email: string
  count: number
  domain: string
  from: string
  date: string
  onStatsUpdate: (deletedCount: number, unsubscribedCount: number) => void
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ 
  name, 
  email, 
  count, 
  domain,
  from,
  date,
  onStatsUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const [isKeepingSubscription, setIsKeepingSubscription] = useState(false)
  const [isUnsubscribeAction, setIsUnsubscribeAction] = useState(false)

  const handleConfirmation = async (deleteEmails: boolean, isUnsubscribe: boolean) => {
    try {
      let deletedCount = 0;
      let unsubscribedCount = 0;

      if (isUnsubscribe) {
        // Fetch email content
        console.log("from", from);
        const emailContentResponse = await fetch('/api/email-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ from })
        });

        if (!emailContentResponse.ok) {
          throw new Error('Failed to fetch email content');
        }

        const { emailContent } = await emailContentResponse.json();

        // Call unsubscribe API with the fetched email content
        const unsubscribeResponse = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email: from,
            emailContent
          })
        });

        if (!unsubscribeResponse.ok) {
          throw new Error('Failed to unsubscribe');
        }

        const unsubscribeResult = await unsubscribeResponse.json();
        console.log('Unsubscribe result:', unsubscribeResult);
        unsubscribedCount = 1;
      }

      if (deleteEmails) {
        const response = await fetch('/api/emails/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        if (!response.ok) {
          throw new Error('Failed to delete emails');
        }

        const result = await response.json();
        if (result.deletedCount) {
          deletedCount = result.deletedCount;
        }
      }

      if (!isUnsubscribe) {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ from })
        });

        if (!response.ok) {
          throw new Error('Failed to update JSON file');
        }
      }

      // Handle successful confirmation
      console.log(`${isUnsubscribe ? 'Unsubscribed' : 'Kept subscription'} successfully`);
      setIsUnsubscribed(isUnsubscribe);
      setIsKeepingSubscription(!isUnsubscribe);
      setIsUnsubscribeAction(isUnsubscribe);

      onStatsUpdate(deletedCount, unsubscribedCount);

    } catch (error) {
      console.error(`Error ${isUnsubscribe ? 'unsubscribing' : 'keeping subscription'}:`, error);
    } finally {
      setIsDialogOpen(false);
    }
  }

  if (isUnsubscribed || isKeepingSubscription) {
    return null; // Don't render the component if unsubscribed or kept subscription
  }

  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {domain === 'Unknown' ? (
              <div className="mr-4 w-10 h-10 rounded-full bg-gray-300" />
            ) : (
              <Image
                src={`https://img.logo.dev/${domain}?token=pk_a9iCu7gpS1uTxP1K1fZeIw`}
                alt={name}
                width={40}
                height={40}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '10%',
                }}
                className="mr-4"
              />
            )}
            <div>
              <h3 className="font-semibold">{name.split('<')[0]}</h3>
              <p className="text-sm text-gray-500">{email.includes('<') ? email.split('<')[1].split('>')[0] : email}</p>
              <p className="text-sm text-gray-500">
                {count === 1 ? `${count} email` : `${count} emails`}
                &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                Last email {date}
              </p>
            </div>
          </div>
          <div>
            <Button variant="outline" className="mr-2" onClick={() => setIsDialogOpen(true)}>
              <ThumbsUp className="mr-2" />  Keep
            </Button>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(true);
              setIsUnsubscribeAction(true);
            }}>
              <ThumbsDown className="mr-2" /> Unsubscribe
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmation}
        serviceName={name.split('<')[0]}
        isUnsubscribe={isUnsubscribeAction}
      />
    </>
  )
}