# context.md — CollabCanvas (Week 1)

## Overview
CollabCanvas is a real-time collaborative design tool with an AI co-designer that can create and manipulate canvas elements using natural language commands.

## Architecture
- Framework: Next.js 14 (App Router)
- DB: Supabase Realtime (multiplayer sync)
- AI: OpenAI GPT-4o (function calling)
- State: Zustand
- Canvas: Konva.js
- Auth: Supabase Auth

## Active Sprint
**Week 1 (Oct 13–19)**  
Goal: Build multiplayer MVP (auth, cursor sync, shape creation, real-time persistence).

## Known Issues
- None yet — awaiting MVP architecture validation.

## Prompts in Use
- `/prompts/literal/week1_build_literal.txt`
- `/prompts/system/week1_build_system.md`

## Checkpoint
Last stable state: after initial Supabase sync verified (Day 1, 4:10 PM CST).