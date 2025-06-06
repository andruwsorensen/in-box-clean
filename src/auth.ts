import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server";

declare module "next-auth" {
  interface Session {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  }
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/gmail.settings.sharing https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"        }
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      // Logged in users are authenticated, otherwise redirect to root
      if (!auth?.access_token && request.nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/", request.url))
      }
      return !!auth
    },
    jwt({token, account}) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.scope = account.scope
        token.token_type = account.token_type
        token.expiry_date = account.expires_at ? account.expires_at * 1000 : 0
      }
      return token
    },
    async session({ session, token }) {
      session.access_token = token.access_token as string
      session.refresh_token = token.refresh_token as string
      session.scope = token.scope as string
      session.token_type = token.token_type as string
      session.expiry_date = token.expiry_date as number
      session.user.name = token.name as string
      session.user.image = token.picture as string
      session.user.email = token.email as string
      return session
    },
  }
})