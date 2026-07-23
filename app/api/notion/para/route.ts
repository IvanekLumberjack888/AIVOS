import { NextResponse } from "next/server";
import { getChildPages, PARA_IDS } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 120;

const PARA_META = [
  { key: "projects",  label: "Projects",  emoji: "🎯" },
  { key: "areas",     label: "Areas",     emoji: "🗺️" },
  { key: "resources", label: "Resources", emoji: "📚" },
  { key: "archives",  label: "Archives",  emoji: "🗃️" },
] as const;

export async function GET() {
  try {
    const results = await Promise.all(
      PARA_META.map(async (meta) => {
        const pages = await getChildPages(PARA_IDS[meta.key]);
        return {
          ...meta,
          count: pages.length,
          recent: pages
            .sort(
              (a, b) =>
                new Date(b.lastEdited).getTime() -
                new Date(a.lastEdited).getTime()
            )
            .slice(0, 3)
            .map((p) => ({
              id: p.id,
              title: p.title,
              lastEdited: p.lastEdited,
              url: p.url,
            })),
        };
      })
    );

    return NextResponse.json({ para: results });
  } catch (err: any) {
    console.error("[/api/notion/para]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
