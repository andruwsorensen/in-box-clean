import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // For API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Check if it's a server-side request
    const serverToken = request.headers.get('x-server-token')
    const isServerRequest = serverToken === process.env.SERVER_TOKEN

    // Check if user is authenticated
    const session = await auth()
    
    // Allow access only if it's a server request or user is authenticated
    if (!isServerRequest && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // For non-API routes (your existing middleware logic)
  const session = await auth()
  
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, etc.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}