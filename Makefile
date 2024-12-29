# Define package manager (yarn)
PACKAGE_MANAGER = yarn

# Install dependencies
install:
	$(PACKAGE_MANAGER) install

# Run the development server (Next.js)
dev:
	$(PACKAGE_MANAGER) dev

# Build the project (Next.js)
build:
	$(PACKAGE_MANAGER) build

# Start the production server (Next.js)
start:
	$(PACKAGE_MANAGER) start

# Lint the code with Next.js ESLint setup
lint:
	$(PACKAGE_MANAGER) lint

# Run Prisma generate (to generate Prisma client)
prisma:
	$(PACKAGE_MANAGER) prisma generate

# Clean the build directory (e.g., delete `.next` folder)
clean:
	rm -rf .next

# Run all the steps: install, lint, and build
all: install lint build

# Default target to run when `make` is used without any argument
default: install dev
