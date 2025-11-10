# in-box-clean

**in-box-clean** is a web app designed to help users explore, analyze, and declutter their email inboxes—principally Gmail—by leveraging OAuth authentication and modern browser-based workflows. The app provides a friendly UI for querying your mailbox, assessing bulk messages, and taking action, all while keeping your credentials secure.

## Features

- **Gmail OAuth Authentication:** Sign in with your Google account securely (no backend storage of credentials).
- **Inbox Analysis:** Identify patterns by sender, label, or other attributes to inform bulk actions.
- **Bulk Actions:** Select groups of emails for deletion or archiving.
- **Safe Preview:** See affected messages before deletion.
- **Modern UI:** Fast, responsive interface.

## Tech Stack

- **TypeScript & JavaScript:** All application logic and UI.
- **React (Next.js):** Full client app and SSR workflow.
- **TailwindCSS:** Styling and responsive design.
- **Google APIs (OAuth, Gmail):** Direct integration with your mailbox.
- **ESLint, Prettier:** Code style enforcement.
- **Vercel, Node.js:** Deployment and server-side functions (no Python involved).

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/andruwsorensen/in-box-clean.git
   cd in-box-clean
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Google API credentials:**
   - Create OAuth client credentials in Google Cloud Console.
   - Copy/paste credentials into an `.env.local` file.

4. **Run locally:**
   ```bash
   npm run dev
   ```

## Contributing

Pull requests, suggestions, and issues are welcome. See the repo for guidance or open an issue to start a discussion.


_Questions or feedback? Please open an issue._
