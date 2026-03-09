# Replit Agent Guide

## Overview

This is a **Naruto-themed task management application** (called "Ninja Tasks"). Users create, track, and manage tasks styled as ninja missions, with Naruto universe theming including villages, characters, teams, and ninja rank-based priorities (genin, chunin, jonin, kage). The app features XP/leveling, achievements, analytics, sound effects, mission templates, and extensive customization.

## User Preferences

Preferred communication style: Simple, everyday language.
- **CRITICAL**: User explicitly rejected DiceBear/cartoon avatars. Character images MUST use `/images/characters/${id}.png` with `onError={(e) => e.currentTarget.style.display='none'` (no fallback). Available local images: gaara, itachi, jiraiya, kakashi, madara, naruto, pain, sakura, sasuke, tsunade.
- Custom event `hokage-changed` dispatched from App.tsx useEffect, listened in TaskCard.tsx for instant updates.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter — routes: `/` (Dashboard), `/analytics` (Analytics)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod resolver
- **Styling**: Tailwind CSS with CSS variables (dark Naruto-inspired color scheme)
- **UI Components**: shadcn/ui (new-york style) in `client/src/components/ui/`
- **Animations**: Framer Motion for card animations, chakra flow effects, XP bar
- **Sound Effects**: Web Audio API oscillator-based sounds in `client/src/lib/sounds.ts`
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed with tsx
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **API Contract**: Shared route definitions in `shared/routes.ts`
- **Build**: esbuild bundles server code to `dist/index.cjs` for production

### Data Layer
- **Database**: PostgreSQL (via `DATABASE_URL`)
- **ORM**: Drizzle ORM with `drizzle-zod`
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command

### Database Schema
Six tables:
1. **tasks** — id, title, description, status, priority, village, character, team, happiness, chakra, isRecurring, recurringInterval, estimatedMinutes, lastChakraUpdate, createdAt, completedAt
2. **task_updates** — id, taskId (FK), content, createdAt
3. **quick_notes** — id, content, completed, createdAt
4. **user_stats** — id, totalXp, ninjaRank, currentStreak, longestStreak, totalCompleted, totalCreated, lastActiveDate, experience, level, unlockedVillages, updatedAt
5. **achievements** — id, key (unique), title, description, icon, unlockedAt
6. **packing_items** — id, content, category (weapons/scrolls/provisions/attire/medical/tools), packed, listName, createdAt

### API Endpoints
- `GET /api/tasks` — List all tasks with updates
- `POST /api/tasks` — Create a new task (also increments totalCreated stat)
- `GET /api/tasks/:id` — Get single task
- `PATCH /api/tasks/:id` — Update task (grants XP, tracks streaks, checks achievements on completion; creates recurring clone if isRecurring)
- `DELETE /api/tasks/:id` — Delete task
- `POST /api/tasks/:id/updates` — Add mission log entry
- `GET /api/data/export` — Export all data
- `POST /api/data/import` — Import data
- `GET /api/notes` — List quick notes
- `POST /api/notes` — Create note
- `PATCH /api/notes/:id` — Toggle note completion
- `DELETE /api/notes/:id` — Delete note
- `GET /api/stats` — Get user stats (XP, rank, streaks)
- `GET /api/achievements` — List all achievements with unlock status
- `GET /api/packing` — List packing items (optional ?list= filter)
- `POST /api/packing` — Create packing item
- `PATCH /api/packing/:id` — Toggle packed status
- `DELETE /api/packing/:id` — Delete packing item
- `DELETE /api/packing/list/:name` — Clear entire packing list
- `GET /api/music/search?q=...` — Search songs via Deezer API (returns 30s previews)
- `GET /api/music/playlist/:name` — Fetch curated playlists (naruto_openings, naruto_endings, naruto_ost, naruto_lofi)

### Key Features
1. **XP/Leveling System**: Earn XP per task completion (10/25/50/100 by priority). Ranks: Academy Student → Genin → Chunin → Jonin → ANBU → Kage
2. **Achievements**: 17 badges for milestones (completions, streaks, XP, rank-ups). Auto-unlock on task completion.
3. **Daily Streaks**: Tracked via lastActiveDate. Consecutive days increment streak.
4. **Analytics Dashboard**: `/analytics` page with completion gauge, priority breakdown, village distribution, 14-day activity chart
5. **Sound Effects**: Oscillator-based sounds for task complete, create, clone, delete, recurring toggle
6. **Mission Templates**: 6 pre-built templates (Training, Delivery, Intel, Boss Battle, Study, Workout) in CreateTaskDialog
7. **Time Estimates**: Optional estimatedMinutes field on tasks
8. **Priority Auto-Adjust**: Tasks >3 days old get orange glow, >7 days get red pulsing glow
9. **Break Suggestions**: After every 3rd completion, a "Chakra Restoration" toast suggests a break
10. **Chakra Flow Animation**: Dynamic particle animation on task completion
11. **Shadow Clone Jutsu**: Duplicate any task with one click
12. **Summoning Jutsu**: Toggle recurring on any task; completing a recurring task auto-creates a new pending copy
13. **Hokage Overseer**: Selectable Hokage shown on Leaf Village task cards
14. **Settings Panel**: Theme, font, Hokage selection, accent color (village presets + custom color wheel)
15. **Sidebar Tools**: NinjaQuickStats, Achievements, Timer (Sage Mode with presets), Mission Prep, Calendar, Quick Notes, Music Player (Deezer-powered)
16. **Mission Prep Packing List**: Category-organized packing checklist (weapons/scrolls/provisions/attire/medical/tools) with quick-add templates, progress bar, animated check-offs, collapsible categories, multiple named lists, unpack-all, and clear-all

### Key Design Decisions
1. **Shared schema and routes**: `shared/` directory ensures type safety across full stack
2. **Storage abstraction**: `server/storage.ts` IStorage interface
3. **Naruto theming is data-driven**: SHINOBI_DATA constant in `client/src/hooks/use-tasks.ts`
4. **Sound system**: No audio files needed — Web Audio API generates all sounds programmatically
5. **Achievements**: Definitions live in server routes, checked on each task completion
6. **LocalStorage keys**: `ninja-theme`, `ninja-font`, `ninja-selected-hokage`, `ninja-accent`, `ninja-accent-custom`, `ninja-sage-duration`, `ninja-break-duration`, `ninja-forest`, `ninja-completion-counter`, `ninja-packing-lists`, `ninja-active-packing-list`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Via `DATABASE_URL` environment variable

### Key NPM Dependencies
- **drizzle-orm** + **drizzle-kit**: ORM and migration tooling
- **express**: HTTP server (v5)
- **@tanstack/react-query**: Async state management
- **framer-motion**: Animation library
- **zod** + **drizzle-zod**: Schema validation
- **react-hook-form**: Form state management
- **wouter**: Client-side routing
- **shadcn/ui components**: Radix UI primitives
- **date-fns**: Date formatting/manipulation
- **lucide-react**: Icon library
