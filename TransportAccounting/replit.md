# Overview

This is a full-stack Arabic accounting application called "حسابات حسن" (Hassan's Accounts). It's a Progressive Web App (PWA) designed for mobile use, providing business accounting functionality with customer and expense tracking. The application follows a modern architecture with a TypeScript/React frontend and Node.js/Express backend, utilizing PostgreSQL with Drizzle ORM for data persistence.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling
- **PWA Features**: Manifest file, service worker for offline caching
- **Internationalization**: Arabic RTL layout with Cairo font

## Backend Architecture
- **Runtime**: Node.js with TypeScript (tsx for development)
- **Framework**: Express.js with REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle with code-first schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Backup Strategy**: In-memory storage fallback (MemStorage class)

# Key Components

## Database Schema
- **Customers Table**: Tracks customer information including name, goods type, car count, delivery amount, and status
- **Expenses Table**: Records business expenses with description and amount
- **Shared Types**: TypeScript interfaces generated from Drizzle schema

## API Endpoints
- `GET/POST /api/customers` - Customer CRUD operations
- `PUT /api/customers/:id` - Update customer records
- `GET/POST /api/expenses` - Expense management (structure exists)
- Error handling with Zod validation and proper HTTP status codes

## UI Components
- **shadcn/ui**: Complete component library with Arabic RTL support
- **Forms**: Customer and expense forms with validation
- **Data Display**: Cards, tables, and responsive layouts
- **Mobile-First**: Touch-friendly interface optimized for mobile devices

# Data Flow

1. **Client Request**: React components trigger API calls via TanStack Query
2. **API Layer**: Express routes handle requests with Zod validation
3. **Storage Layer**: Drizzle ORM manages PostgreSQL operations
4. **Response**: JSON data returned to frontend with proper error handling
5. **State Management**: TanStack Query caches and synchronizes server state
6. **UI Updates**: React components re-render based on query state changes

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives for shadcn/ui components
- **react-hook-form**: Form state management with validation

## Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **tailwindcss**: Utility-first CSS framework
- **vite**: Modern build tool with HMR

# Deployment Strategy

## Development Environment
- **Runtime**: Node.js 20 with automatic restart via tsx
- **Database**: PostgreSQL 16 module in Replit
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Hot Reload**: Vite dev server with runtime error overlay

## Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Uses DATABASE_URL environment variable for connection

## Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Environment**: Automatic database provisioning

# Changelog

Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Updated design to match mobile app layout inspired by user-provided image
- June 27, 2025. Changed payment status from delivery tracking to payment tracking (paid/unpaid)
- June 27, 2025. Redesigned UI with modern mobile-first approach, similar to the reference image
- June 27, 2025. Added date-based organization of daily operations with expand/collapse functionality
- June 27, 2025. Implemented clear all data feature with confirmation dialog
- June 27, 2025. Changed currency to Iraqi Dinar (د.ع) throughout the application
- June 27, 2025. Changed goods type input to manual text input instead of predefined dropdown
- June 27, 2025. Added designer credits footer for Ahmed Al-Obaidi and Hassan Al-Kartani

# User Preferences

Preferred communication style: Simple, everyday language.