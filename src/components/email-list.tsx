'use client'
// components/EmailList.tsx
import React, { useEffect, useState } from 'react';
import { EmailDetails } from '../types';

const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<EmailDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/emails');
        const data = await response.json();

        if (response.ok) {
          setEmails(data);
        } else {
          console.error('Failed to fetch emails');
        }
      } catch (error) {
        console.error('An error occurred while fetching emails', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Email List</h2>
      <ul>
        {emails.map((email) => (
          <li key={email.id}>
            <h3>{email.subject}</h3>
            <p>{email.snippet}</p>
            {/* Render other email details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailList;
