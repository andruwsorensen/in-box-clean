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
          const countResponse = await fetch('/api/subscriptions/count');
          if (!countResponse.ok) {
            throw new Error('Failed to fetch email count');
          }
          const { count: emailCount } = await countResponse.json();
          console.log('Total emails:', emailCount);

          const fetchBatch = async (startIndex: number, batchSize: number) => {
            const response = await fetch(`/api/subscriptions?startIndex=${startIndex}&batchSize=${batchSize}`);
            if (!response.ok) {
              throw new Error('Failed to fetch email batch');
            }
            const emails: EmailDetails[] = await response.json();
            console.log(`Fetched ${emails.length} emails (${startIndex} to ${startIndex + batchSize - 1})`);
            const subscribedEmails = emails.filter(email => email.isSubscription);
            const grouped = groupEmailsBySender(subscribedEmails);
            setGroupedEmails(prevEmails => [...prevEmails, ...grouped]);
          };

          const batchSize = 500;
          for (let startIndex = 0; startIndex < emailCount; startIndex += batchSize) {
            await fetchBatch(startIndex, batchSize);
          }
        } catch (error) {
          console.error('Error fetching emails:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEmails();
    }
  }, [showModal]);

  const groupEmailsBySender = (emails: EmailDetails[]): GroupedEmail[] => {
    const groupedMap = new Map<string, GroupedEmail>();

    emails.forEach(email => {
      const key = email.fromEmail;
      if (groupedMap.has(key)) {
        groupedMap.get(key)!.count++;
        // Update the date if the email is older than the current one
        if (new Date(email.date) > new Date(groupedMap.get(key)!.date)) {
          groupedMap.get(key)!.date = email.date;
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

    return Array.from(groupedMap.values()).sort((a, b) => b.count - a.count);
  };

  const handleStatsUpdate = async (deletedCount: number, unsubscribedCount: number) => {
    console.log('handleStatsUpdate', { deletedCount, unsubscribedCount });
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deleted: deletedCount, unsubscribed: unsubscribedCount })
    });

    if (!response.ok) {
      throw new Error('Failed to update stats');
    }

    incrementTrigger();
  };

  console.log('Rendering SubscriptionList with groupedEmails:', groupedEmails);

  if (isLoading || showModal) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 12 }, (_, i) => (
          <SubscriptionItem
            key={i}
            name="Loading..."
            email="Loading..."
            count={0}
            domain="Loading..."
            from="Loading..."
            date="Loading..."
            onStatsUpdate={handleStatsUpdate}
          />
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