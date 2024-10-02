
import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MdThumbUp, MdThumbDown } from 'react-icons/md';

interface SubscriptionItemProps {
  name: string;
  email: string;
  count: number;
  domain: string;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ name, email, count, domain }) => (
  <Card className="mb-4">
    <CardContent className="flex items-center justify-between p-4">
      <div className="flex items-center">
        {domain === 'Unknown' ? (
          <div className="mr-4 w-10 h-10 rounded-full bg-gray-300" />
        ) : (
          <Image
            src={`https://img.logo.dev/${domain}?token=pk_a9iCu7gpS1uTxP1K1fZeIw`}
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
          <h3 className="font-semibold">{name.split('<')[0]}</h3>
          <p className="text-sm text-gray-500">{email.includes('<') ? email.split('<')[1].split('>')[0] : email}</p>
          <p className="text-sm text-gray-500">{count === 1 ? `${count} email` : `${count} emails`}</p>
        </div>
      </div>
      <div>
        <Button variant="outline" className="mr-2">
          <MdThumbUp className="mr-2 text-xl" />  Keep
        </Button>
        <Button variant="outline">
          <MdThumbDown className="mr-2 text-xl" /> Unsubscribe
        </Button>
      </div>
    </CardContent>
  </Card>
);