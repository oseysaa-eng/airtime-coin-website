import { NextRequest } from "next/server";

/* ======================================================
   BACKEND URL
====================================================== */

const BACKEND =
  process.env.NEXT_PUBLIC_ADMIN_API_URL!;

/* ======================================================
   PROXY FUNCTION
====================================================== */

async function proxy(
  req: NextRequest,
  pathSegments: string[]
) {
  const url =
    `${BACKEND}/api/admin/${pathSegments.join("/")}` +
    req.nextUrl.search;

  const response = await fetch(url, {
    method: req.method,
    headers: {
      Authorization:
        req.headers.get("authorization") || "",
      "Content-Type": "application/json",
    },
    body:
      req.method === "GET"
        ? undefined
        : await req.text(),
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/* ======================================================
   NEXTJS 15 REQUIRED SIGNATURE
====================================================== */

type Context = {
  params: {
    path: string[];
  };
};

export async function GET(
  req: NextRequest,
  context: Context
) {
  return proxy(req, context.params.path);
}

export async function POST(
  req: NextRequest,
  context: Context
) {
  return proxy(req, context.params.path);
}

export async function PUT(
  req: NextRequest,
  context: Context
) {
  return proxy(req, context.params.path);
}

export async function DELETE(
  req: NextRequest,
  context: Context
) {
  return proxy(req, context.params.path);
}