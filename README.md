# 🏰 Tavern Gate

**Tavern Gate** is an AI-powered online tabletop RPG platform inspired by Dungeons & Dragons. Players can create campaigns, gather in multiplayer rooms, create characters, perform actions turn-by-turn, and experience dynamically generated narratives powered by AI.

The project combines real-time multiplayer communication with AI-assisted storytelling to create an interactive tabletop RPG experience directly in the browser.

---

## ✨ Features

### 📜 Campaign Management

- Create and manage custom campaigns
- Configure campaign world settings
- Define campaign descriptions and story context
- Edit and delete owned campaigns
- Select campaigns when creating a game room

### 🏰 Multiplayer Rooms

- Create and join game rooms
- Unique room codes
- Configurable maximum player count
- Host and player roles
- Real-time player presence
- Host controls
- Remove players from a room
- Waiting and playing room states

### ⚔️ Turn-Based Gameplay

- Turn-based player actions
- Track submitted actions for each player
- Automatically determine remaining players
- Maintain a chronological game-event timeline
- Synchronize game state between connected players

### 🎲 Game Events

Gameplay is represented through a unified event system, including:

- Player actions
- AI narration
- Dice rolls
- System/game events

This allows the game history to function as a persistent timeline rather than relying on separate message and gameplay systems.

### 🤖 AI Dungeon Master

Tavern Gate uses AI to help act as the Dungeon Master.

The AI can:

- Generate opening narratives
- Continue the story based on player actions
- Use campaign and world context
- React dynamically to gameplay events
- Maintain narrative progression throughout the adventure

### 🔐 Authentication

Tavern Gate supports two authentication methods:

- Registered user authentication
- Guest sessions

Guest players can quickly enter the game without creating a permanent account.

### ⚡ Real-Time Multiplayer

Real-time communication is powered by Socket.IO.

The socket system handles events such as:

- Joining rooms
- Leaving rooms
- Room synchronization
- Player presence
- Game state updates
- Game event creation
- AI response notifications
- Player removal

Socket connections use short-lived authentication tokens so that the standalone Socket.IO server can securely authenticate users without directly relying on browser cookies.

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Zustand

### Backend

- Next.js API Routes
- Node.js
- Socket.IO

### Database

- PostgreSQL
- Drizzle ORM
- Supabase

### Authentication

- Better Auth
- Custom guest authentication
- JWT-based Socket.IO authentication

### AI

- Google Gemini

### Deployment

- Vercel — Next.js application
- Render — Socket.IO server
- Supabase — PostgreSQL database

---

## 🏗️ Architecture

Tavern Gate separates the web application and real-time server.

```text
                        ┌─────────────────────┐
                        │       Browser       │
                        │      Next.js UI     │
                        └──────────┬──────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
              HTTP / REST                    Socket.IO
                   │                               │
                   ▼                               ▼
        ┌────────────────────┐          ┌────────────────────┐
        │      Vercel        │          │       Render       │
        │                    │          │                    │
        │ Next.js API Routes │          │ Socket.IO Server   │
        │ Authentication     │          │ Real-time Events   │
        │ Game Logic         │          │ Room Broadcasting  │
        └─────────┬──────────┘          └──────────┬─────────┘
                  │                                │
                  └──────────────┬─────────────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │     Supabase      │
                       │    PostgreSQL     │
                       └───────────────────┘
```

The Next.js application handles authoritative operations such as authentication, database mutations, and game logic.

The standalone Socket.IO server is responsible primarily for real-time communication and broadcasting state changes between connected players.

---

## 🔐 Socket Authentication Flow

Because the Next.js application and Socket.IO server can run on different domains, browser authentication cookies cannot simply be shared between them.

Tavern Gate therefore uses short-lived socket authentication tokens.

```text
Browser
   │
   │ Authenticated Cookie
   ▼
Next.js
/api/socket-token
   │
   │ Short-lived JWT
   ▼
Browser
   │
   │ socket.auth.token
   ▼
Socket.IO Server
   │
   │ Verify JWT
   ▼
Authenticated Socket Connection
```

This works for both registered and guest users while keeping authentication secrets server-side.

---

## 🎮 Game Flow

A typical game session looks like:

