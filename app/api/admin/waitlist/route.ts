import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const secretHeader = req.headers.get("x-admin-secret");

  if (secretHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const client = await clientPromise;
  const db = client.db("atc-db");

  const data = await db
    .collection("waitlist")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(data);
}
