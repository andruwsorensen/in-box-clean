'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deleteEmails: boolean, isUnsubscribe: boolean) => void
  serviceName: string
  isUnsubscribe: boolean
}

export const ConfirmationDialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isUnsubscribe
}) => {
  const [deleteEmails, setDeleteEmails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async (deleteEmails: boolean) => {
    setIsLoading(true)
    await onConfirm(deleteEmails, isUnsubscribe)
    setIsLoading(false)
    onClose()
  }

  const actionText = isUnsubscribe ? 'Unsubscribe' : 'Keep'
  const dialogTitle = isUnsubscribe ? 'Are you sure? 🗑️' : 'Are you sure? 📧'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between">
            <span>Do you also want to delete all {serviceName} emails?</span>
            <Switch
              checked={deleteEmails}
              onCheckedChange={setDeleteEmails}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => handleConfirm(deleteEmails)}
          >
            Yes, {actionText}!
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}