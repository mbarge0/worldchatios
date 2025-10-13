# 🧾 Gauntlet AI — Dry Run Assignment
**Project Name:** Slack Lite (Dry Run Edition)  
**Duration:** 2 days  
**Goal:** Stress-test full build–deploy loop (Cursor + Supabase + Vercel)  
**Scope:** Ship a minimal real-time chat clone with optional AI hook  

---

## 🧭 Purpose
This dry run simulates a **Week 1 Gauntlet challenge** in miniature.  
You will complete the **entire development cycle** — plan, build, deploy, and reflect — on a project small enough to finish in two days but complex enough to test your workflow.

The focus is **not** production quality or polish.  
It’s to validate that your system (Cursor workflow, context management, and deployment stack) works under real build conditions.

**Primary Goals**
- Environment setup and configuration  
- Supabase connectivity  
- Real-time communication  
- Deployment pipeline  
- Testing + reflection discipline  

---

## ⚙️ Core Requirements

### 1️⃣ Authentication & User Session (Minimal)
- Single sign-in via **Supabase Auth** (email or magic link).  
- Session persists on refresh.  
- Display username in chat UI.

**Stretch:** Add sign-out button.

---

### 2️⃣ Messaging (Essential Feature)
- One shared “global chat” channel.  
- Users can send and receive messages in real time.  
- Messages stored in Supabase table:  
  ```sql
  messages(id uuid, user text, content text, created_at timestamp)
  	•	New messages appear instantly for all connected clients.

Stretch: Support multiple named channels.

⸻

3️⃣ UI / UX
	•	Simple, clean layout using TailwindCSS.
	•	Message list area
	•	Input box + send button
	•	Show message timestamps.
	•	Must work smoothly on desktop; mobile optional.

⸻

4️⃣ AI Enhancement (Optional Stretch)

If time allows, add a /summarize command:
	•	Sends last 10 messages to OpenAI.
	•	Posts an AI-generated summary in the chat.

Only implement once base system is deployed and working.

⸻

5️⃣ Deployment
	•	Deploy frontend to Vercel.
	•	Use Supabase as hosted backend.
	•	.env contains keys and is excluded from repo.
	•	Include live demo URL in your README.

⸻

6️⃣ Performance Baselines
	•	Page loads without console errors.
	•	Message latency < 2 seconds.
	•	Deployed app matches local behavior.

⸻

7️⃣ Documentation & Reflection
	•	Create /docs/retro.md with 1–2 paragraphs:
	•	✅ What worked
	•	⚠️ What slowed you down
	•	💡 Workflow lessons for Gauntlet Week 1
	•	Update README with:
	•	Setup steps
	•	Tech stack
	•	Live link

⸻

📦 Deliverables
Item
Description
Required
Working real-time chat (Supabase + Vercel)
End-to-end chat system
✅
Auth flow
Supabase auth implemented
✅
README + retro
Docs included
✅
AI summarization
Stretch goal only
⚙️
Live deployment link
Vercel URL
✅

📊 Evaluation (Dry Run Focus)
Category
Description
Weight
Workflow reliability
System setup, build rhythm, commit discipline
30%
End-to-end functionality
Auth + chat + deploy
30%
Performance
Speed, no console errors
20%
Reflection quality
Insightfulness and accuracy of retro
20%

🕓 Suggested Timeline
Time
Focus
Day 1 AM
Repo setup, Supabase auth
Day 1 PM
Messaging loop functional
Day 2 AM
Deploy + test
Day 2 PM
Retro + (optional) AI feature

Instructor Note
This dry run is designed to measure workflow efficiency under time pressure and reveal friction points before the program begins.
Concentrate on reliability and iteration speed rather than feature depth.