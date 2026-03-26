# CasusApp Docker Setup Guide

## Overview

This guide covers the containerized development environment for CasusApp. The migration to Docker provides:

- **Consistent environments** across all developers
- **Easy onboarding** - new developers productive in <5 minutes
- **Database version control** - PostgreSQL with PostGIS in container
- **Fast rebuild workflow** - predictable containerized backend/frontend updates
- **Production parity** - dev containers mirror production configuration

## Architecture

### Containerized Services
- **PostgreSQL 16** with PostGIS 3.4 extension (geospatial data)
- **Backend API** (TypeScript, Express, Drizzle ORM) — *Phase 2 complete*
- **Frontend Web** (React, Vite, TailwindCSS) — *Phase 3*
- **Redis** (optional caching) — *configurable*

### Host-Based Services
- **Mobile App** (Expo, React Native) - runs on host for Android/iOS connectivity
- **Metro Bundler** - runs on host (port 8082)

## Prerequisites

1. **Docker Desktop** installed and running
   - [Download for macOS](https://www.docker.com/products/docker-desktop/)
   - [Download for Windows](https://www.docker.com/products/docker-desktop/)
   - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

2. **Node.js 20 LTS** (for mobile development on host)
   - Already configured via project `.nvmrc`

3. **Git** (for cloning repository)

## Quick Start

### 1. Start Docker Desktop

Ensure Docker Desktop is running before executing any Docker commands.

```bash
# Verify Docker is running
docker info
```

### 2. Start PostgreSQL Database

```bash
# Start database in background
./docker/dev-up.sh postgres -d

# View logs
./docker/dev-logs.sh postgres

# Check database health
docker ps
```

The database will be accessible at:
- **From host**: `postgresql://casusapp:casusapp_dev_password@localhost:5433/casusapp`
- **From containers**: `postgresql://casusapp:casusapp_dev_password@postgres:5432/casusapp`

### 3. Run Database Migrations

```bash
# Set DATABASE_URL for host-to-container connection
export DATABASE_URL=postgresql://casusapp:casusapp_dev_password@localhost:5433/casusapp

# Run migrations (from project root)
cd my-api-project
npm run db:push

# Seed test data
npm run db:seed
```

Or run migrations and seed fully inside Docker:

```bash
# Apply non-destructive schema sync using backend container network
docker-compose --env-file .env.docker run --rm backend npm run db:push:docker

# Seed data using backend container
docker-compose --env-file .env.docker run --rm backend npm run db:seed
```

Optional advanced command (may prompt for destructive changes):

```bash
docker-compose --env-file .env.docker run --rm backend npm run db:push:docker:drizzle
```

### 4. Verify Database Setup

```bash
# Open PostgreSQL shell
./docker/dev-shell.sh postgres

# Inside psql, run:
\dt            # List tables
\dx            # List extensions (should see PostGIS)
SELECT PostGIS_version();
\q             # Quit
```

## Docker Helper Scripts

All scripts are in the `docker/` directory:

### `dev-up.sh` - Start Services
```bash
# Start specific service
./docker/dev-up.sh postgres -d        # Database only (detached)
./docker/dev-up.sh backend -d         # Backend API (Phase 2+)
./docker/dev-up.sh                    # Everything (foreground)

# Start multiple services
./docker/dev-up.sh "postgres backend" -d

# Reliable default for backend + frontend (recommended)
./docker/dev-up.sh "backend frontend" -d

# Optional hot-reload mode (advanced)
./docker/dev-up.sh "backend frontend" -d --hotreload
```

Features:
- Automatic PostGIS extension setup
- Health check waiting with timeout
- Service status summary after startup
- Stable macOS default without frontend bind mounts
- Optional hot-reload overlay via `--hotreload` flag (can auto-fallback on macOS)

### `dev-down.sh` - Stop Services
```bash
# Stop all services (preserve data)
./docker/dev-down.sh

# Stop and remove data volumes (DESTRUCTIVE)
./docker/dev-down.sh --volumes
```

### `dev-logs.sh` - View Logs
```bash
# All services
./docker/dev-logs.sh

# Specific service
./docker/dev-logs.sh postgres

# Custom tail length
./docker/dev-logs.sh postgres 50
```

### `dev-shell.sh` - Interactive Shell
```bash
# PostgreSQL shell
./docker/dev-shell.sh postgres

# Backend container bash (Phase 2+)
./docker/dev-shell.sh backend bash

# Custom command
./docker/dev-shell.sh postgres psql -U casusapp -c "SELECT version();"
```

### `dev-status.sh` - Service Diagnostics
```bash
# Run comprehensive health and connectivity diagnostics
./docker/dev-status.sh
```

Shows:
- Docker daemon status
- Running containers and health status
- Port availability (5433, 3000, 5173)
- Service connectivity tests
- Database status and PostGIS version
- Recent errors from logs

## Environment Configuration

### `.env.docker` File

Create `.env.docker` from the template:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` with your settings. **Never commit this file to Git.**

### Key Variables

```bash
# Database (container-to-container)
DATABASE_URL=postgresql://casusapp:casusapp_dev_password@postgres:5432/casusapp
DOCKER_DATABASE_URL=postgresql://casusapp:casusapp_dev_password@postgres:5432/casusapp

# Database (host-to-container - for migrations)
# DATABASE_URL=postgresql://casusapp:casusapp_dev_password@localhost:5433/casusapp

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=change_this_to_random_32_char_string
```

## Mobile App Configuration

Mobile development remains host-based for optimal Android/iOS connectivity. The mobile app connects to the containerized backend API.

### Connection Matrix

| Scenario | EXPO_PUBLIC_API_BASE_URL | Setup Required | Verification |
|----------|-------------------------|----------------|--------------|
| **Android Emulator** | `http://10.0.2.2:3000/api/v1` | None (emulator magic IP) | `curl http://10.0.2.2:3000/health` from emulator shell |
| **Android Device (WiFi)** | `http://YOUR_LAN_IP:3000/api/v1` | Same WiFi network | `curl http://YOUR_LAN_IP:3000/health` from device |
| **Android Device (USB)** | `http://localhost:3000/api/v1` | `adb reverse tcp:3000 tcp:3000` | `adb reverse --list` |
| **iOS Simulator** | `http://localhost:3000/api/v1` | None (simulator uses host network) | `curl http://localhost:3000/health` |

### Android Emulator Setup

The emulator uses `10.0.2.2` as a special alias to reach the host machine:

```bash
# mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000/api/v1
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

**Verify connectivity** from within the emulator:
```bash
# From host terminal
adb shell curl http://10.0.2.2:3000/health
```

Expected response: `{"status":"ok"}`

### Physical Android Device (WiFi)

When developing on a physical device over WiFi, use your machine's LAN IP:

```bash
# Find your LAN IP (macOS)
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

# Find your LAN IP (Linux)
hostname -I | awk '{print $1}'

# Update mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:3000/api/v1
```

**Requirements:**
- Device and computer on same WiFi network
- Firewall allows port 3000 (check: `sudo lsof -iTCP:3000 -sTCP:LISTEN`)
- Docker container exposes port to host (`ports: - "3000:3000"` in docker-compose.yml)

**Verify connectivity** from device:
```bash
# From computer, check what the device will see
curl http://YOUR_LAN_IP:3000/health
```

### Physical Android Device (USB with adb reverse)

USB debugging with adb reverse allows using `localhost` in the mobile app:

```bash
# Set up port forwarding (run once per USB connection)
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8082 tcp:8082

# Verify mapping
adb reverse --list
# Should show:
# tcp:3000 -> tcp:3000
# tcp:8082 -> tcp:8082

# Update mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

**Test from device:**
```bash
adb shell curl http://localhost:3000/health
```

### iOS Simulator Setup

iOS Simulator shares the host network, so `localhost` works directly:

```bash
# mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

No special configuration needed.

### Troubleshooting Mobile Connectivity

#### Backend not reachable from mobile app

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/health
   ./docker/dev-status.sh
   ```

2. **Check Docker port binding:**
   ```bash
   docker-compose --env-file .env.docker ps
   # Should show: 0.0.0.0:3000->3000/tcp for backend
   ```

3. **For Android emulator, verify magic IP:**
   ```bash
   adb shell curl http://10.0.2.2:3000/health
   ```

4. **For physical device, check firewall:**
   ```bash
   # macOS: Allow incoming connections in System Preferences > Security
   # Or temporarily disable: sudo pfctl -d
   
   # Verify port is externally accessible
   lsof -iTCP:3000 -sTCP:LISTEN
   ```

#### Common mistakes

- ❌ Using `localhost` on Android emulator (use `10.0.2.2`)
- ❌ Using `10.0.2.2` on physical device (use LAN IP)
- ❌ Using `127.0.0.1` anywhere (use appropriate address for scenario)
- ❌ Forgetting to restart Metro bundler after changing `.env`
- ❌ Device and computer on different WiFi networks

#### Still not working?

```bash
# Full diagnostic report
./docker/dev-status.sh

# Check Metro bundler logs
cd mobile
npx expo start --dev-client --host localhost --port 8082

# Test API from host
curl -v http://localhost:3000/health
curl -v http://localhost:3000/api/v1/health
```

## Database Management

### Running Migrations

```bash
# From project root
cd my-api-project

# Push schema changes
export DATABASE_URL=postgresql://casusapp:casusapp_dev_password@localhost:5433/casusapp
npm run db:push

# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Seeding Test Data

```bash
cd my-api-project
npm run db:seed
```

Seeds:
- 8 activity categories
- 3 test guides
- Multiple test activities with various difficulty levels

### Database Reset

```bash
# Stop and remove volumes
./docker/dev-down.sh --volumes

# Start fresh
./docker/dev-up.sh postgres -d

# Re-run migrations and seed
cd my-api-project
npm run db:push
npm run db:seed
```

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U casusapp casusapp > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U casusapp -d casusapp
```

## Troubleshooting

### Docker not running

```
❌ Error: Docker is not running
```

**Solution**: Start Docker Desktop application.

### Port already in use

```
Error: bind: address already in use
```

**Solution**: Stop conflicting service or change port in `docker-compose.yml`.

```bash
# Find process using port 5432
lsof -i :5432

# Kill it or change Docker port to 5433:5432 in docker-compose.yml
```

### Cannot connect from mobile app

**Quick diagnosis:**
```bash
./docker/dev-status.sh
```

**Android Emulator:**
- Use `10.0.2.2` or `host.docker.internal`
- Verify: `adb shell curl http://10.0.2.2:3000/health`

**Physical Device:**
- Use your machine's LAN IP (not localhost)
- Ensure device on same WiFi network
- Check firewall allows port 3000

See the [Mobile App Configuration](#mobile-app-configuration) section for complete setup matrix.

### Database connection refused

```bash
# Check container is running
docker ps

# Check logs
./docker/dev-logs.sh postgres

# Verify health
docker inspect casusapp-postgres | grep -A 10 Health

# Wait for startup (takes ~5-10 seconds)
```

### Permission denied on scripts

```bash
chmod +x docker/dev-*.sh
```

## Development Workflow

### Daily Workflow

```bash
# 1. Start Docker Desktop (if not running)

# 2. Start database
./docker/dev-up.sh postgres -d

# 3. Start backend container (Phase 2)
./docker/dev-up.sh backend -d

# 4. Start frontend container (Phase 3)
./docker/dev-up.sh frontend -d

# 5. Start mobile app
cd mobile
npm run dev:android:emulator:8082

# 6. When done
./docker/dev-down.sh
```

### After Pulling Updates

```bash
# Pull latest code
git pull

# Rebuild containers (if Dockerfile changed)
docker-compose build

# Or rebuild specific services
docker-compose build backend frontend

# Update dependencies and migrations
cd my-api-project
npm install
npm run db:push

cd ../frontend
npm install

cd ../mobile
npm install
```

### Optional Hot Reload Overlay

Use stable image-based mode as the default workflow (recommended on macOS):

```bash
# Reliable default (recommended)
./docker/dev-up.sh "backend frontend" -d

# Rebuild/recreate frontend after code changes
docker-compose --env-file .env.docker build frontend
docker-compose --env-file .env.docker up -d --force-recreate frontend
```

Hot-reload bind mounts are available as an advanced option:

```bash
# Optional hot-reload overlay
./docker/dev-up.sh "backend frontend" -d --hotreload

# Force hot-reload on macOS (experimental)
CASUSAPP_FORCE_HOTRELOAD=1 ./docker/dev-up.sh "backend frontend" -d --hotreload

# Or use compose directly
docker-compose --env-file .env.docker -f docker-compose.yml -f docker-compose.hotreload.yml up -d backend frontend
```

**Note:** On macOS, `dev-up.sh` may auto-disable frontend hot-reload to avoid bind-mount read failures like `Failed to load PostCSS config ... Unknown system error -35`.

If you hit this error, recover with:

```bash
# Stop current services
./docker/dev-down.sh

# Restart in reliable mode
./docker/dev-up.sh "backend frontend" -d

# Refresh frontend image/container
docker-compose --env-file .env.docker build frontend
docker-compose --env-file .env.docker up -d --force-recreate frontend
```

## Implementation Status

### ✅ Phase 1: Database Infrastructure (COMPLETE)
- PostgreSQL 16 + PostGIS 3.4 container
- Volume persistence
- Initialization scripts
- Health checks
- Connection documentation

### ✅ Phase 2: Backend Containerization (COMPLETE)
- Multi-stage Dockerfile (development + production targets)
- Nodemon + ts-node development command configured in container
- Docker Compose backend service enabled with health checks
- Environment variable wiring with DATABASE_URL to postgres service
- Integration with Phase 1 PostgreSQL/PostGIS database
- Stable default mode on macOS uses image-copied source; rebuild backend after code changes with `docker-compose build backend && docker-compose up -d backend`

### ✅ Phase 3: Frontend Containerization (COMPLETE)
- Multi-stage Dockerfile (Vite development + Nginx production) created
- Frontend compose service enabled with health checks and backend dependency
- Stable default mode runs from image contents
- Optional bind-mount hot reload via `docker-compose.hotreload.yml`

### ✅ Phase 4: Orchestration (COMPLETE)
**Completed:** 8 March 2026

Unified development orchestration with predictable service lifecycle:

- **Helper script consistency**: All `docker/dev-*.sh` scripts use `--env-file .env.docker`
- **Enhanced startup flow** (`dev-up.sh`):
  - Health check waiting with bounded timeout (60s per service)
  - Automatic PostGIS extension setup after Postgres healthy
  - Service status summary with URLs and next-step commands
  - `--hotreload` flag support for bind-mount overlay
- **Diagnostics tooling** (`dev-status.sh`):
  - Comprehensive health and connectivity checks
  - Port availability validation (5433, 3000, 5173)
  - Database status and PostGIS version reporting
  - Recent error log extraction
- **Mobile connectivity matrix**:
  - Authoritative guidance for emulator/device/simulator scenarios
  - Connection verification commands for each setup
  - Troubleshooting decision tree
- **Development override configuration**:
   - Simplified hot-reload activation via `--hotreload` flag
   - Reliability-first macOS behavior with automatic frontend hot-reload fallback
   - Documented recovery workflow for macOS bind-mount `-35` read errors

All helper scripts tested and verified with running services.

### 🚧 Phase 5: Mobile Build (OPTIONAL)
- EAS Build container support

### 🚧 Phase 6: CI/CD (TODO)
- GitHub Actions workflow
- docker-compose.ci.yml
- Automated testing

### 🚧 Phase 7: Production (TODO)
- docker-compose.prod.yml
- Multi-platform builds
- Cloud deployment guides

## Next Steps

1. **Start Docker Desktop** if not running
2. **Start PostgreSQL container**: `./docker/dev-up.sh postgres -d`
3. **Run migrations**: `docker-compose --env-file .env.docker run --rm backend npm run db:push:docker`
4. **Seed data**: `docker-compose --env-file .env.docker run --rm backend npm run db:seed`
5. **Start backend + frontend**: `./docker/dev-up.sh "backend frontend" -d`

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [PostGIS Docker Image](https://hub.docker.com/r/postgis/postgis)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## Support

For issues or questions:
1. Check logs: `./docker/dev-logs.sh [service]`
2. Review troubleshooting section above
3. Check Docker Desktop is running and healthy
4. Verify environment variables in `.env.docker`
