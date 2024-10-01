# In-Box Clean: Gmail Subscription Manager

In-Box Clean is a Next.js application designed to help users manage their Gmail subscriptions efficiently. It provides an intuitive interface for viewing, organizing, and unsubscribing from email subscriptions.

## Features

- OAuth2 authentication with Gmail
- View and manage email subscriptions
- Unsubscribe from unwanted newsletters
- User-friendly interface built with Next.js and Tailwind CSS

## Getting Started

To run In-Box Clean locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/in-box-clean.git
   cd in-box-clean
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app`: Contains the main application pages and routing
- `src/components`: Reusable React components
- `src/lib`: Utility functions and API handlers
- `src/hooks`: Custom React hooks
- `public`: Static assets

## Technologies Used

- [Next.js](https://nextjs.org/): React framework for building the application
- [Tailwind CSS](https://tailwindcss.com/): For styling
- [shadcn/ui](https://ui.shadcn.com/): UI component library
- [Google Gmail API](https://developers.google.com/gmail/api): For accessing and managing Gmail data

## Contributing

Contributions to In-Box Clean are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
