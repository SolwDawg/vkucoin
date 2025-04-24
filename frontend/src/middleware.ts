import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check both cookies and authorization header (for API requests)
  const token = request.cookies.get("token")?.value;
  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/wallet",
    "/transactions",
  ];
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/", "/about"];
  // API routes that bypass this middleware
  const bypassRoutes = ["/api"];

  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  // Check if the path is a login route
  const isAuthPage = path.startsWith("/login");
  // Check if the path should bypass this middleware
  const shouldBypass = bypassRoutes.some((route) => path.startsWith(route));

  // Bypass API routes and static files
  if (shouldBypass) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected route
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    // Add the original URL as a parameter to redirect back after login
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if token exists and trying to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
