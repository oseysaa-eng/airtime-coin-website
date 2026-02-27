import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

async function forward(req: NextRequest, path: string[]) {
  try {
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
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : await req.text(),
    });

    const text = await response.text();

    return new NextResponse(text, {
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

/* ✅ DO NOT TYPE context */
export async function GET(req: NextRequest, context: any) {
  return forward(req, context.params.path);
}

export async function POST(req: NextRequest, context: any) {
  return forward(req, context.params.path);
}

export async function PUT(req: NextRequest, context: any) {
  return forward(req, context.params.path);
}

export async function DELETE(req: NextRequest, context: any) {
  return forward(req, context.params.path);
}