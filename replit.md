# Replit Agent Guide

## Overview

This is a **Naruto-themed task management application** (called "Ninja Mission Log"). Users create, track, and manage tasks styled as ninja missions, with Naruto universe theming including villages, characters, teams, and ninja rank-based priorities (genin, chunin, jonin, kage). The app supports task updates/comments, import/export via JSON files, and filtering by status.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state (caching, mutations, invalidation)
- **Forms**: React Hook Form with Zod resolver for validation
- **Styling**: Tailwind CSS with CSS variables for theming (dark Naruto-inspired color scheme)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives — all components live in `client/src/components/ui/`
- **Animations**: Framer Motion for card animations and transitions
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed with tsx
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **API Contract**: Shared route definitions in `shared/routes.ts` with Zod schemas for input validation — both client and server import from the same source
- **Build**: esbuild bundles server code to `dist/index.cjs` for production; Vite builds client to `dist/public/`

### Data Layer
- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation-schema generation
- **Schema Location**: `shared/schema.ts` — shared between client and server
- **Migrations**: Drizzle Kit with `db:push` command (push-based, no migration files tracked)
- **Connection**: `pg` Pool via `server/db.ts`

### Database Schema
Two tables:
1. **tasks** — id, title, description, status (pending/completed), priority (genin/chunin/jonin/kage), village, character, team, createdAt, completedAt
2. **task_updates** — id, taskId (FK to tasks with cascade delete), content, createdAt

### API Endpoints
- `GET /api/tasks` — List all tasks with their updates
- `POST /api/tasks` — Create a new task
- `GET /api/tasks/:id` — Get a single task with updates
- `PATCH /api/tasks/:id` — Update a task
- `DELETE /api/tasks/:id` — Delete a task
- `POST /api/tasks/:id/updates` — Add an update/comment to a task
- `GET /api/export` — Export all data
- `POST /api/import` — Import data

### Key Design Decisions
1. **Shared schema and routes**: The `shared/` directory contains both the database schema and API route contracts, ensuring type safety across the full stack. Both client and server import from the same source of truth.
2. **Storage abstraction**: `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation, allowing the storage backend to be swapped if needed.
3. **Naruto theming is data-driven**: Character, team, and village data lives in `client/src/hooks/use-tasks.ts` as a `SHINOBI_DATA` constant — it's client-side only and not stored in the database beyond string IDs.
4. **Dev vs Production serving**: In development, Vite dev server middleware handles the frontend (with HMR). In production, the Express server serves static files from `dist/public/`.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and accessible via `DATABASE_URL` environment variable. Used for all persistent data storage.

### Key NPM Dependencies
- **drizzle-orm** + **drizzle-kit**: ORM and migration tooling for PostgreSQL
- **express**: HTTP server framework (v5)
- **@tanstack/react-query**: Async state management on the client
- **framer-motion**: Animation library for UI transitions
- **zod** + **drizzle-zod**: Schema validation (shared between client/server)
- **react-hook-form**: Form state management
- **wouter**: Client-side routing
- **shadcn/ui components**: Built on Radix UI primitives (accordion, dialog, tabs, select, toast, etc.)
- **date-fns**: Date formatting
- **connect-pg-simple**: PostgreSQL session store (available but sessions may not be actively used yet)
- **lucide-react**: Icon library

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer** and **@replit/vite-plugin-dev-banner**: Dev-only Replit integration plugins