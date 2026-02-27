import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL;

async function forward(req: NextRequest, path: string[]) {
  if (!BACKEND) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 }
    );
  }

  const url = `${BACKEND}/api/admin/${path.join("/")}`;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.text(),
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return forward(req, context.params.path);
}

export async function POST(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return forward(req, context.params.path);
}

export async function PUT(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return forward(req, context.params.path);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return forward(req, context.params.path);
}