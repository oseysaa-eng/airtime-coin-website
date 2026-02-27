import { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

/* ======================================================
   UNIVERSAL HANDLER
====================================================== */

async function proxy(
  req: NextRequest,
  pathSegments: string[]
) {
  try {
    const path = pathSegments.join("/");

    const url =
      `${BACKEND}/api/admin/${path}` +
      req.nextUrl.search;

    const res = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          req.headers.get("authorization") || "",
      },
      body:
        req.method !== "GET"
          ? await req.text()
          : undefined,
    });

    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    console.error("Proxy error:", err);

    return new Response(
      JSON.stringify({
        message: "Proxy failed",
      }),
      { status: 500 }
    );
  }
}

/* ======================================================
   EXPORTS (NEXTJS 15 CORRECT SIGNATURE)
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: any
) {
  return proxy(req, params.path);
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  return proxy(req, params.path);
}

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  return proxy(req, params.path);
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  return proxy(req, params.path);
}