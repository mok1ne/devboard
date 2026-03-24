# DevBoard 🚀

A production-grade Kanban board for dev teams — built with Next.js 14, TypeScript, SASS, Zustand, Prisma & PostgreSQL.

![DevBoard](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat-square&logo=postgresql)

## Features

- **Kanban Board** — 5 columns: Backlog → Todo → In Progress → In Review → Done
- **Drag & Drop** — smooth DnD with @dnd-kit, persists to DB
- **Authentication** — GitHub OAuth + email/password via NextAuth v5
- **Projects** — multiple projects, invite team members by email
- **Tasks** — priority, due dates, assignee, Markdown description, labels
- **Zustand** — optimistic UI updates, filters, search
- **SASS** — custom design system, dark/light theme, no UI libraries
- **Roles** — Owner / Member per project

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | SASS + CSS Modules |
| State | Zustand + Immer |
| Auth | NextAuth.js v5 |
| ORM | Prisma |
| Database | PostgreSQL |
| Drag & Drop | @dnd-kit |
| Deployment | Vercel + Railway |

## Project Structure

```
devboard/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts        # Registration endpoint
│   │   ├── projects/route.ts            # GET, POST projects
│   │   ├── tasks/
│   │   │   ├── route.ts                 # GET, POST tasks
│   │   │   └── [id]/route.ts            # PATCH, DELETE task
│   │   └── members/route.ts             # Invite member
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx               # Main board page
│   ├── layout.tsx
│   └── page.tsx                         # Redirect logic
├── components/
│   ├── board/
│   │   ├── Board.tsx                    # DnD context + columns
│   │   ├── KanbanColumn.tsx             # Droppable column
│   │   ├── TaskCard.tsx                 # Sortable task card
│   │   ├── TaskModal.tsx                # Create/edit task
│   │   └── CreateProjectModal.tsx
│   └── layout/
│       └── Sidebar.tsx
├── lib/
│   ├── auth.ts                          # NextAuth config
│   ├── prisma.ts                        # Prisma singleton
│   └── types.ts                         # Shared TypeScript types
├── store/
│   └── board.store.ts                   # Zustand stores
├── styles/
│   ├── _variables.scss                  # Design tokens
│   ├── globals.scss
│   ├── components/
│   │   ├── _button.scss
│   │   ├── _sidebar.scss
│   │   ├── _task-card.scss
│   │   ├── _board.scss
│   │   └── _modal.scss
│   └── pages/
│       ├── _auth.scss
│       └── _dashboard.scss
├── prisma/
│   └── schema.prisma
└── middleware.ts                        # Route protection
```

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/devboard.git
cd devboard
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# PostgreSQL (Railway: railway.app → New Project → Add PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/devboard"

# NextAuth secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-random-secret"
AUTH_URL="http://localhost:3000"

# GitHub OAuth (github.com/settings/applications/new)
# Homepage URL: http://localhost:3000
# Callback URL: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Frontend + API)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Railway (PostgreSQL)

1. Go to [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy `DATABASE_URL` from the Connect tab
4. Set `AUTH_URL` to your Vercel domain: `https://your-app.vercel.app`

## Key Implementation Details

### Drag & Drop (DnD Kit)

Tasks use `useSortable` from `@dnd-kit/sortable`. On drag end, status and position are updated:
1. **Optimistically** via Zustand (`moveTask`)
2. **Persisted** via `PATCH /api/tasks/:id`

### Authentication Flow

- **GitHub OAuth** → `PrismaAdapter` creates User + Account
- **Credentials** → bcrypt password check, JWT session
- **Middleware** protects all `/dashboard` routes server-side

### Zustand Store

Two stores:
- `useBoardStore` — tasks, project, filters, optimistic updates
- `useUIStore` — sidebar, theme, modal state

### SASS Architecture

No UI library. Everything is hand-crafted using:
- `_variables.scss` — design tokens (colors, spacing, typography)
- CSS custom properties for theming (`data-theme="dark/light"`)
- BEM methodology for component styles

## Interview Talking Points

When presenting this project:

1. **Architecture** — explain App Router, Server Components vs Client Components
2. **Optimistic updates** — show how Zustand updates UI before API responds
3. **Auth** — walk through the NextAuth JWT flow and route middleware
4. **DB schema** — explain relations: User → Project (via Member) → Task
5. **DnD** — explain the drag over + drag end split (status change vs position)
6. **SASS** — explain the design token system and BEM approach

## License

MIT
