import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Allow auth-related API routes to pass through
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // For other API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    try {
      // Check if it's a server-side request
      const serverToken = request.headers.get('x-server-token')
      const isServerRequest = serverToken === process.env.SERVER_TOKEN

      // Check if user is authenticated - wrap in try/catch
      const session = await auth()
      
      // Allow access only if it's a server request or user is authenticated
      if (!isServerRequest && !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.next()
    } catch (error) {
      // During build or if auth fails, allow the request to continue
      console.log('Auth check failed in middleware:', error)
      return NextResponse.next()
    }
  }

  // For non-API routes
  try {
    const session = await auth()
    
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next()
    }

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // During build or if auth fails, redirect to home
    console.log('Auth check failed in middleware:', error)
    if (request.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all paths except static files, etc.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
}