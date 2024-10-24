export { auth as middleware } from "@/auth";

//redirect to root if not authenticated
export const config = {
    matcher: '/main/:path*',
  }