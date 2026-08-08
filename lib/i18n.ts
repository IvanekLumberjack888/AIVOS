/**
 * AIVOS Internationalization (i18n) Module
 * Supports English (EN) and Czech (CZ) language mutations.
 */

export type Language = "en" | "cz";

export const translations = {
  en: {
    // Top Bar Navigation
    nav_home: "Home",
    nav_solutions: "Solutions",
    nav_marketplace: "Marketplace & Tools",
    nav_pricing: "Pricing",
    nav_about: "About Us",
    nav_login: "Log In",
    nav_workspace: "Enter App Workspace",

    // Datamole Stat Cards
    stat1_num: "100+",
    stat1_label: "Azure Data & PySpark Pipelines Engineered",
    stat2_num: "99.9%",
    stat2_label: "Enterprise Uptime & Pipeline Reliability",
    stat3_num: "10x",
    stat3_label: "Faster YouTube & Knowledge Triage",

    // Datamole "Challenges We Solve" Section
    challenges_title: "Challenges We Solve",
    challenges_subtitle: "Bridging complex cloud integrations, data quality governance, and autonomous AI agents.",
    ch1_title: "Data Silos & Fragmented Cloud Pipelines",
    ch1_desc: "We integrate legacy SQL databases, Service Bus event queues, and Azure Data Factory into unified Delta Lake architectures.",
    ch2_title: "Information Overload & Slow Tech Research",
    ch2_desc: "PULSE automatically extracts YouTube subtitles, ranks relevance (1-10) using Gemini 2.0 Flash, and delivers daily MP3 audio summaries.",
    ch3_title: "Manual Content & Knowledge Publishing",
    ch3_desc: "Synthesize technical breakthroughs into ready-to-publish Medium and Substack articles with 1-click.",

    // Apify Marketplace Tools
    market_title: "Automated AI Tools & Blueprints Marketplace",
    market_subtitle: "Pre-built, reliable automation actors ready to deploy or integrate via API.",
    actor1_title: "YouTube Headless Subtitle & Triage Actor",
    actor1_desc: "Extracts subtitles without heavy video downloads, scores technical relevance using Gemini 2.0, and generates daily audio briefs.",
    actor2_title: "Medium & Substack Tech Article Generator",
    actor2_desc: "Synthesizes raw video transcripts and technical notes into polished, SEO-optimized articles formatted for Medium.com.",
    actor3_title: "Notion P.A.R.A. & Local Privacy Sync",
    actor3_desc: "Two-way live synchronization between Notion P.A.R.A. databases and local Ollama zero-trust LLM memory.",

    // Pricing Page (Apify & SaaS Standard)
    pricing_title: "Transparent & Scalable Pricing",
    pricing_subtitle: "Choose the tier that fits your automation needs. No hidden fees, no required Discord communities.",
    plan_starter_title: "Starter Demo",
    plan_starter_price: "$0 / free",
    plan_starter_desc: "Open-source demo view on Vercel for exploring capabilities.",
    plan_pro_title: "Pro Solopreneur",
    plan_pro_price: "$49 / mo",
    plan_pro_desc: "Complete Python yt-dlp scripts, Medium generator API, and Notion sync blueprints.",
    plan_private_title: "Enterprise Consulting",
    plan_private_price: "$2,500+",
    plan_private_desc: "Custom Azure Data Factory, Databricks PySpark Lakehouse & tailored AI agent deployment.",

    // About Section
    about_title: "About AIVOS & Ivo Doležal",
    about_desc: "AIVOS is an autonomous IT Integration & Automation platform created by Ivo Doležal, IT Integration and Automation Specialist. Based in Prague, Czech Republic, specializing in Azure cloud architectures, PySpark Lakehouse pipelines, and agentic workflows.",

    // Public Landing Page (Capco & Axians Inspired)
    landing_badge: "✨ NEXT-GEN IT INTEGRACE & AI AUTOMATIZAČNÍ CONSULTING",
    landing_h1: "Giving Data Meaning. Automating Enterprise Workflows.",
    landing_subtitle: "High-performance Data Engineering, Azure PySpark Lakehouses, and Autonomous AI Agents crafted by Ivo Doležal · IT Integration and Automation Specialist.",
    landing_cta_launch: "🚀 Enter AIVOS OS",
    landing_cta_explore: "⚡ Technical Capabilities",
    
    // Landing Pillars
    pillar1_title: "Enterprise Cloud & Data Integration",
    pillar1_tag: "AZURE & INTEGRATION",
    pillar1_desc: "High-throughput Azure Data Factory pipelines, Service Bus event routing, REST connectors, and robust ETL/ELT architecture for complex IT environments.",

    pillar2_title: "Databricks Lakehouse & Data Quality",
    pillar2_tag: "PYSPARK & DELTA LAKE",
    pillar2_desc: "ACID-compliant Delta Lake pipelines, real-time data quality monitoring built on Konica Minolta IT Business Solutions standards, and Power BI dashboards.",

    pillar3_title: "Autonomous AI & Knowledge Agents",
    pillar3_tag: "AI & AGENTIC WORKFLOWS",
    pillar3_desc: "Custom LLM RAG pipelines, PULSE video triage engine, Gemini 2.0 Flash REST streaming, and zero-trust local privacy Ollama memory sync.",

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
    // Top Bar Navigation
    nav_home: "Domů",
    nav_solutions: "Řešení",
    nav_marketplace: "Nástroje & Marketplace",
    nav_pricing: "Ceník",
    nav_about: "O nás",
    nav_login: "Přihlásit se",
    nav_workspace: "Vstoupit do AIVOS OS",

    // Datamole Stat Cards
    stat1_num: "100+",
    stat1_label: "Vybudovaných Azure & PySpark Data Pipelines",
    stat2_num: "99.9%",
    stat2_label: "Spolehlivost a garance datových toků",
    stat3_num: "10x",
    stat3_label: "Rychlejší správa znalostí a YouTube návodů",

    // Datamole "Challenges We Solve" Section
    challenges_title: "Problémy, které řešíme",
    challenges_subtitle: "Propojujeme složité cloudové integrace, sledování kvality dat a autonomní AI agenty.",
    ch1_title: "Datová sila a roztříštěné cloudové systémy",
    ch1_desc: "Propojujeme starší SQL databáze, Service Bus události a Azure Data Factory do jednotné Delta Lake architektury.",
    ch2_title: "Informační přetížení a pomalý výzkum",
    ch2_desc: "PULSE automaticky stahuje titulky z YouTube, boduje přínos (1-10) pomocí Gemini 2.0 Flash a doručuje denní audio podcasty.",
    ch3_title: "Ruční tvorba obsahu a článků",
    ch3_desc: "Syntéza technických návodů do publikovatelných Medium a Substack článků na 1-klik.",

    // Apify Marketplace Tools
    market_title: "Marketplace automatizovaných AI nástrojů a blueprintů",
    market_subtitle: "Hotové, spolehlivé automatizační nástroje připravené k nasazení nebo integraci přes API.",
    actor1_title: "YouTube Headless Titulky & Triage Actor",
    actor1_desc: "Extrakce titulků bez stahování videí, hodnocení přínosu pomocí Gemini 2.0 a generování denních audio přehledů.",
    actor2_title: "Medium & Substack Článkový Generátor",
    actor2_desc: "Syntéza videí a technických poznámek do formátovaných SEO článků pro Medium.com.",
    actor3_title: "Notion P.A.R.A. & Lokální Paměťový Sync",
    actor3_desc: "Živá obousměrná synchronizace mezi Notion P.A.R.A. databází a lokální Ollama pamětí.",

    // Pricing Page (Apify & SaaS Standard)
    pricing_title: "Transparentní ceník bez skrytých poplatků",
    pricing_subtitle: "Vyberte si úroveň podle vašich potřeb. Žádné povinné Discord komunity, žádné zdržování.",
    plan_starter_title: "Starter Ukázka",
    plan_starter_price: "Zdarma",
    plan_starter_desc: "Open-source ukázka rozhraní na Vercelu pro prozkoumání možností.",
    plan_pro_title: "Pro Solopreneur",
    plan_pro_price: "1 200 Kč / měs",
    plan_pro_desc: "Kompletní Python skripty, Medium API generátor a Notion synchronizace.",
    plan_private_title: "Enterprise Consulting",
    plan_private_price: "od 60 000 Kč",
    plan_private_desc: "Zakázková architektura Azure Data Factory, Databricks PySpark a AI agenti na míru.",

    // About Section
    about_title: "O projektu AIVOS & Ivo Doležal",
    about_desc: "AIVOS je autonomní IT integrační a automatizační platforma vytvořená Ivem Doležalem, IT Integration and Automation Specialist. Se sídlem v Praze, se specializací na Azure cloud, PySpark Lakehouse a AI agentní workflows.",

    // Navigation
    nav_landing: "Úvodní Stránka",
    nav_dashboard: "Nástěnka",
    nav_pulse: "PULSE",
    nav_memory: "Paměť",
    nav_para: "P.A.R.A.",
    nav_knowledge: "Znalosti",
    nav_inbox: "Doručené",
    nav_sessions: "Generátor",
    nav_search: "Hledat",

    // Public Landing Page (Capco & Axians Inspired)
    landing_badge: "✨ NEXT-GEN IT INTEGRACE & AI AUTOMATIZAČNÍ CONSULTING",
    landing_h1: "Dáváme datům význam. Automatizujeme firemní procesy.",
    landing_subtitle: "Špičková cloudová integrace, Azure PySpark Lakehouse a autonomní AI agenti navržení Ivem Doležalem · IT Integration and Automation Specialist.",
    landing_cta_launch: "🚀 Vstoupit do AIVOS OS",
    landing_cta_explore: "⚡ Technické Kompetence",

    // Landing Pillars
    pillar1_title: "Enterprise Cloud & Datová Integrace",
    pillar1_tag: "AZURE & INTEGRACE",
    pillar1_desc: "Vysoko-propustné Azure Data Factory pipelines, Service Bus směrování událostí, REST konektory a robustní ETL/ELT architektura pro složitá IT prostředí.",

    pillar2_title: "Databricks Lakehouse & Kvalita Dat",
    pillar2_tag: "PYSPARK & DELTA LAKE",
    pillar2_desc: "ACID-compliant Delta Lake datové toky, sledování kvality dat v reálném čase podle standardů Konica Minolta IT Business Solutions a Power BI výstupy.",

    pillar3_title: "Autonomní AI & Znalostní Agenti",
    pillar3_tag: "AI & AGENTNÍ WORKFLOWS",
    pillar3_desc: "Custom LLM RAG pipelines, PULSE video triage engine, Gemini 2.0 Flash REST streaming a zero-trust lokální Ollama paměťová synchronizace.",

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
