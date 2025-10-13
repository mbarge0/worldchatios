# CollabCanvas  
### Building Real-Time Collaborative Design Tools with AI

---

## 🧭 Background

Figma revolutionized design by making collaboration seamless. Multiple designers could work together in real time, seeing each other’s cursors and making edits simultaneously without merge conflicts.

This required solving complex technical challenges — **real-time synchronization**, **conflict resolution**, and **60 FPS performance** while streaming data across the network.

Now imagine adding AI to this.

> What if you could tell an AI agent “create a login form” and watch it build the components on your canvas?  
> Or say “arrange these elements in a grid” and see it happen automatically?

This project challenges you to build both the **collaborative infrastructure** and an **AI agent** that can manipulate the canvas through natural language.

---

## 💡 Why This Matters

The future of design tools isn’t just collaborative — it’s *co-creative*.  
You’ll be building the foundation for how humans and AI can design together, in real time.

---

## 📅 Project Overview

**Timeline: One-Week Sprint**

| Deadline | Deliverable |
|-----------|--------------|
| **Tuesday (24 hours)** | MVP Checkpoint |
| **Friday (4 days)** | Early Submission |
| **Sunday (7 days)** | Final Submission |

### Phases
1. **Phase 1** – Build the core collaborative canvas (real-time sync)
2. **Phase 2** – Integrate an AI agent that manipulates the canvas via natural language

---

## 🚀 MVP Requirements (24 Hours)

> ⚠️ This is a hard gate — must be completed within 24 hours.

To pass MVP:

- [ ] Basic canvas with pan/zoom  
- [ ] At least one shape type (rectangle, circle, or text)  
- [ ] Ability to create and move objects  
- [ ] Real-time sync between 2+ users  
- [ ] Multiplayer cursors with name labels  
- [ ] Presence awareness (who’s online)  
- [ ] User authentication (accounts/names)  
- [ ] Deployed and publicly accessible  

**Focus:** collaborative infrastructure — not fancy features.  
A *simple, solid multiplayer base* > feature-rich but broken sync.

---

## 🧩 Example Architecture

At minimum, include:

- **Backend:** Firestore, Supabase, or custom WebSocket server broadcasting updates  
- **Frontend:** Listener updating local canvas state and rebroadcasting deltas  
- **Persistence:** Saves current state on disconnect  

---

## 🎨 Core Collaborative Canvas

### Canvas Features
- Large workspace with smooth pan and zoom  
- Basic shapes: rectangles, circles, lines (solid colors)  
- Text layers with basic formatting  
- Object transformations: move, resize, rotate  
- Selection: single, multi-select (shift-click or drag)  
- Layer management: delete, duplicate  

### Real-Time Collaboration
- Multiplayer cursors with names  
- Instant updates on object creation/modification  
- Presence awareness (who’s editing)  
- Conflict resolution (e.g. “last write wins”)  
- Persistent state on disconnect/reconnect  

---

## 🧪 Testing Scenario

Your app will be tested under these conditions:

- 2 users editing simultaneously in different browsers  
- 1 user refreshing mid-edit (state must persist)  
- Rapid object creation/movement to test sync stability  

---

## ⚡ Performance Targets

| Metric | Target |
|---------|---------|
| Frame Rate | 60 FPS (all interactions) |
| Object Sync | <100ms |
| Cursor Sync | <50ms |
| Scalability | 500+ objects, 5+ concurrent users |

---

## 🤖 AI Canvas Agent

### Overview
Build an **AI agent** that manipulates your canvas via natural language (function calling).

**Example:**  
> “Create a blue rectangle in the center” → AI calls your canvas API → rectangle appears for all users in real time.

### Required Capabilities

#### Creation Commands
- “Create a red circle at position 100, 200”  
- “Add a text layer that says ‘Hello World’”  
- “Make a 200x300 rectangle”  

#### Manipulation Commands
- “Move the blue rectangle to the center”  
- “Resize the circle to be twice as big”  
- “Rotate the text 45 degrees”  

#### Layout Commands
- “Arrange these shapes in a horizontal row”  
- “Create a grid of 3x3 squares”  
- “Space these elements evenly”  

#### Complex Commands
- “Create a login form with username and password fields”  
- “Build a navigation bar with 4 menu items”  
- “Make a card layout with title, image, and description”  

---

## 🧮 Example Evaluation Criteria

> When you say “Create a login form,” we expect at least three inputs (username, password, submit), arranged neatly — not just a text box.

---

## 🧠 Technical Implementation

### Function Schema Example
```typescript
createShape(type, x, y, width, height, color)
moveShape(shapeId, x, y)
resizeShape(shapeId, width, height)
rotateShape(shapeId, degrees)
createText(text, x, y, fontSize, color)
getCanvasState() // returns current canvas objects for context