import { NextResponse } from "next/server";
import { getChildPages, PARA_IDS } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 60; // revalidate každých 60s

export async function GET() {
  try {
    const pages = await getChildPages(PARA_IDS.projects);

    // Sort by lastEdited desc, return top 10
    const sorted = pages
      .sort(
        (a, b) =>
          new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({ pages: sorted });
  } catch (err: any) {
    console.error("[/api/notion/projects]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
