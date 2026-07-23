import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Your P.A.R.A. page IDs
export const PARA_IDS = {
  projects:  "2fb12b56-5df0-817e-a750-cd6a0303bf23",
  areas:     "2fb12b56-5df0-8150-81f9-db4597be73a3",
  resources: "2fb12b56-5df0-8168-b9da-d77fe76a80b8",
  archives:  "2fb12b56-5df0-81db-9efd-c477971019ae",
  feed:      "685029e7-5f0f-4730-a629-afe169ac6e47",
  konica:    "32b12b56-5df0-8128-a08e-d16543998bc7",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

export interface NotionPage {
  id: string;
  title: string;
  lastEdited: string;
  url: string;
  icon?: string;
}

export interface ParaSection {
  key: keyof typeof PARA_IDS;
  label: string;
  emoji: string;
  count: number;
  pages: NotionPage[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extract plain-text title from a Notion page object */
export function extractTitle(page: any): string {
  const props = page.properties ?? {};
  const titleProp =
    props.title ?? props.Name ?? props.Task ?? Object.values(props)[0];
  return titleProp?.title?.[0]?.plain_text ?? "Untitled";
}

/** Extract icon from a Notion page/block */
export function extractIcon(obj: any): string | undefined {
  if (!obj.icon) return undefined;
  if (obj.icon.type === "emoji") return obj.icon.emoji;
  return undefined;
}

/** Get child pages (type = child_page) under a page */
export async function getChildPages(pageId: string): Promise<NotionPage[]> {
  const res = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  const childPageBlocks = res.results.filter(
    (b: any) => b.type === "child_page"
  );

  return childPageBlocks.map((b: any) => ({
    id: b.id,
    title: b.child_page?.title ?? "Untitled",
    lastEdited: b.last_edited_time,
    url: `https://notion.so/${b.id.replace(/-/g, "")}`,
    icon: undefined,
  }));
}

/** Get database entries (pages inside a DB) */
export async function queryDatabase(
  databaseId: string,
  pageSize = 20
): Promise<NotionPage[]> {
  const res = await notion.databases.query({
    database_id: databaseId,
    page_size: pageSize,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });

  return res.results.map((page: any) => ({
    id: page.id,
    title: extractTitle(page),
    lastEdited: page.last_edited_time,
    url: page.url,
    icon: extractIcon(page),
  }));
}

/** Fetch first N text blocks from a page (for Today's Focus) */
export async function getPageBlocks(
  pageId: string,
  limit = 30
): Promise<any[]> {
  const res = await notion.blocks.children.list({
    block_id: pageId,
    page_size: limit,
  });
  return res.results;
}

/** Extract plain text from a block's rich_text array */
export function blockText(block: any): string {
  const type = block.type;
  return (
    block[type]?.rich_text?.map((r: any) => r.plain_text).join("") ?? ""
  );
}
