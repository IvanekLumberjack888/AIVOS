import { NextResponse } from "next/server";
import { getPageBlocks, getChildPages, blockText, PARA_IDS } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    // 1. Pull blocks from Konica page
    const blocks = await getPageBlocks(PARA_IDS.konica, 40);

    // 2. Extract todo checkboxes (= Next Actions / focus items)
    const todos = blocks
      .filter((b: any) => b.type === "to_do")
      .map((b: any) => ({
        id: b.id,
        text: blockText(b),
        checked: b.to_do?.checked ?? false,
      }))
      .slice(0, 5); // max 5 focus items

    // 3. Extract headings for context
    const headings = blocks
      .filter((b: any) =>
        ["heading_1", "heading_2", "heading_3"].includes(b.type)
      )
      .map((b: any) => blockText(b))
      .slice(0, 3);

    // 4. Recent Konica child pages (sub-projects / logs)
    const childPages = await getChildPages(PARA_IDS.konica);
    const recent = childPages
      .sort(
        (a, b) =>
          new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
      )
      .slice(0, 3);

    return NextResponse.json({
      todos,
      headings,
      recentPages: recent,
      konicalUrl: `https://notion.so/${PARA_IDS.konica.replace(/-/g, "")}`,
    });
  } catch (err: any) {
    console.error("[/api/notion/focus]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
