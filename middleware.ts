import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.AUTH_REQUIRED !== "true") return NextResponse.next();

  const publicRoutes = ["/login", "/register", "/offline"];
  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) return NextResponse.next();

  const hasSessionCookie =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");

  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icon.svg).*)"]
};
