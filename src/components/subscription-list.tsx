'use client'

import React, { useEffect, useState } from 'react';
import { SubscriptionItem } from './subscription-item'
import { EmailDetails } from '../types'

interface GroupedEmail {
  name: string;
  email: string;
  count: number;
  domain: string;
}

export function SubscriptionList() {
  const [groupedEmails, setGroupedEmails] = useState<GroupedEmail[]>([]);

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
      console.log(email.fromDomain);
      const key = email.from;
      if (groupedMap.has(key)) {
        groupedMap.get(key)!.count++;
      } else {
        const [name, domain] = key.split('@');
        groupedMap.set(key, {
          name: name,
          email: key,
          count: 1,
          domain: email.fromDomain
        });
      }
    });

    return Array.from(groupedMap.values()).sort((a, b) => b.count - a.count);
  };

  const handleDeletedCountUpdate = async (count: number) => {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'deleted', count })
    });

    if (!response.ok) {
      throw new Error('Failed to update deleted stats');
    }
  };

  const handleUnsubscribedCountUpdate = async (count: number) => {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'unsubscribed', count })
    });

    if (!response.ok) {
      throw new Error('Failed to update unsubscribed stats');
    }
  };

  console.log('Rendering SubscriptionList with groupedEmails:', groupedEmails);

  return (
    <div className="space-y-4">
      {groupedEmails.map((sub, index) => (
        <SubscriptionItem 
          key={index} 
          {...sub} 
          onDeletedCountUpdate={handleDeletedCountUpdate}
          onUnsubscribedCountUpdate={handleUnsubscribedCountUpdate}
        />
      ))}
    </div>
  )
}