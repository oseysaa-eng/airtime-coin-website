import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public admin login routes
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/")
  ) {
    return NextResponse.next();
  }

  // 🔒 Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("adminToken");

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};