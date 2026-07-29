# MasterAI

An AI assistant that knows the user and gives personalized guidance.

## Overview

MasterAI is a full-stack web application that enables users to receive personalized AI-driven recommendations and guidance. The platform combines user profiling, real-time chat, and intelligent recommendations to create a tailored experience for each user.

## Features

- **Authentication**: Secure sign-up and login with BetterAuth
- **User Profiles**: Create and manage personalized user profiles with preferences
- **AI Chat**: Real-time conversations with an AI assistant that understands user context
- **Personalized Recommendations**: AI-generated recommendations based on user profile and conversation history
- **Dashboard**: View your profile, conversation history, and recommendations in one place

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: Next.js API Routes
- **Authentication**: BetterAuth
- **Database**: PostgreSQL with Drizzle ORM (Neon)
- **AI Integration**: Gemini API NVIDIA AI model

## Project Structure

```
app/
├── api/                 # API routes
│   ├── auth/           # Authentication endpoints
│   ├── chat/           # Chat endpoint
│   ├── conversations/  # Conversation history
│   └── profile/        # User profile endpoint
├── auth/               # Auth page
├── dashboard/          # Dashboard page
└── page.tsx            # Landing page

db/
├── index.ts            # Database connection
└── schema/             # Drizzle ORM schemas
    ├── user.ts
    ├── conversation.ts
    ├── preference.ts
    └── ...

lib/
├── auth.ts             # Auth utilities
└── auth-client.ts      # Auth client
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd MasterAI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Design System

MasterAI uses a carefully crafted design system with:

- **Colors**: Deep Ink, Warm Paper, Citrus Lime, and Graphite palette
- **Typography**: Newsreader for display, Geist Sans for UI, Geist Mono for metadata
- **Layout**: Editorial asymmetry with thin rules and generous whitespace
- **Motion**: Restrained animations with reduced-motion support

See `mvp.md` for complete design specifications.

## Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Maintain accessibility standards (WCAG 2.1)
- Respect `prefers-reduced-motion` for animations
- Use semantic HTML

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## Contributing Members
* 1.Subransu Sekhar Maharana
* 2.Mrutunjaya Muduli
* 3.Pratap Hati
* 4.Ajit Behera


## License

Private project
