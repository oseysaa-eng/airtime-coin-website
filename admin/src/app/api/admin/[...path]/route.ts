import { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

/* ======================================================
   PROXY HANDLER
====================================================== */

async function handler(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  try {
    const path = context.params.path.join("/");

    const url = `${BACKEND}/api/admin/${path}${req.nextUrl.search}`;

    const res = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body:
        req.method !== "GET"
          ? await req.text()
          : undefined,
    });

    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    console.error("Admin proxy error:", err);

    return new Response(
      JSON.stringify({
        message: "Proxy failed",
      }),
      { status: 500 }
    );
  }
}

/* ======================================================
   EXPORT METHODS
====================================================== */

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handler(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handler(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handler(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handler(req, context);
}