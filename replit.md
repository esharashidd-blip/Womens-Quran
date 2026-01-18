# Noor - Islamic Companion App

## Overview

Noor is a mobile-first Islamic companion web application built with React and Express. It provides Muslims with essential daily tools including prayer times, Quran reading with favorites, Qibla compass, Tasbih counter, and Qada prayer tracking. The app uses a soft pink feminine theme and fetches Islamic data from external APIs (Al Quran Cloud for Quran, Aladhan for prayer times).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with HMR support

The frontend follows a page-based structure with shared components. Pages include Home, Prayer, Qibla, Tasbih, More, Quran, SurahView, and Favorites. Custom hooks abstract data fetching logic (use-quran, use-prayer-times, use-favorites, etc.).

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Pattern**: REST API with typed routes using Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Location**: Shared schema in `/shared/schema.ts` for type safety across client and server

The backend serves API endpoints for user data (favorites, qada tracking, settings) while external Islamic data comes directly from third-party APIs on the client side.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Tables**: 
  - `favorites` - Saved Quran verses with Arabic text and translation
  - `qada` - Missed prayer counts per prayer type
  - `settings` - User preferences (city, country, tasbih count)
- **Migrations**: Managed via `drizzle-kit push`

### External Data Sources
- Quran text and translations fetched client-side from Al Quran Cloud API
- Prayer times fetched client-side from Aladhan API
- Qibla direction calculated using Aladhan API with user coordinates
- Reverse geocoding via BigDataCloud API for location detection

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    hooks/        # Custom React hooks for data fetching
    lib/          # Utilities and query client config
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared types and schemas
  schema.ts       # Drizzle table definitions
  routes.ts       # API route type definitions
```

## External Dependencies

### Third-Party APIs
- **Al Quran Cloud API** (`api.alquran.cloud`) - Quran text in Arabic with English translations
- **Aladhan API** (`api.aladhan.com`) - Prayer times by city/coordinates and Qibla direction
- **BigDataCloud API** - Reverse geocoding for auto-detecting user location

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries

### Key NPM Packages
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod schema generation
- `framer-motion` - Animations
- `wouter` - Client-side routing
- `zod` - Runtime type validation
- Full shadcn/ui component library (Radix UI primitives)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string