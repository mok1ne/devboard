import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicPath =
    pathname.startsWith("/auth") || pathname.startsWith("/api/auth");

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isLoggedIn && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
