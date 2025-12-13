import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminRoute = url.pathname.startsWith("/admin");

  const cookie = req.cookies.get("admin_auth");

  if (isAdminRoute && cookie?.value !== "1") {
    url.pathname = "/admin-auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
