/**
 * AIVOS Internationalization (i18n) Module
 * Supports English (EN) and Czech (CZ) language mutations.
 */

export type Language = "en" | "cz";

export const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_pulse: "PULSE",
    nav_memory: "Memory",
    nav_para: "P.A.R.A.",
    nav_knowledge: "Knowledge",
    nav_inbox: "Inbox",
    nav_sessions: "Sessions",
    nav_search: "Search",

    // Environment Bar
    env_mode: "ACTIVE ENVIRONMENT MODE:",
    tier_starter: "🟢 Starter Demo",
    tier_pro: "⚡ Pro Commercial",
    tier_private: "🔒 Private Local OS",

    // Hero Landing
    hero_badge: "AIVOS PULSE · TECH & AI ARCHITECTURE INTELLIGENCE",
    hero_title: "PULSE: Automated High-Signal Tech Video Triage",
    hero_desc: "PULSE is an automated intelligence hub for IT Integration and Automation Specialists. It monitors custom YouTube playlists, extracts transcripts via headless python yt-dlp, scores technical relevance (1–10) using Gemini 2.0 Flash, and generates daily audio podcasts & Medium-ready tech articles.",
    
    // Actions & Toggles
    btn_daily: "⚡ Daily AI Briefs",
    btn_weekly: "🏆 Weekly Best-of (Týdenní Výběr)",
    btn_generate_blog: "📰 Generate Digest Blog",
    btn_kpi_analytics: "📊 Enterprise KPI Analytics",
    btn_how_it_works_show: "How PULSE Works ▼",
    btn_how_it_works_hide: "Hide How PULSE Works ▲",

    // How PULSE Works Accordion
    how_step1_title: "1. Headless Subtitles",
    how_step1_desc: "Subtitle extraction without heavy video downloads via Python + yt-dlp.",
    how_step2_title: "2. Gemini 2.0 Triage",
    how_step2_desc: "Relevance scoring (1-10), key points, and actionable implementation steps.",
    how_step3_title: "3. MP3 Podcast Brief",
    how_step3_desc: "Daily audio summaries formatted for hands-free listening.",
    how_step4_title: "4. Medium & Substack",
    how_step4_desc: "Synthesizes curated videos into ready-to-publish tech articles on 1-click.",

    // Weekly Banner
    weekly_badge: "BEST OF THE WEEK",
    weekly_hero_badge: "🏆 WEEKLY BEST-OF DIGEST · TOP 1% CURATED CONTENT",
    weekly_title: "Weekly Best-of: Top-Rated Technical Videos & Cloud Architecture Patterns",
    weekly_desc: "Hand-picked top technical talks, Azure Data Factory tutorials, Databricks PySpark guides, and AI automations from the past 7 days with high relevance scores (8.5–10).",

    // Commercial Showcase
    pro_title: "Commercial Blueprints & Pro Automation",
    pro_desc: "Get instant access to complete commercial automation pipelines: automated YouTube ingestion scripts, Notion live sync integrations, Medium article generator API, and step-by-step deploy guides for Solopreneurs & Data Engineers.",

    // Modals
    medium_modal_title: "MEDIUM.COM DRAFT GENERATOR & KB COMPARISON",
    kpi_modal_title: "ENTERPRISE KPI & DATA QUALITY DASHBOARD · KONICA MINOLTA STANDARDS",
  },

  cz: {
    // Navigation
    nav_dashboard: "Nástěnka",
    nav_pulse: "PULSE",
    nav_memory: "Paměť",
    nav_para: "P.A.R.A.",
    nav_knowledge: "Znalosti",
    nav_inbox: "Doručené",
    nav_sessions: "Generátor",
    nav_search: "Hledat",

    // Environment Bar
    env_mode: "AKTIVNÍ REŽIM PROSTŘEDÍ:",
    tier_starter: "🟢 Ukázka Starter",
    tier_pro: "⚡ Komerční Pro",
    tier_private: "🔒 Soukromé Local OS",

    // Hero Landing
    hero_badge: "AIVOS PULSE · TECH & AI ARCHITEKTURNÍ INTELIGENCE",
    hero_title: "PULSE: Automatická triáž a sledování technického signálu",
    hero_desc: "PULSE je inteligentní centrum pro IT Integration and Automation Specialist. Sleduje vybrané YouTube playlisty, bezstahově stahuje titulky přes Python yt-dlp, hodnotí přínos (1–10) pomocí Gemini 2.0 Flash a vytváří denní MP3 podcasty i technické články pro Medium.com.",
    
    // Actions & Toggles
    btn_daily: "⚡ Denní AI Přehledy",
    btn_weekly: "🏆 Týdenní Výběr (Best-of)",
    btn_generate_blog: "📰 Vygenerovat Výběrový Blog",
    btn_kpi_analytics: "📊 Enterprise KPI Analytika",
    btn_how_it_works_show: "Jak PULSE funguje ▼",
    btn_how_it_works_hide: "Skrýt jak PULSE funguje ▲",

    // How PULSE Works Accordion
    how_step1_title: "1. Headless Titulky",
    how_step1_desc: "Extrakce titulků bez stahování těžkých videí skrze Python + yt-dlp.",
    how_step2_title: "2. Gemini 2.0 Triáž",
    how_step2_desc: "Hodnocení přínosu (1-10), vytažení klíčových bodů a akčních kroků.",
    how_step3_title: "3. MP3 Podcast Přehled",
    how_step3_desc: "Generování denních audio přehledů pro poslech cestou do práce.",
    how_step4_title: "4. Medium & Substack",
    how_step4_desc: "Syntéza roztříděných videí do publikovatelného blogu na 1-klik.",

    // Weekly Banner
    weekly_badge: "VÝBĚR TÝDNE",
    weekly_hero_badge: "🏆 TÝDENNÍ VÝBĚR DIGEST · TOP 1% NEJLEPŠÍHO OBSAHU",
    weekly_title: "Týdenní Výběr: Nejlépe hodnocená technická videa a cloudové architektury",
    weekly_desc: "Vybrané nejlepší technické příspěvky, návody pro Azure Data Factory, Databricks PySpark a AI automatizace za uplynulých 7 dní s vysokým skóre přínosu (8.5–10).",

    // Commercial Showcase
    pro_title: "Komerční blueprinty a Pro Automatizace",
    pro_desc: "Získejte okamžitý přístup k automatizačním skriptům: automatické YouTube skripty, Notion živá synchronizace, Medium API generátor a návody pro integrátory.",

    // Modals
    medium_modal_title: "GENERÁTOR ČLÁNKŮ MEDIUM.COM & SROVNÁNÍ S WIKI",
    kpi_modal_title: "ENTERPRISE KPI & DATA QUALITY DASHBOARD · KONICA MINOLTA STANDARDS",
  },
} as const;
