'use client'

import { SubscriptionItem } from './subscription-item'

export function SubscriptionList() {
  const subscriptions = Array(8).fill({
    name: 'Venmo',
    email: 'venmo@email.com',
    count: 146,
    domain: 'venmo.com',
  })

  return (
    <div className="space-y-4">
      {subscriptions.map((sub, index) => (
        <SubscriptionItem key={index} {...sub} />
      ))}
    </div>
  )
}