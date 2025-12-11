import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, amount } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("atc");

    await db.collection("csr_donations").insertOne({
      name: name || "Anonymous",
      amount: Number(amount),
      date: new Date(),
      source: "website",
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Donation error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
