PACKAGE_MANAGER = yarn

# ──────────────────────────────────────────────
# Dependencies
# ──────────────────────────────────────────────

# Install dependencies for main app
install:
	$(PACKAGE_MANAGER) install

# Install dependencies for chat-service
install-chat:
	cd chat-service && $(PACKAGE_MANAGER) install

# Install all dependencies (main app + chat-service)
install-all: install install-chat

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

# Run Next.js dev server (dev environment)
dev:
	$(PACKAGE_MANAGER) dev

# Run Next.js dev server (production environment)
dev-prod:
	$(PACKAGE_MANAGER) dev:prod

# Run chat-service in dev mode (dev environment)
dev-chat:
	cd chat-service && $(PACKAGE_MANAGER) dev

# Run chat-service in dev mode (production environment)
dev-chat-prod:
	cd chat-service && $(PACKAGE_MANAGER) dev:prod

# Start all services in dev mode (Docker DB + chat-service + Next.js)
start-all:
	@echo "Starting PostgreSQL in Docker..."
	docker compose up -d
	@echo "Starting chat-service (dev)..."
	cd chat-service && $(PACKAGE_MANAGER) dev &
	@echo "Starting Next.js development server..."
	$(PACKAGE_MANAGER) dev

# Start all services in prod mode (Docker DB + chat-service + Next.js)
start-all-prod:
	@echo "Starting PostgreSQL in Docker..."
	docker compose up -d
	@echo "Starting chat-service (prod)..."
	cd chat-service && $(PACKAGE_MANAGER) dev:prod &
	@echo "Starting Next.js development server (prod env)..."
	$(PACKAGE_MANAGER) dev:prod

# ──────────────────────────────────────────────
# Build & Production
# ──────────────────────────────────────────────

# Build the project (uses current .env)
build:
	$(PACKAGE_MANAGER) build

# Build with dev environment
build-dev:
	$(PACKAGE_MANAGER) build:dev

# Build with production environment
build-prod:
	$(PACKAGE_MANAGER) build:prod

# Build chat-service
build-chat:
	cd chat-service && $(PACKAGE_MANAGER) build

# Start the production server (Next.js)
start:
	$(PACKAGE_MANAGER) start

# ──────────────────────────────────────────────
# Code Quality
# ──────────────────────────────────────────────

# Lint the code with ESLint
lint:
	$(PACKAGE_MANAGER) lint

# Format code with Prettier
format:
	$(PACKAGE_MANAGER) format

# Check formatting without writing (for CI)
format-check:
	$(PACKAGE_MANAGER) format:check

# ──────────────────────────────────────────────
# Database (Prisma)
# ──────────────────────────────────────────────

# Generate Prisma client
prisma:
	$(PACKAGE_MANAGER) prisma generate

# Push schema to database
prisma-push:
	npx prisma db push

# Open Prisma Studio (visual DB browser)
prisma-table:
	npx prisma studio

# ──────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────

# Start Docker containers
docker-run:
	@command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Exiting."; exit 1; }
	@echo "Starting Docker containers with 'docker compose up'..."
	docker compose up

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

# Clean Next.js build directory
clean:
	@echo "Cleaning the build directory..."
	@if [ -d ".next" ]; then \
		rm -rf .next; \
		echo "Deleted .next directory"; \
	else \
		echo ".next directory does not exist."; \
	fi

# Clean chat-service build directory
clean-chat:
	@echo "Cleaning chat-service dist..."
	@if [ -d "chat-service/dist" ]; then \
		rm -rf chat-service/dist; \
		echo "Deleted chat-service/dist directory"; \
	else \
		echo "chat-service/dist directory does not exist."; \
	fi

# Clean all build artifacts
clean-all: clean clean-chat

# ──────────────────────────────────────────────
# Composite Targets
# ──────────────────────────────────────────────

# Run all checks: install, lint, format check, and build
all: install lint format-check build

# Default target
default: install dev
