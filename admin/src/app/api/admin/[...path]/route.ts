import { NextRequest, NextResponse } from "next/server";

/* ======================================================
   BACKEND URL
====================================================== */

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

/* ======================================================
   CONTEXT TYPE (REQUIRED FOR NEXTJS 15)
====================================================== */

type RouteContext = {
  params: {
    path: string[];
  };
};

/* ======================================================
   FORWARD FUNCTION
====================================================== */

async function forward(
  req: NextRequest,
  path: string[]
) {
  try {
    if (!BACKEND) {
      return NextResponse.json(
        { message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const url =
      `${BACKEND}/api/admin/${path.join("/")}` +
      req.nextUrl.search;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          req.headers.get("authorization") || "",
      },
      body:
        req.method === "GET" ||
        req.method === "HEAD"
          ? undefined
          : await req.text(),
    });

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);

    return NextResponse.json(
      { message: "Proxy failed" },
      { status: 500 }
    );
  }
}

/* ======================================================
   ROUTE HANDLERS (NEXTJS 15 SAFE)
====================================================== */

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  return forward(req, context.params.path);
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  return forward(req, context.params.path);
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  return forward(req, context.params.path);
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  return forward(req, context.params.path);
}