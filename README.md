# AIVOS - Personal AI OS 🚀

**AIVOS** (*Personal AI OS v0.1*) is a personal operating system designed for intelligent management of personal projects, knowledge bases, long-term memory, and daily summaries using the **P.A.R.A.** framework and AI model integration (Notion, Claude, Ollama).

🌐 **Live Deployment on Vercel:** [aivos-two.vercel.app](https://aivos-two.vercel.app)  
📦 **GitHub Repository:** [IvanekLumberjack888/AIVOS](https://github.com/IvanekLumberjack888/AIVOS)

---

## ⚡ Key Modules & Architecture

- 📊 **Dashboard** – Main control panel displaying real-time project statistics (*Cloud Integration*, *Cloud Certifications*, *AIVOS Build*).
- 📺 **Brain Brief (`BriefView.tsx`)** – Daily YouTube AI digest with content scoring and interactive **Deep Dive AI Chat**.
- 🧠 **Memory** – Notes and contextual memory connected to the AI assistant.
- 📂 **P.A.R.A. System** – Information architecture categorized into 4 core pillars:
  - `10 PROJECTS` (Active goals with explicit deadlines)
  - `20 AREAS` (Long-term responsibilities: Career, Health, AI)
  - `30 RESOURCES` (Topics & study materials: ADF, Fabric, LangChain)
  - `40 ARCHIVE` (Completed & inactive projects)
- 📖 **Knowledge Base** *(Phase 3)* – Semantic document search via pgvector & Neon DB.
- 📥 **Inbox** *(Phase 4)* – Gmail MCP integration for rapid task and message collection.
- 💻 **Sessions** *(Phase 5)* – Claude Code & GitHub MCP integration.
- 🔍 **Universal Search** *(Phase 6)* – Cross-source search (Notion, GitHub, Memory).

---

## 🛠️ Tech Stack & Integrations

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling:** Modern Dark Emerald UI theme (`#0f1410`, `#16201a`, `#10b981`), Tailwind CSS v4
- **Icons:** `lucide-react`
- **Integrations:**
  - **Notion API (`@notionhq/client`):** Live sync with P.A.R.A. databases and tasks
  - **Ollama API:** Local / remote LLM endpoint (`http://localhost:11434`)
  - **YouTube Brief Pipeline:** Video summary processing and RAG chat

---

## 💻 Local Development & Setup

### 1. Clone the repository
```bash
git clone https://github.com/IvanekLumberjack888/AIVOS.git
cd AIVOS
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NOTION_API_KEY=your_notion_api_key
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Roadmap & Phases

- [x] **Phase 1:** Core UI Dashboard, Sidebar, Brain Brief & Deep Dive RAG chat.
- [x] **Phase 2:** Integration of Notion P.A.R.A. views (`NotionParaView.tsx`, `NotionProjects.tsx`).
- [ ] **Phase 3:** Hybrid Ollama status check (browser fallback for Vercel deployment vs. serverless).
- [ ] **Phase 4:** Implementation of pgvector semantic search for Knowledge Base.
- [ ] **Phase 5:** Responsive mobile drawer for sidebar navigation.

---

© 2026 Ivo Doležal | Developed with ❤️ for Personal AI Automation
