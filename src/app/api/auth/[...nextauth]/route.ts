import GoogleProvider from "next-auth/providers/google"
import NextAuth from "next-auth"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.settings.basic',
            'https://www.googleapis.com/auth/gmail.settings.sharing',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://mail.google.com/'
          ]
        }
      }
    }),
  ],
})

export { handler as GET, handler as POST }