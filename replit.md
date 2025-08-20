# Overview

HackSphere is a full-stack web application for hosting hackathons and listing events, similar to Unstop. The platform enables users to discover and participate in coding competitions while providing organizers with tools to create and manage events. Built with a modern tech stack, it features a React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application is built with React 18 and TypeScript, using Vite as the build tool and development server. The frontend follows a component-based architecture with:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Forms**: React Hook Form with Zod validation

The application structure separates pages, components, hooks, and utilities, with TypeScript path mapping for clean imports. The design system uses a consistent color palette and spacing system defined through CSS custom properties.

## Backend Architecture
The server is built with Express.js and TypeScript, providing a RESTful API architecture:

- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

The backend follows a layered architecture with separate concerns for routing, data access (storage layer), and authentication middleware.

## Database Design
PostgreSQL database with Drizzle ORM providing type-safe schema definitions:

- **Users Table**: Stores user profiles with role-based access (admin, organizer, participant)
- **Events Table**: Contains hackathon/event information with status tracking and categorization
- **Event Registrations**: Junction table linking users to events with team information
- **Leaderboard**: Stores competition results and rankings
- **Sessions Table**: Required for Replit Auth session management

The schema uses proper foreign key relationships and includes audit fields for tracking creation and updates.

## Authentication & Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Three user roles (admin, organizer, participant) with different permissions
- **Protected Routes**: Middleware-based route protection on both frontend and backend

## Development & Deployment
- **Development**: Vite dev server with HMR for frontend, tsx for TypeScript execution
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Configured for Replit deployment with development/production settings
- **Database Migrations**: Drizzle Kit for schema migrations and database management

# External Dependencies

## Core Frameworks
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework for Node.js
- **Vite**: Frontend build tool and development server

## Database & ORM
- **PostgreSQL**: Primary database (configured for Neon serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter
- **@neondatabase/serverless**: Serverless PostgreSQL client

## Authentication
- **Replit Auth**: OAuth authentication provider
- **OpenID Client**: OIDC authentication flow handling
- **Passport.js**: Authentication middleware
- **express-session**: Session management middleware

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation library

## Development Tools
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and introspection tools