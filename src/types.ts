export interface EmailDetails {
    id: string;
    threadId: string;
    subject: string;
    snippet: string;
    date: string;
    from: string;
    fromDomain: string;
    isSubscription: boolean;
}