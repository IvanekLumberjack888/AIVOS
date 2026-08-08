/**
 * AIVOS-OS Product Tier & Multi-Environment Configuration
 * 
 * Tiers:
 * - "starter": Public Open-Source Demo (aivos-two.vercel.app)
 * - "pro": Commercial Product (Medium generator, yt-dlp pipelines, Gumroad templates)
 * - "private": Personal Internal OS (Live Notion Sync, Local Ollama Privacy Memory)
 */

export type AivosTier = "starter" | "pro" | "private";

export const AIVOS_TIER: AivosTier = 
  (process.env.NEXT_PUBLIC_AIVOS_TIER as AivosTier) || "starter";

export const FEATURES = {
  tier: AIVOS_TIER,
  isStarter: AIVOS_TIER === "starter",
  isPro: AIVOS_TIER === "pro" || AIVOS_TIER === "private",
  isPrivate: AIVOS_TIER === "private",

  // Feature gates
  showNotionLiveSync: AIVOS_TIER === "private",
  showOllamaPrivacyMemory: AIVOS_TIER === "private",
  showProMonetizationBanners: AIVOS_TIER === "starter" || AIVOS_TIER === "pro",
  showMediumArticleGenerator: AIVOS_TIER === "pro" || AIVOS_TIER === "private",
  showPublicShowcaseHeader: AIVOS_TIER === "starter" || AIVOS_TIER === "pro",
};

export const TIER_METADATA = {
  starter: {
    name: "AIVOS-OS Starter Edition",
    badge: "PUBLIC DEMO",
    badgeColor: "#10b981",
    description: "Open-source Web Workspace for AI & Data Engineers.",
  },
  pro: {
    name: "AIVOS-OS Pro Edition",
    badge: "PRO COMMERCIAL",
    badgeColor: "#8b5cf6",
    description: "Commercial Automation System with Notion P.A.R.A. & Medium Generator.",
  },
  private: {
    name: "AIVOS-OS Personal OS",
    badge: "PRIVATE WORKSPACE",
    badgeColor: "#3b82f6",
    description: "Internal Personal Workspace with Notion Live Sync & Local Ollama Privacy.",
  },
} as const;
