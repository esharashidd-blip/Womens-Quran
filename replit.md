# Noor - Islamic Companion App

## Overview

Noor is a mobile-first Islamic companion web application built with React and Express, designed specifically for Muslim women. It provides essential daily tools including prayer times, Quran reading with favorites, Qibla compass, Tasbih counter, Qada prayer tracking, women-focused Quran guidance ("For You"), and comprehensive pilgrimage guides. The app uses a soft pink feminine theme and fetches Islamic data from external APIs (Al Quran Cloud for Quran, Aladhan for prayer times).

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

The frontend follows a page-based structure with shared components. Custom hooks abstract data fetching logic (use-quran, use-prayer-times, use-favorites, etc.).

### Navigation Structure
- **Bottom Navigation**: Home | Prayer | For You 🤍 | Quran | More (5-tab bar)
- **Pages**:
  - `Home` - Prayer-focused dashboard with location selector (search/select from popular cities + auto-detect), next prayer countdown, Hijri date, daily inspiration
  - `PrayerTab` - Combined prayer page with sub-tabs:
    - Times: Full prayer schedule + Qibla link
    - Qada: Missed prayer tracker with +/- buttons
    - Tasbih: Digital prayer beads counter
  - `ForYou` - Women-focused Quran guidance with:
    - Search bar for topics
    - Quick Picks (6 popular topics)
    - 5 category sections with 12 topics total (Anxiety, Heartbreak, Self-Worth, Protection, Patience, Peace, Stress, Sadness, Loneliness, Gratitude, Forgiveness, Trust)
    - Swipeable card experience: Ayah → Meaning → Dua → Action
  - `Quran` - Surah list with search
  - `SurahView` - Individual surah with Arabic + English verses
  - `Qibla` - Compass direction to Mecca
  - `Duas` - Daily supplications with 9 categories (68 authentic duas with search)
  - `Favorites` - Saved Quran verses
  - `UmrahGuide` - 8-step Umrah guide with duas
  - `HajjGuide` - Day-by-day Hajj guide with tips and common mistakes
  - `More` - Feature hub with links to Duas, Favorites, Umrah Guide, Hajj Guide, Shop, and Settings

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
- Prayer times fetched client-side from Aladhan API (includes Hijri date)
- Qibla direction calculated using Aladhan API with user coordinates
- Reverse geocoding via BigDataCloud API for location detection

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components (BottomNav, etc.)
    pages/        # Route-level page components
      Home.tsx         # Prayer dashboard
      PrayerTab.tsx    # Times/Qada/Tasbih sub-tabs
      ForYou.tsx       # Women's Quran guidance
      Quran.tsx        # Surah list
      SurahView.tsx    # Surah reader
      Qibla.tsx        # Qibla compass
      Duas.tsx         # Duas & Adhkar
      Favorites.tsx    # Saved verses
      UmrahGuide.tsx   # Umrah steps
      HajjGuide.tsx    # Hajj guide
      More.tsx         # Settings & links
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
- **Aladhan API** (`api.aladhan.com`) - Prayer times by city/coordinates, Qibla direction, Hijri date
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
- `date-fns` - Date formatting

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string

## Recent Changes
- Restructured navigation: Home | Prayer | For You 🤍 | Quran | More
- Added location selector with search/select from 30+ popular cities (no manual typing)
- Created combined Prayer tab with Times/Qada/Tasbih sub-tabs
- Built "For You 🤍" feature: Women-focused Quran guidance with 12 emotional/spiritual topics
- Added Umrah Guide (8 steps with duas)
- Added Hajj Guide (day-by-day with tips and common mistakes)
- Expanded Duas & Adhkar to 68 duas across 9 categories with search
