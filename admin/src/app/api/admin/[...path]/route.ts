import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_API_URL!;
const TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

/* ======================================================
   FETCH WITH TIMEOUT
====================================================== */

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = TIMEOUT
): Promise<Response> {
  const controller = new AbortController();

  const id = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return res;
  } finally {
    clearTimeout(id);
  }
}

/* ======================================================
   RETRY LOGIC
====================================================== */

async function fetchWithRetry(
  url: string,
  options: RequestInit
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);

      if (res.ok) return res;

      if (res.status >= 500) {
        lastError = new Error(
          `Server error ${res.status}`
        );
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

/* ======================================================
   FORWARD REQUEST
====================================================== */

async function forward(
  req: NextRequest,
  path: string[]
) {
  try {
    if (!BACKEND) {
      return NextResponse.json(
        { message: "Backend not configured" },
        { status: 500 }
      );
    }

    const url =
      `${BACKEND}/api/admin/${path.join("/")}` +
      req.nextUrl.search;

    const token =
      req.headers.get("authorization") || "";

    const options: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body:
        req.method === "GET" ||
        req.method === "HEAD"
          ? undefined
          : await req.text(),
    };

    const res = await fetchWithRetry(url, options);

    /* Auto logout if token invalid */
    if (res.status === 401) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          logout: true,
        },
        { status: 401 }
      );
    }

    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type":
          res.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch (err: any) {
    console.error(
      "ADMIN PROXY ERROR:",
      err?.message
    );

    return NextResponse.json(
      {
        message:
          "Admin service temporarily unavailable",
      },
      { status: 503 }
    );
  }
}

/* ======================================================
   ROUTE HANDLERS (NO TYPE ANNOTATION)
====================================================== */

export async function GET(
  req: NextRequest,
  context: any
) {
  return forward(req, context.params.path);
}

export async function POST(
  req: NextRequest,
  context: any
) {
  return forward(req, context.params.path);
}

export async function PUT(
  req: NextRequest,
  context: any
) {
  return forward(req, context.params.path);
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  return forward(req, context.params.path);
}