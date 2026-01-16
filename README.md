# 🤖 Figmenta Copilot (Brief 1)

A next-generation AI Discord assistant with a powerful Admin Dashboard. Built for the **Figmenta Internship Assignment**.

[![Deployment Status](https://img.shields.io/badge/Admin_Dashboard-Live-success?style=for-the-badge&logo=vercel)](https://brief-1-discord-copilot.vercel.app)
[![Discord](https://img.shields.io/badge/Discord-Join_Server-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/384rgc63yR)

---

## ✨ Features

### 🧠 AI Capabilities
- **Gemini 2.5 Flash**: Powered by Google's latest multimodal model.
- **Context Awareness**: Remembers conversation history for natural dialogue.
- **RAG-Ready**: System architecture supports retrieval-augmented generation.

### 🎛️ Admin Dashboard
- **Live Configuration**: Update system instructions and bot persona in real-time.
- **Channel Control**: Whitelist/Blacklist channels directly from the UI.
- **Memory Management**: View and clear active conversation contexts.
- **Knowledge Base**: Manage documents for the bot's knowledge retrieval.

---

## 🚀 Quick Start Guide

### The "Magic" Script (MacOS/Linux) 🍎
We have included a dedicated script to keep the entire system (Admin + Bot) running locally 24/7 during evaluation.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MohammedAnasNathani/Discord-Copilot-Figmenta.git
    cd Discord-Copilot-Figmenta
    ```

2.  **Run the wrapper script:**
    ```bash
    ./start-figmenta.command
    ```
    *(This will install dependencies and launch both the Admin Panel on port 3000 and the Discord Bot)*

### Configuration 💻

Create `.env.local` in root and `.env` in `discord-bot/`:

```env
# Root .env.local
NEXT_PUBLIC_GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# discord-bot/.env
DISCORD_TOKEN=...
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth)
- **Bot Engine**: Node.js, Discord.js v14
- **AI**: Google Generative AI SDK (Gemini)

---

## 👨‍💻 Submission Notes

> **Hosting**: The Admin Dashboard is deployed live on Vercel. The Discord Bot is configured for **Self-Hosting**. The `start-figmenta.command` script is provided to simulate a production environment locally for evaluation.

---

**Developed by Mohammed Anas Nathani for Figmenta**
