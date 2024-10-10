'use client'

import React, { useEffect, useState } from 'react';
import { SubscriptionItem } from './subscription-item'
import { EmailDetails } from '../types'
import { useStats } from '../contexts/StatsContext'

interface GroupedEmail {
  name: string;
  email: string;
  count: number;
  domain: string;
  from: string;
}

export function SubscriptionList() {
  const [groupedEmails, setGroupedEmails] = useState<GroupedEmail[]>([]);
  const { incrementTrigger } = useStats();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        console.log('Fetching emails...');
        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
        const emails: EmailDetails[] = await response.json();
        console.log('Fetched emails:', emails);
        const subscribedEmails = emails.filter(email => email.isSubscription);
        const grouped = groupEmailsBySender(subscribedEmails);
        console.log('Grouped emails:', grouped);
        setGroupedEmails(grouped);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  const groupEmailsBySender = (emails: EmailDetails[]): GroupedEmail[] => {
    const groupedMap = new Map<string, GroupedEmail>();

    emails.forEach(email => {
      const key = email.fromEmail;
      if (groupedMap.has(key)) {
        groupedMap.get(key)!.count++;
      } else {
        groupedMap.set(key, {
          name: email.fromName,
          email: key,
          count: 1,
          domain: email.fromDomain,
          from: email.from
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

  return (
    <div className="space-y-4">
      {groupedEmails.map((sub, index) => (
        <SubscriptionItem 
          key={index} 
          {...sub} 
          onStatsUpdate={handleStatsUpdate}
        />
      ))}
    </div>
  )
}