```text
Create Campaign
      │
      ▼
Create Room
      │
      ▼
Players Join
      │
      ▼
Create / Select Characters
      │
      ▼
Host Starts Game
      │
      ▼
AI Generates Opening Narrative
      │
      ▼
Players Submit Actions
      │
      ▼
All Actions Submitted
      │
      ▼
AI Generates Next Narrative
      │
      ▼
Next Turn
```

Game activity is stored as events, allowing the complete adventure to be reconstructed as a chronological timeline.

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── rooms/
│   │   └── socket-token/
│   │
│   └── ...
│
├── components/
│   ├── ui/
│   └── ...
│
├── db/
│   ├── schema/
│   └── ...
│
├── lib/
│   ├── socket-auth.ts
│   └── ...
│
├── server/
│   ├── socket.ts
│   └── ...
│
├── stores/
│   └── auth-store.ts
│
└── types/
```

The exact structure may evolve as development continues.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- PostgreSQL database
- Google OAuth credentials
- Google Gemini API credentials

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

Example:

```env
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SOCKET_AUTH_SECRET=

NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Add your Gemini environment variable here
GEMINI_API_KEY=
```

> Never expose database credentials, authentication secrets, or AI API keys using `NEXT_PUBLIC_*`.

### 4. Set up the database

Generate Drizzle migrations:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

Alternatively, during development:

```bash
npm run db:push
```

### 5. Start Next.js

```bash
npm run dev
```

The web application should be available at:

```text
http://localhost:3000
```

### 6. Start the Socket.IO server

Open another terminal:

```bash
npm run dev:socket
```

The local Socket.IO server runs separately from the Next.js development server.

---

## 📦 Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run dev:socket
```

Starts the Socket.IO development server.

```bash
npm run build
```

Builds the Next.js application.

```bash
npm run build:socket
```

Compiles the standalone Socket.IO server.

```bash
npm run start
```

Starts the production Next.js server.

```bash
npm run start:socket
```

Starts the compiled Socket.IO server.

```bash
npm run db:generate
```

Generates Drizzle database migrations.

```bash
npm run db:migrate
```

Runs database migrations.

```bash
npm run db:push
```

Pushes schema changes directly to the database.

```bash
npm run db:studio
```

Opens Drizzle Studio.

---

## 🌐 Deployment

The production application uses separate services:

| Service  | Purpose                     |
| -------- | --------------------------- |
| Vercel   | Next.js frontend and API    |
| Render   | Persistent Socket.IO server |
| Supabase | PostgreSQL database         |

### Vercel

Configure the required environment variables, including:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://your-domain.vercel.app

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SOCKET_AUTH_SECRET=
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com

GEMINI_API_KEY=
```

### Render

The Socket.IO service requires:

```env
DATABASE_URL=
SOCKET_AUTH_SECRET=
FRONTEND_URL=https://your-domain.vercel.app
```

The value of `SOCKET_AUTH_SECRET` must match the value configured in the Next.js application.

Build command:

```bash
npm install && npm run build:socket
```

Start command:

```bash
npm run start:socket
```

---

## 🗺️ Roadmap

Tavern Gate is actively being developed. Potential future improvements include:

- Improved character creation
- Character inventories and equipment
- Character stats and abilities
- Integrated dice system
- Richer AI Dungeon Master context
- Campaign memory
- Improved world-state tracking
- Better reconnect and session recovery
- Spectator mode
- Campaign history
- Game summaries
- Improved multiplayer presence
- More Dungeon Master controls

---

## 🎯 Project Motivation

Tavern Gate explores how traditional tabletop RPG mechanics can be combined with modern web technologies and generative AI.

The project focuses on several technical challenges:

- Real-time multiplayer synchronization
- AI-driven narrative generation
- Persistent game state
- Turn-based multiplayer systems
- Cross-service authentication
- Guest and registered-user authentication
- Event-driven game architecture

Rather than replacing player creativity, the AI Dungeon Master is designed to provide narrative support that reacts to the choices made by the players.

---

## 📄 License

This project is currently intended for personal and educational use.

---

<p align="center">
  <strong>Gather your party. Enter the Tavern. Begin your adventure.</strong>
</p>
