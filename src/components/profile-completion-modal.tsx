'use client'

import { useState } from 'react'
import { ModalWrapper } from './modal-wrapper'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardDescription } from "@/components/ui/card"

export function ProfileCompletionModalComponent() {
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')

  const handleNext = () => {
    // Handle form submission here
    console.log('Submitted:', { name, lastname })
  }

  return (
    <ModalWrapper title="Complete your Profile 📝" onNext={handleNext}>
      <CardDescription className="text-center mb-4">
        Fill it for a better experience!
      </CardDescription>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="What is your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastname">Lastname</Label>
          <Input
            id="lastname"
            placeholder="What is your lastname?"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>
      </form>
    </ModalWrapper>
  )
}