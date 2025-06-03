"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

interface Email {
  id: string
  fromName: string
  subject: string
  snippet: string
  date: string
  isSelected?: boolean
}

interface EmailGroupProps {
  key: string
  name: string
  email: string
  count: number
  domain: string
  date: string
  onStatsUpdate: (deletedCount: number, unsubscribedCount: number) => void
  onGroupUpdate: (fromEmail: string, deletedCount: number) => void
}

const formatTimeSince = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;

  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  if (weeks > 0) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
};

export const EmailGroup: React.FC<EmailGroupProps> = ({ 
  name, 
  email, 
  count, 
  domain,
  date, 
  onStatsUpdate, 
  onGroupUpdate
}) => {
  const [expanded, setExpanded] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [sortNewestFirst, setSortNewestFirst] = useState(true)

  const toggleExpand = async () => {
    if (!expanded && emails.length === 0) {
      await fetchEmails()
    }
    setExpanded(!expanded)
  }


  const sortEmails = (emailsToSort: Email[]) => {
    return [...emailsToSort].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });
  };

  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/get-emails/email-groups?fromEmail=${email}`)
      if (!response.ok) throw new Error("Failed to fetch emails")
      const data = await response.json()
      setEmails(sortEmails(data))
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortToggle = () => {
    setSortNewestFirst(!sortNewestFirst);
    setEmails(sortEmails(emails));
  };

  const handleSelectEmail = (id: string) => {
    console.log('handleSelectEmail', { id })
    const newSelected = new Set(selectedEmails)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedEmails(newSelected)
    setSelectAll(newSelected.size === emails.length)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(emails.map((email) => email.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleDeleteAll = async () => {
    try {
      const idsToDelete = selectedEmails.size > 0 
        ? Array.from(selectedEmails) 
        : emails.map((email) => email.id);

      if (selectedEmails.size > 0) {
        const response = await fetch('/api/emails/delete-selected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedEmails) })
        });

        if (!response.ok) {
          throw new Error('Failed to delete selected emails');
        }

        const result = await response.json();
        onStatsUpdate(selectedEmails.size, 0);
        onGroupUpdate(email, selectedEmails.size);  // Update group count

        // Update local state
        setEmails(emails.filter((email) => !selectedEmails.has(email.id)));
        setSelectedEmails(new Set());
      } else {
        // Delete all emails from this sender
        const response = await fetch('/api/emails/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
          throw new Error('Failed to delete emails');
        }

        const result = await response.json();
        onStatsUpdate(result.deletedCount, 0);
        onGroupUpdate(email, count);  // This will remove the group since all emails are deleted

        // Update local state
        setEmails([]);
        setExpanded(false);
      }
    } catch (error) {
      console.error("Error deleting emails:", error);
    }
  };



  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {domain === 'Unknown' ? (
              <div className="mr-4 w-10 h-10 rounded-full bg-gray-300" />
            ) : (
              <Image
                src={domain === 'Loading...' ? 'https://via.placeholder.com/40' : `https://img.logo.dev/${domain}?token=pk_a9iCu7gpS1uTxP1K1fZeIw`}
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
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-gray-500">{email}</p>
              <p className="text-sm text-gray-500">
                {count === 1 ? `${count} email` : `${count} emails`}
                &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                Last email {formatTimeSince(date)}
              </p>
            </div>
          </div>
          <div className="flex">
            <Button variant="outline" className="mr-2" onClick={toggleExpand}>
              {expanded ? <ChevronUp className="mr-2" /> : <ChevronDown className="mr-2" />}
              {expanded ? 'Hide' : 'Show'} Emails
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll}>
              <Trash2 className="mr-2" /> Delete {selectedEmails.size > 0 ? 'Selected' : 'All'}
            </Button>
          </div>
        </div>
      </CardContent>

      {expanded && (
        <div className="border-t">
          {isLoading ? (
            <div className="p-4 text-center">Loading emails...</div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-500">
                    Select All ({emails.length} emails)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSortToggle}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortNewestFirst ? 'Newest First' : 'Oldest First'}
                </Button>
              </div>
              <div className="space-y-4">
                {emails.map((email) => (
                <div key={email.id} className="flex items-start p-4 rounded-lg border hover:bg-gray-50">
                  <Checkbox
                    checked={selectedEmails.has(email.id)}
                    onCheckedChange={() => handleSelectEmail(email.id)}
                    className="mr-4 mt-1"
                  />
                  <div className="flex-1 min-w-0"> {/* Add min-w-0 to enable truncation */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium truncate flex-1">
                        {email.subject}
                      </span>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatTimeSince(email.date)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2"> {/* Use line-clamp-2 for 2 lines */}
                      {email.snippet}
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}