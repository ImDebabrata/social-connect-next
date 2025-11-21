# Social Connect

A modern social media application built with Next.js, inspired by platforms like X (formerly Twitter). Share posts, connect with friends, engage in real-time conversations, and explore trending topics.

## Features

- **User Authentication**: Sign up and sign in with secure JWT-based sessions
- **Posts & Interactions**: Create, like, comment on posts, and bookmark favorites
- **Social Networking**: Follow/unfollow users, view follower/following counts
- **Real-time Messaging**: Direct messaging with typing indicators using Socket.io
- **Notifications**: Stay updated with activity notifications (likes, comments, follows)
- **Search & Explore**: Search for users and posts, explore trending topics
- **Media Uploads**: Upload and manage images with Cloudinary integration
- **Responsive Design**: Modern UI with dark/light theme support
- **Microservices Architecture**: Separate chat service for scalable real-time features

## Tech Stack

### Frontend
- **Next.js 15** - React framework with Server Components
- **React Query (TanStack)** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN(Radix UI)** - Accessible component primitives
- **Socket.io Client** - Real-time communication

### Backend
- **Next.js API Routes** - REST API endpoints
- **Prisma ORM** - Database modeling and queries
- **PostgreSQL** - Primary database (via Docker)
- **JWT** - Authentication tokens

### Microservices
- **Chat Service** - Node.js/Express with Socket.io for real-time messaging
- **TypeScript** - Type-safe development across all services

### DevOps & Tools
- **Docker & Docker Compose** - Containerization and local database
- **Makefile** - Development commands and automation
- **ESLint** - Code linting
- **Yarn** - Package management

## Architecture

The application follows a microservices architecture:

- **Main App** (Next.js): Handles posts, users, authentication, UI
- **Chat Service** (Node.js + Socket.io): Dedicated service for real-time messaging and notifications

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Chat Service   │
│   (Port 3000)   │◄──►│   (Port 3001)  │
│                 │    │                 │
│ • Posts API     │    │ • WebSocket     │
│ • User API      │    │ • Messaging     │
│ • Auth API      │    │ • Typing        │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                PostgreSQL
               (Port 5432)
```

## Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose (for local database)
- PostgreSQL knowledge (basic)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ImDebabrata/social-connect-next.git
   cd social-connect-next
   ```

2. **Install dependencies**
   ```bash
   make install
   # or manually: yarn install
   ```

3. **Set up environment variables**

   Copy the environment template:
   ```bash
   cp .env.example .env
   # or for production: cp .env.prod .env
   ```

   Copy `.env.local` to `.env` or create your own `.env` file with the following variables:

   ```env
   # Application URLs
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NEXT_PUBLIC_CHAT_SERVICE_URL="http://localhost:3001"

   # Database (Either local Docker or remote Postgres like Neon)
   # For local PostgreSQL in Docker:
   # POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/social_connect"
   # For remote PostgreSQL (e.g., Neon):
   POSTGRES_PRISMA_URL="your-postgres-connection-string"

   # JWT Secret for authentication
   JWT_SECRET="your-jwt-secret"
   ```

   See `.env.example` for a template with all required environment variables.

## Running the Application

### Quick Start (Recommended)
Use the Makefile to start all services:
```bash
make start-all
```

This will:
- Start PostgreSQL in Docker
- Run the chat service in the background
- Start the Next.js development server

### Manual Start
If you prefer to run services manually:

1. **Start the database**
   ```bash
   docker compose up -d
   ```

2. **Set up the database**
   ```bash
   make prisma-push
   # or: npx prisma db push
   ```

3. **Start the chat service**
   ```bash
   cd chat-service && yarn start
   ```

4. **Start the main application**
   ```bash
   yarn dev
   ```

### Access the Application

- **Main App**: [http://localhost:3000](http://localhost:3000)
- **Chat Service**: [http://localhost:3001](http://localhost:3001) (API status)

## Available Commands

```bash
# Install dependencies for all services
make install

# Start all services (database + chat + app)
make start-all

# Start only Next.js development server
make dev

# Lint the code
make lint

# Build for production
make build

# Start production server
make start

# Database commands
make prisma          # Generate Prisma client
make prisma-push     # Push schema to database
make prisma-table    # Open Prisma Studio

# Environment setup
make copy-env-local  # Copy .env.local to .env
make copy-env-prod   # Copy .env.prod to .env

# Cleanup
make clean           # Remove build artifacts
```

## Development

### Project Structure

```
social-connect/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (app)/           # Protected routes
│   │   ├── (auth)/          # Auth routes
│   │   └── api/             # API routes
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and configurations
│   └── hooks/               # Custom React hooks
├── chat-service/            # Real-time chat microservice
│   ├── src/
│   │   ├── socket/          # Socket.io handlers
│   │   └── index.ts         # Express server
├── prisma/                  # Database schema
├── public/                  # Static assets
└── docker-compose.yml       # Local database setup
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by social media platforms like X (Twitter)
