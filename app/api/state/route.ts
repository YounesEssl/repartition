import { NextResponse } from "next/server";
import { loadState, saveState } from "@/lib/redis";

export async function GET() {
  try {
    const state = await loadState();
    if (!state) return NextResponse.json(null);
    return NextResponse.json(state);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveState(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
