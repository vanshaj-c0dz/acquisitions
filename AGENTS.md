# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reload using Node.js --watch flag
- `npm run lint` - Run ESLint on the codebase
- `npm run lint:fix` - Auto-fix ESLint issues where possible
- `npm run format` - Format code using Prettier
- `npm run format:check` - Check code formatting without making changes

### Database Management
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:studio` - Launch Drizzle Studio for database inspection

## Architecture Overview

This is a Node.js Express API with a layered architecture using modern ES modules and path mapping:

### Project Structure
- **Entry Point**: `src/index.js` → `src/server.js` → `src/app.js`
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless connection
- **Authentication**: JWT-based with bcrypt password hashing
- **Logging**: Winston logger with file and console transports
- **Validation**: Zod schemas for request validation

### Import Path Mapping
The project uses Node.js subpath imports (package.json imports field) with # prefix:
```javascript
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { users } from '#models/user.model.js';
```

Available mappings:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`
- `#routes/*` → `./src/routes/*`

### Layered Architecture
1. **Routes** (`src/routes/`) - Express route definitions
2. **Controllers** (`src/controllers/`) - Request/response handling and validation
3. **Services** (`src/services/`) - Business logic and database operations
4. **Models** (`src/models/`) - Drizzle ORM schema definitions
5. **Validations** (`src/validations/`) - Zod validation schemas
6. **Utils** (`src/utils/`) - Shared utilities (JWT, cookies, formatting)
7. **Config** (`src/config/`) - Database connection, logger configuration

### Database Schema
- Uses Drizzle ORM with PostgreSQL dialect
- Schema files in `src/models/` are auto-discovered by Drizzle
- Generated migrations stored in `./drizzle` directory
- Current tables: `users` with authentication fields

### Environment Configuration
Key environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode
- `LOG_LEVEL` - Winston logging level

### Error Handling Pattern
Controllers use try-catch with:
- Zod validation with `safeParse()` 
- Custom error formatting via `formatValidationError()`
- Winston logging for errors
- Consistent JSON error responses
- Next middleware for unhandled errors

### Code Standards
- ESLint with 2-space indentation, single quotes, semicolons required
- Prettier for code formatting
- ES6+ features with arrow functions preferred
- Async/await pattern throughout
- Consistent logging using Winston logger instance