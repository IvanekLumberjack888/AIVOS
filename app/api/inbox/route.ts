import { NextRequest, NextResponse } from "next/server";

// Temporary in-memory queue for quick capture tasks and links
let inboxItems: Array<{ id: string; type: "task" | "youtube" | "note"; title: string; date: string; done: boolean }> = [
  { id: "1", type: "task", title: "Test Azure ADF Data Flow optimization", date: "2026-08-02", done: false },
  { id: "2", type: "youtube", title: "https://youtube.com/watch?v=sBF3UumkL4Y", date: "2026-08-02", done: false },
  { id: "3", type: "note", title: "Architecture: Medallion pattern in Delta Lake", date: "2026-08-02", done: true },
];

export async function GET() {
  return NextResponse.json({ items: inboxItems });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem = {
      id: Date.now().toString(),
      type: body.type || "task",
      title: body.title || "Untitled",
      date: new Date().toISOString().split("T")[0],
      done: false,
    };
    inboxItems.unshift(newItem);
    return NextResponse.json({ success: true, item: newItem, items: inboxItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    inboxItems = inboxItems.map(item => item.id === id ? { ...item, done } : item);
    return NextResponse.json({ success: true, items: inboxItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
