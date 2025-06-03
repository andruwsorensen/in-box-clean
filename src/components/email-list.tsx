'use client'
import React, { useEffect, useState } from 'react';
import { EmailGroup } from './email-group';
import { useStats } from '../contexts/StatsContext';
import { useSearchParams } from 'next/navigation';

interface EmailGroupData {
  fromEmail: string;
  fromName: string;
  fromDomain: string;
  emailCount: number;
  latestEmailDate: string;
}

export function EmailList() {
  const [emailGroups, setEmailGroups] = useState<EmailGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { incrementTrigger } = useStats();
  
  

  useEffect(() => {
    const fetchEmailGroups = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/get-emails/group-emails', {
          headers: new Headers({
            'Content-Type': 'application/json',
            'x-server-token': process.env.SERVER_TOKEN || ''
          })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch email groups');
        }
        const groups: EmailGroupData[] = await response.json();
        setEmailGroups(groups);
      } catch (error) {
        console.error('Error fetching email groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailGroups();
  }, []);

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

  const handleGroupUpdate = (fromEmail: string, deletedCount: number) => {
    setEmailGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.fromEmail === fromEmail) {
          const newCount = group.emailCount - deletedCount;
          // If count reaches 0, filter out this group by returning null
          return newCount > 0 ? { ...group, emailCount: newCount } : null;
        }
        return group;
      }).filter(Boolean) as EmailGroupData[]; // Remove null entries
    });
  };


  if (isLoading) {
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
      {emailGroups.map((group) => (
        <EmailGroup
          key={group.fromEmail}
          name={group.fromName}
          email={group.fromEmail}
          count={group.emailCount}
          domain={group.fromDomain}
          date={group.latestEmailDate}
          onStatsUpdate={handleStatsUpdate}
          onGroupUpdate={handleGroupUpdate}
        />
      ))}
    </div>
  );
}

export default EmailList;