import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("atc");

    await db.collection("waitlist").insertOne({
      name,
      email: email.toLowerCase(),
      phone,
      source: "website",
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WAITLIST ERROR:", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
