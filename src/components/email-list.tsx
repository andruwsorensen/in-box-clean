'use client'
// components/EmailList.tsx
import React, { useEffect, useState } from 'react';
import { EmailDetails } from '../types';

const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<EmailDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/emails');
        const data = await response.json();

        if (response.ok) {
          setEmails(data);
        } else {
          setError('Failed to fetch emails');
        }
      } catch (error) {
        setError('An error occurred while fetching emails');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>{error}</div>;
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
