# ReachMAI Development Instructions

This is a comprehensive MAI platform built with modern web technologies to serve students, parents, teachers, and administrators.

## Tech Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast build tooling and development server
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching (planned)

## Project Structure
```
src/
├── components/        # Reusable UI components
├── features/          # Feature-based modules
│   ├── auth/         # Authentication & profile switching
│   ├── users/        # User management
│   ├── organizations/# Org structure management
│   └── scheduling/   # Calendar & enrollment
├── lib/              # Utilities and helpers
├── types/            # TypeScript definitions
├── store/            # State management (planned)
└── api/              # API integration
```

## Key Features Implemented
- **Multi-Profile Authentication**: Support for students, parents, teachers, and adults
- **Profile Switching**: Seamless switching between different user roles
- **Role-Based Navigation**: Dynamic navigation based on user type
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Comprehensive Type System**: Full TypeScript coverage for MAI domain

## Development Workflow
1. Use feature-based development in `src/features/`
2. Create reusable components in `src/components/`
3. Define types in `src/types/index.ts`
4. Mock data has been removed - use real API integration
5. Follow the established patterns for new features

## User Types & Navigation
- **Students**: Dashboard, Schedule, Assignments, Progress
- **Parents**: Dashboard, Schedule, Students, Enrollments, Billing
- **Teachers**: Dashboard, Schedule, Classes, Attendance, Assignments, Payroll
- **Adults**: Dashboard, Schedule, Programs, Events

## Quick Start
1. Run `npm run dev` or use VS Code task "ReachMAI: Start Dev Server"
2. Open http://localhost:5173
3. Click any demo scenario to test different user profiles
4. Use profile switcher in header to change roles

## Development Guidelines
- Use TypeScript for all new files
- Follow React best practices with functional components and hooks
- Use Tailwind CSS utility classes
- Implement proper error boundaries and loading states
- Write comprehensive types for new features
- Use the established component patterns