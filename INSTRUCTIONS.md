# CoopStream

## 🧠 Overview

CoopStream is a **local-first real-time stream tool** designed for streamers to manage and display challenges during live sessions (e.g. CS2 challenges with rewards).

The app is composed of two main parts:

* **Admin interface** (control panel)
* **Overlay** (displayed in OBS via Browser Source)

The system is **fully local**, with no backend required for the MVP.

---

## 🎯 Goals

* Real-time challenge updates during a stream
* Clean and elegant UI (Elgato / OBS style)
* Lightweight architecture (no heavy backend)
* Portfolio-quality codebase (clean, structured, scalable)

---

## 🧩 Core Features

### Admin Panel (`/admin`)

* Create / edit challenges
* Select current challenge
* Trigger events (animations, rewards)
* Control overlay in real-time

### Overlay (`/overlay`)

* Display current challenge
* Animate transitions
* Show notifications (new challenge, reward)
* Designed for OBS Browser Source (1920x1080)

---

## ⚡ Real-Time Communication

Uses **BroadcastChannel API** (local only):

* Admin sends events
* Overlay listens and updates instantly

No WebSocket or backend required.

Fallback possible with `localStorage` if needed.

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS v4
* shadcn/ui (Nova preset)
* Framer Motion (animations)
* Zustand (state management)
* Zod (validation)

### Architecture

* Local-first (no backend)
* Modular structure
* Clean separation between UI, state, and sync logic

---

## 📁 Project Structure

```
/app
  /(admin)/admin/page.tsx
  /overlay/page.tsx
  /layout.tsx

/components
  /admin
  /overlay

/lib
  /store        # Zustand stores
  /sync         # BroadcastChannel logic
  /types        # TypeScript types
  /utils        # Helpers

/styles
  globals.css
```

---

## 🔄 Event System

### Example event

```ts
{
  type: "SET_CHALLENGE",
  payload: {
    id: string;
    title: string;
  }
}
```

### Flow

1. Admin triggers action
2. Event sent via BroadcastChannel
3. Overlay receives event
4. Zustand store updates
5. UI re-renders instantly

---

## 🎨 Design System

### Style Direction

* Dark UI
* Minimal, premium look
* Inspired by Elgato / OBS overlays

### Visual Guidelines

* Soft glow accents
* Subtle animations
* Clean typography
* High readability for stream viewers

---

## 🚀 Roadmap

### MVP

* [ ] Basic admin UI
* [ ] Overlay display
* [ ] Zustand store
* [ ] BroadcastChannel sync

### V1

* [ ] Animations (Framer Motion)
* [ ] Challenge transitions
* [ ] Reward system (roulette)

### V2 (optional)

* [ ] Persistence (localStorage)
* [ ] Twitch chat integration
* [ ] Viewer interaction

---

## 💡 Notes

* The app is intentionally local-first for speed and simplicity
* Architecture is designed to allow future migration to a backend if needed
* Focus is on **UX + real-time interaction**

---

## 🧪 Dev

```bash
npm run dev
```

Overlay:

```
http://localhost:3000/overlay
```

Admin:

```
http://localhost:3000/admin
```

---

## 🎥 OBS Setup

* Add **Browser Source**
* URL: `http://localhost:3000/overlay`
* Resolution: `1920x1080`
* Enable transparency if needed

---

## 📌 Vision

CoopStream aims to be a **powerful but simple tool for stream interaction**, starting local-first and evolving into a more advanced system if needed.
