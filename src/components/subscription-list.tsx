'use client'

import React, { useEffect, useState } from 'react';
import { SubscriptionItem } from './subscription-item'
import { EmailDetails } from '../types'
import { useStats } from '../contexts/StatsContext'
import { useSearchParams } from 'next/navigation';

interface GroupedEmail {
  name: string;
  email: string;
  count: number;
  domain: string;
  from: string;
  date: string;
}

export function SubscriptionList() {
  const [groupedEmails, setGroupedEmails] = useState<GroupedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { incrementTrigger } = useStats();
  const searchParams = useSearchParams();
  const showModal = searchParams.has('showModal');

  useEffect(() => {
    if (!showModal) {
      const fetchEmails = async () => {
        try {
          setIsLoading(true);
          console.log('Fetching email count...');
          const countResponse = await fetch('/api/get-emails/count', {
            headers: new Headers({
              'Content-Type': 'application/json',
              'x-server-token': process.env.SERVER_TOKEN || ''
            })
          });
          if (!countResponse.ok) {
            throw new Error('Failed to fetch email count');
          }
          const { count: emailCount } = await countResponse.json();
          console.log('Total emails:', emailCount);

          const groupedMap = new Map<string, GroupedEmail>();

          const fetchBatch = async (startIndex: number, batchSize: number) => {
            const response = await fetch(`/api/get-emails?startIndex=${startIndex}&batchSize=${batchSize}`, {
              headers: new Headers({
                'Content-Type': 'application/json',
                'x-server-token': process.env.SERVER_TOKEN || ''
              })
            });
            if (!response.ok) {
              throw new Error('Failed to fetch email batch');
            }
            const emails: EmailDetails[] = await response.json();
            console.log(`Fetched ${emails.length} emails (${startIndex} to ${startIndex + batchSize - 1})`);
            const subscribedEmails = emails.filter(email => email.isSubscription);
            subscribedEmails.forEach(email => {
              const key = email.fromEmail;
              if (groupedMap.has(key)) {
                const existingGroup = groupedMap.get(key)!;
                existingGroup.count++;
                if (new Date(email.date) > new Date(existingGroup.date)) {
                  existingGroup.date = email.date;
                }
              } else {
                groupedMap.set(key, {
                  name: email.fromName,
                  email: key,
                  count: 1,
                  domain: email.fromDomain,
                  from: email.from,
                  date: email.date
                });
              }
            });
          };

          // Process in parallel batches
          const batchSize = 1000;
          const parallelBatches = 2; // Number of batches to process in parallel
          
          for (let startIndex = 0; startIndex < emailCount; startIndex += (batchSize * parallelBatches)) {
            const batchPromises = [];
            
            // Create promises for parallel batch fetches
            for (let i = 0; i < parallelBatches; i++) {
              const currentStartIndex = startIndex + (i * batchSize);
              if (currentStartIndex < emailCount) {
                batchPromises.push(fetchBatch(currentStartIndex, batchSize));
              }
            }
            
            // Wait for all parallel batches to complete
            await Promise.all(batchPromises);
          }

          setGroupedEmails(Array.from(groupedMap.values()).sort((a, b) => b.count - a.count));
        } catch (error) {
          console.error('Error fetching emails:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEmails();
    }
  }, [showModal]);

  const handleStatsUpdate = async (deletedCount: number, unsubscribedCount: number) => {
    console.log('handleStatsUpdate', { deletedCount, unsubscribedCount });
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'x-server-token': process.env.SERVER_TOKEN || ''
      }),
      body: JSON.stringify({ deleted: deletedCount, unsubscribed: unsubscribedCount })
    });

    if (!response.ok) {
      throw new Error('Failed to update stats');
    }

    incrementTrigger();
  };

  if (isLoading || showModal) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        {groupedEmails.map((sub, index) => (
          <SubscriptionItem 
            key={index} 
            {...sub} 
            onStatsUpdate={handleStatsUpdate}
          />
        ))}
      </div>
    </div>
  )
}