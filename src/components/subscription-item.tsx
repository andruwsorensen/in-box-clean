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
  onDeletedCountUpdate: (count: number) => void
  onUnsubscribedCountUpdate: (count: number) => void
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ 
  name, 
  email, 
  count, 
  domain,
  onDeletedCountUpdate,
  onUnsubscribedCountUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const [isKeepingSubscription, setIsKeepingSubscription] = useState(false)
  const [isUnsubscribeAction, setIsUnsubscribeAction] = useState(false)

  const handleConfirmation = async (deleteEmails: boolean, isUnsubscribe: boolean) => {
    try {
      if (deleteEmails) {
        const response = await fetch('/api/emails/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        if (!response.ok) {
          throw new Error('Failed to unsubscribe and delete emails');
        }

        const result = await response.json();
        if (result.deletedCount) {
          onDeletedCountUpdate(result.deletedCount);
        }
      }

      // Handle successful confirmation
      console.log(`${isUnsubscribe ? 'Unsubscribed' : 'Kept subscription'} successfully`);
      setIsUnsubscribed(isUnsubscribe);
      setIsKeepingSubscription(!isUnsubscribe);
      setIsUnsubscribeAction(isUnsubscribe);

      if (isUnsubscribe) {
        onUnsubscribedCountUpdate(1);
      }
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
              <p className="text-sm text-gray-500">{count === 1 ? `${count} email` : `${count} emails`}</p>
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