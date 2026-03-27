# Acquisitions Application

A Node.js/Express application with Neon Database integration, containerized for both development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Database Management](#database-management)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- Docker and Docker Compose
- Neon account and project (https://neon.tech)

### For Development
- Node.js 20+ (for local development without Docker)
- Git (for branch-based development)

## Development Setup

### 1. Clone and Configure

```bash
git clone <repository-url>
cd acquisitions
```

### 2. Set up Development Environment

Copy the development environment template:
```bash
cp .env.development .env
```

Edit `.env` and add your Neon credentials:
```bash
# Required: Get these from your Neon project dashboard
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here

# Optional: Set secrets (will use defaults if not specified)
JWT_SECRET=your_development_jwt_secret_here
COOKIE_SECRET=your_development_cookie_secret_here
```

### 3. Start Development Environment

```bash
# Start both the application and Neon Local proxy
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

This will:
- Start a **Neon Local proxy** that creates ephemeral database branches
- Start your application connected to the local proxy
- Automatically create a fresh database branch for each container restart

### 4. Access Your Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Endpoint**: http://localhost:3000/api

### 5. Database Migrations

Run database migrations inside the container:
```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Open Drizzle Studio (optional)
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Production Deployment

### 1. Environment Configuration

Create production environment file:
```bash
cp .env.production .env.prod
```

Edit `.env.prod` with your production values:
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Production Neon Cloud Database URL
DATABASE_URL=postgres://username:password@ep-xyz-123456.us-east-1.aws.neon.tech/acquisitions?sslmode=require

# Production secrets (generate strong secrets)
JWT_SECRET=your_secure_production_jwt_secret
COOKIE_SECRET=your_secure_production_cookie_secret

# Optional production settings
CORS_ORIGIN=https://yourdomain.com
API_RATE_LIMIT=100
```

### 2. Deploy with Docker Compose

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale the application (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### 3. Alternative: Using Environment Variables

For cloud deployments, set environment variables directly:

```bash
export DATABASE_URL="postgres://user:pass@host.neon.tech/db?sslmode=require"
export JWT_SECRET="your-secret"
export COOKIE_SECRET="your-secret"

docker-compose -f docker-compose.prod.yml up -d
```

## Database Management

### Development (Neon Local)
- **Ephemeral branches**: Fresh database on each restart
- **No manual cleanup**: Branches auto-delete on container stop
- **Local connection**: `postgres://neon:npg@neon-local:5432/acquisitions`

### Production (Neon Cloud)
- **Persistent database**: Production Neon database
- **Connection pooling**: Handled by Neon Cloud
- **Backups**: Managed by Neon

### Persistent Development Branches

To keep database branches between restarts, modify `docker-compose.dev.yml`:

```yaml
neon-local:
  # ... existing config
  environment:
    # ... existing env vars
    DELETE_BRANCH: false  # Keep branches after container stops
  volumes:
    - ./.neon_local/:/tmp/.neon_local              # Branch metadata
    - ./.git/HEAD:/tmp/.git/HEAD:ro,consistent     # Git integration
```

## Environment Configuration

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Database | Neon Local (ephemeral) | Neon Cloud |
| Connection | `neon-local:5432` | Direct to Neon |
| Branches | Auto-created/deleted | Fixed production DB |
| SSL | Disabled (local) | Required |
| Logs | Debug level | Info level |
| Hot Reload | Enabled | Disabled |

### Environment Variables

#### Required for Development
```bash
NEON_API_KEY=<your-api-key>
NEON_PROJECT_ID=<your-project-id>
```

#### Required for Production
```bash
DATABASE_URL=<neon-cloud-connection-string>
JWT_SECRET=<secure-secret>
COOKIE_SECRET=<secure-secret>
```

#### Optional
```bash
PORT=3000
NODE_ENV=development|production
LOG_LEVEL=debug|info|warn|error
CORS_ORIGIN=*|https://yourdomain.com
API_RATE_LIMIT=100
```

## Scripts

### Development
```bash
# Start development environment
npm run dev:docker

# Run tests (if available)
npm test

# Database operations
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio

# Code quality
npm run lint           # Check code style
npm run format         # Format code
```

### Production
```bash
# Build production image
docker build -t acquisitions:latest .

# Run production container
docker run -p 3000:3000 --env-file .env.prod acquisitions:latest
```

## Troubleshooting

### Common Issues

#### "Connection to Neon Local failed"
1. Ensure Neon Local container is healthy: `docker-compose -f docker-compose.dev.yml ps`
2. Check Neon credentials in `.env`
3. Verify network connectivity: `docker-compose -f docker-compose.dev.yml logs neon-local`

#### "Database schema out of sync"
```bash
# Run pending migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

#### "Permission denied" errors
```bash
# Reset container permissions
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Development Tips

1. **Fresh start**: Use `docker-compose down -v` to remove all data
2. **Logs**: Use `docker-compose logs -f <service-name>` for real-time logs
3. **Shell access**: Use `docker-compose exec app sh` to access container
4. **Database inspection**: Use Drizzle Studio or connect directly to Neon Local

### Production Monitoring

```bash
# Container health
docker-compose -f docker-compose.prod.yml ps

# Application logs
docker-compose -f docker-compose.prod.yml logs app

# Resource usage
docker stats

# Application health endpoint
curl http://localhost:3000/health
```

## Security Notes

### Development
- Uses ephemeral branches (safe for experimentation)
- Neon Local credentials are for proxy only
- No production data exposure

### Production
- Always use HTTPS in production
- Rotate secrets regularly
- Use environment variables for sensitive data
- Enable Neon's connection pooling and security features
- Consider using a reverse proxy (nginx, traefik) for SSL termination

## Getting Help

1. **Neon Documentation**: https://neon.com/docs
2. **Neon Local Guide**: https://neon.com/docs/local/neon-local
3. **Docker Compose Reference**: https://docs.docker.com/compose/
4. **Application Issues**: Check container logs and health endpoints

---

*This setup provides isolated development environments with Neon Local while maintaining production-ready deployment patterns with Neon Cloud.*