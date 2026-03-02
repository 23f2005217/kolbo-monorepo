# Kolbo Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Application Apps](#application-apps)
7. [Packages](#packages)
8. [API Routes](#api-routes)
9. [Environment Variables](#environment-variables)
10. [Getting Started](#getting-started)

---

## Project Overview

**Kolbo** is a comprehensive video streaming platform built as a monorepo using Turbo and Next.js. The platform supports multiple video content business models including:

- **Video on Demand (VOD)** - Rentals, purchases, and subscriptions
- **Live Streaming** - Real-time streaming with RTMP/SRT support
- **Advertising** - Ad campaigns with targeting and analytics
- **Creator Management** - Revenue sharing and content assignment

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Kolbo Monorepo                           │
├─────────────────────────────────────────────────────────────────┤
│  Apps (Next.js)                                                 │
│  ├── apps/web       - Public-facing streaming platform          │
│  ├── apps/hq        - Admin dashboard/headquarters              │
│  └── apps/ads       - Advertising management portal             │
├─────────────────────────────────────────────────────────────────┤
│  Packages                                                        │
│  ├── packages/auth     - Authentication & sessions              │
│  ├── packages/database - Prisma ORM & query layer               │
│  ├── packages/mux-client - Mux video integration                │
│  └── packages/ui       - Shared UI components                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Monorepo** | Turbo |
| **Database** | PostgreSQL with Prisma ORM |
| **Auth** | Custom session-based auth |
| **Video** | Mux (encoding, streaming, RTMP) |
| **Storage** | AWS S3 |
| **Payments** | Stripe |
| **Styling** | Tailwind CSS + shadcn/ui |

---

## Project Structure

```
kolbo-monorepo/
├── apps/
│   ├── web/               # Public video streaming site
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── browse/   # Browse/search videos
│   │   │   ├── login/    # User login
│   │   │   ├── search/   # Search results
│   │   │   └── signup/   # User registration
│   │   ├── components/   # React components
│   │   │   ├── ui/       # Base UI components
│   │   │   ├── video/    # Video player components
│   │   │   └── videos/   # Video list/card components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand state stores
│   │   └── contexts/     # React contexts
│   │
│   ├── hq/               # Admin headquarters dashboard
│   │   ├── app/
│   │   │   ├── ads/           # Ad analytics
│   │   │   ├── analytics/     # Platform analytics
│   │   │   ├── live/          # Live stream management
│   │   │   ├── marketing/     # Marketing tools
│   │   │   ├── overview/      # Dashboard overview
│   │   │   ├── revshare/      # Revenue sharing
│   │   │   ├── sales/         # Sales reports
│   │   │   ├── subscriptions/ # Subscription management
│   │   │   ├── subsites/      # Multi-site management
│   │   │   └── website/       # Website settings
│   │   ├── components/
│   │   │   ├── calendar/      # Content calendar
│   │   │   ├── live-streaming/# Live stream components
│   │   │   ├── playlists/     # Playlist management
│   │   │   ├── video-edit/    # Video editing forms
│   │   │   └── videos/        # Video management
│   │   ├── hooks/             # Admin-specific hooks
│   │   └── stores/            # Admin state stores
│   │
│   └── ads/               # Advertising platform
│       ├── app/
│       │   ├── api/
│       │   │   ├── analytics/
│       │   │   ├── auth/
│       │   │   ├── campaigns/
│       │   │   ├── creatives/
│       │   │   └── inventory/
│       │   └── campaigns/
│       └── components/
│
├── packages/
│   ├── auth/              # Authentication package
│   │   └── src/
│   │       ├── ads-session.ts  # Ad session handling
│   │       ├── client.ts       # Auth client
│   │       ├── constants.ts    # Auth constants
│   │       ├── password.ts     # Password hashing
│   │       └── session.ts      # Session management
│   │
│   ├── database/          # Database layer
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/
│   │       ├── queries/        # Query functions
│   │       │   ├── ad-analytics.ts
│   │       │   ├── ad-campaigns.ts
│   │       │   ├── ad-creatives.ts
│   │       │   ├── analytics.ts
│   │       │   ├── bundles.ts
│   │       │   ├── calendar.ts
│   │       │   ├── categories.ts
│   │       │   ├── creators.ts
│   │       │   ├── filters.ts
│   │       │   ├── live-streams.ts
│   │       │   ├── playlists.ts
│   │       │   ├── revshare.ts
│   │       │   ├── subscription-plans.ts
│   │       │   ├── subsites.ts
│   │       │   ├── transactions.ts
│   │       │   ├── users.ts
│   │       │   └── videos.ts
│   │       └── prisma.ts       # Prisma client
│   │
│   ├── mux-client/        # Mux video integration
│   └── ui/                # Shared UI components
│
├── plans/                 # This directory - project documentation
├── package.json          # Root package.json with workspaces
├── turbo.json            # Turbo monorepo config
└── .gitignore           # Git ignore rules
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `admins` | Platform administrators |
| `users` | End users/viewers |
| `creators` | Content creators |
| `videos` | Video metadata |
| `video_assets` | Mux asset references |
| `playlists` | Video playlists |
| `live_streams` | Live stream configurations |
| `categories` | Content categorization |
| `filters` | Search/filter definitions |
| `subsites` | Multi-tenant sites |

### Commerce Tables

| Table | Purpose |
|-------|---------|
| `subscription_plans` | Subscription tiers |
| `video_offers` | Rental/purchase pricing |
| `bundles` | Video bundles |
| `transactions` | Payment history |
| `entitlements` | User access rights |
| `profiles` | User profiles (parental control) |

### Advertising Tables

| Table | Purpose |
|-------|---------|
| `advertiser_accounts` | Ad platform users |
| `ad_campaigns` | Campaign definitions |
| `ad_creatives` | Ad content |
| `ad_campaign_analytics` | Campaign performance |
| `ad_inventory` | Available ad slots |

### Revenue Sharing Tables

| Table | Purpose |
|-------|---------|
| `artists` | Artist profiles |
| `artist_videos` | Video-artist relationships |
| `rev_share_agreements` | Revenue split contracts |

### Supporting Tables

- `sessions` - User session data
- `video_images` - Thumbnails/posters
- `subtitles` - Caption files
- `search_tags` - Video tags
- `video_geo_blocks` - Geographic restrictions
- `coupons` - Discount codes
- `push_notifications` - Push notification campaigns

---

## Application Apps

### apps/web (Public Streaming Platform)
- **Purpose**: Public-facing video streaming site for end users
- **Key Features**:
  - Browse/search videos
  - Video playback with gating
  - User authentication
  - Subscription management
  - Search with filters

### apps/hq (Admin Dashboard)
- **Purpose**: Internal headquarters for content and platform management
- **Key Features**:
  - Video upload and management
  - Live stream creation/management
  - Playlist curation
  - Analytics and reporting
  - Ad campaign management
  - Revenue share management
  - Category/filter management
  - User management

### apps/ads (Advertising Platform)
- **Purpose**: Self-service ad platform for advertisers
- **Key Features**:
  - Campaign creation
  - Creative management
  - Targeting configuration
  - Budget management
  - Analytics dashboard

---

## Packages

### @kolbo/auth
Authentication and session management for the platform.

**Exports:**
- `createSession()` - Create new session
- `validateSession()` - Validate session token
- `hashPassword()` / `verifyPassword()` - Password handling
- `getSession()` - Get current session

### @kolbo/database
Prisma ORM wrapper with pre-built query functions.

**Query Modules:**
- Videos, Playlists, Live Streams
- Users, Creators, Admins
- Analytics, Transactions
- Categories, Filters
- Subsites, Bundles

### @kolbo/mux-client
Mux video service integration.

**Features:**
- Asset creation
- Upload signing
- Playback ID generation
- Live stream configuration

### @kolbo/ui
Shared UI component library built with shadcn/ui.

**Components:**
- Alert Dialog, Avatar, Badge, Button
- Card, Checkbox, Collapsible
- Dialog, Dropdown Menu
- Input, Label
- Radio Group, Select
- Separator, Sonner (toast)
- Switch, Table, Tabs
- Textarea, Video Player

---

## API Routes

### apps/web API
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/videos` - List videos
- `GET /api/videos/[id]` - Get video details

### apps/hq API
- Video management endpoints
- User management endpoints
- Analytics endpoints
- Category/filter CRUD

### apps/ads API
- `POST /api/auth/register` - Advertiser signup
- `POST /api/auth/login` - Advertiser login
- `GET/POST /api/campaigns` - Campaign CRUD
- `GET/POST /api/creatives` - Creative management
- `GET /api/inventory` - Ad inventory

---

## Environment Variables

Each app requires specific environment variables:

### Common Required
```
DATABASE_URL=postgresql://...
```

### apps/web
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MUX_ENV_KEY=
```

### apps/hq
```
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### apps/ads
```
STRIPE_SECRET_KEY=
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Mux account (for video)
- Stripe account (for payments)
- AWS S3 bucket (for storage)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development
npm run dev
```

### Development Servers

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps |
| `npm run dev:hq` | Start admin dashboard only |
| `npm run dev:web` | Start public site only |
| `npm run dev:ads` | Start ads portal only |

### Build

```bash
# Build all apps
npm run build

# Lint all apps
npm run lint
```

---

## Database Management

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema (development)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

---

## Features In Detail

### Video Gating System
The platform supports multiple access control types:
- **Free** - Anyone can watch
- **Rental** - Time-limited access
- **Purchase** - Permanent access
- **Subscription** - Access based on subscription plan
- **Ads** - Free with ad support

### Live Streaming
- RTMP/SRT input sources
- Mux Live Streams integration
- Browser-based streaming
- Chat integration
- Scheduled streams

### Multi-Site Support (Subsites)
- Multiple independent sites from one installation
- Per-site ad inventory
- Custom branding options

### Revenue Sharing
- Per-video creator revenue splits
- Subscription revenue sharing
- Artist agreements management

---

*Last Updated: Documentation created from codebase analysis*
*Version: 0.1.0*
