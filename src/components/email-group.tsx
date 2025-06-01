"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { ConfirmationDialog } from './confirmation-dialog'

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
  onDelete: (ids: string[]) => Promise<void>
}

export const EmailGroup: React.FC<EmailGroupProps> = ({ 
  name, 
  email, 
  count, 
  domain,
  date, 
  onStatsUpdate, 
  onDelete
 }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const toggleExpand = async () => {
    if (!expanded && emails.length === 0) {
      await fetchEmails()
    }
    setExpanded(!expanded)
  }

  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/get-emails/email-groups?fromEmail=${email}`)
      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }
      const data = await response.json()
      setEmails(data)
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectEmail = (id: string) => {
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
      // If nothing is selected, delete all emails from this sender
      const idsToDelete = selectedEmails.size > 0 ? Array.from(selectedEmails) : emails.map((email) => email.id)

      await onDelete(idsToDelete)

      // Remove deleted emails from the list
      if (selectedEmails.size > 0) {
        setEmails(emails.filter((email) => !selectedEmails.has(email.id)))
        setSelectedEmails(new Set())
      } else {
        setEmails([])
        setExpanded(false)
      }
    } catch (error) {
      console.error("Error deleting emails:", error)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-3xl">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-500">{email}</p>
            <p className="text-gray-500">
              {count} emails <button className="text-gray-500 underline">more info?</button>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={toggleExpand}>
              <Eye className="h-5 w-5" />
              See Emails
            </Button>
            <Button variant="destructive" className="flex items-center gap-2" onClick={handleDeleteAll}>
              <Trash2 className="h-5 w-5" />
              Delete All
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {isLoading ? (
            <div className="p-4 text-center">Loading emails...</div>
          ) : (
            <div>
              {emails.map((email) => (
                <div key={email.id} className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50">
                  <Checkbox
                    checked={selectedEmails.has(email.id)}
                    onCheckedChange={() => handleSelectEmail(email.id)}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold">{name}</span>
                      <span className="ml-auto text-gray-500">{email.date}</span>
                    </div>
                    <div className="font-medium">{email.subject}</div>
                    <div className="text-gray-500 truncate">{email.snippet}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
