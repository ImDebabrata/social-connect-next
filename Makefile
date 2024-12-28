# Makefile for Next.js Project with Prisma

# Define package manager (npm)
PACKAGE_MANAGER = npm

# Install dependencies
install:
	$(PACKAGE_MANAGER) install

# Run the development server (Next.js)
dev:
	$(PACKAGE_MANAGER) run dev

# Build the project (Next.js)
build:
	$(PACKAGE_MANAGER) run build

# Start the production server (Next.js)
start:
	$(PACKAGE_MANAGER) run start

# Lint the code with Next.js ESLint setup
lint:
	$(PACKAGE_MANAGER) run lint

# Run Prisma generate (to generate Prisma client)
prisma:
	$(PACKAGE_MANAGER) run prisma generate

# Clean the build directory (e.g., delete `.next` folder)
clean:
	rm -rf .next

# Run all the steps: install, lint, and build
all: install lint build

# Default target to run when `make` is used without any argument
default: install dev
