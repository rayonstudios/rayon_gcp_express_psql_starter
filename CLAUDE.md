# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready Express.js/TypeScript backend starter kit deployed on Google Cloud Platform. It uses TSOA for auto-generated OpenAPI documentation and type-safe routing, Prisma as the ORM with Xata-hosted PostgreSQL, Firebase for real-time features and push notifications, and Infisical for secret management across environments.

## Architecture

### Feature-Based Module Structure

The codebase uses domain-driven design with feature modules in `src/modules/`. Each module follows a consistent pattern:

- `*.controller.ts` - TSOA controllers (HTTP routes + validation)
- `*.service.ts` - Business logic (reusable, testable)
- `*.types.ts` - TypeScript types and Zod schemas
- `*.serializer.ts` - Response transformers (remove sensitive fields)

### Key Architectural Patterns

**Path Aliases**: Uses `#/` prefix for imports (configured in tsconfig.json). Example: `import { prisma } from "#/src/lib/utils/prisma"`

**Reusable vs Feature Code**:

- `src/lib/` - Feature-independent utilities (pagination, search, OTP, email client, Firebase, Cloud Tasks)
- `src/modules/` - Feature-specific business logic
- `src/middlewares/` - Express middleware (auth, error handling, validation)

**Dual Authentication System**:

- `@Security("jwt")` - User authentication via JWT (access/refresh tokens)
- `@Security("api_key")` - Internal service-to-service auth (for background jobs, Cloud Tasks handlers)
- RBAC with hierarchical roles: `user`, `admin`, `super-admin` (admin includes super-admin privileges)

**Background Jobs**: Cloud Tasks queue jobs that are tracked in Firestore, with handlers at `/bg-jobs/handler` endpoint. Common job types: image resizing, multi-channel notifications.

**Notifications**: Multi-channel system (in-app, push via FCM, email via Brevo). Event-based triggers create database records + queue background jobs for async delivery.

**Database Design**:

- Foreign keys MUST follow format `<name>_id` (e.g., `user_id`, `author_id`) for schema transform scripts to work
- All field names use `snake_case`
- Xata conventions: `id` maps to `xata_id`, `created_at` to `xata_createdat`, `updated_at` to `xata_updatedat`

## Development Commands

### Environment Setup

```bash
# Initial setup - fetches secrets, pulls schema, generates Prisma client, generates TSOA routes
npm run setup

# Fetch secrets from Infisical to .env file (auto-runs in dev/test/prod scripts)
npm run env:fetch
```

### Running the Application

```bash
npm run dev          # Development server with live reload (NODE_ENV=dev)
npm run test         # Test server (NODE_ENV=test)
npm run prod         # Production-like server (NODE_ENV=production)
npm start            # Run production build from dist/
```

### Building

```bash
npm run build        # Full build: setup + TypeScript compilation + path alias resolution
npm run tsoa         # Generate TSOA routes and OpenAPI spec only
```

### Database Operations

```bash
# Pull latest schema from Xata database
npm run prisma:pull

# Transform Xata conventions to standard naming (run after prisma:pull)
npm run schema-transform

# Generate Prisma Client (required after schema changes)
npm run prisma:generate

# Format schema.prisma
npm run prisma:format

# Initialize empty Xata database with local schema.prisma
npm run schema:init

# Sync migration metadata between environments
npm run sync:migrations
```

### User Management

```bash
# Create super admin user with verified email
npm run create:superadmin -- --email admin@example.com --password your-password --name "Admin Name"
# or short form:
npm run create:superadmin -- -e admin@example.com -p your-password -n "Admin Name"
```

### Code Quality

```bash
npm run lint                 # ESLint
npm run prettier:check       # Check formatting
npm run prettier:write       # Fix formatting
```

## Database Workflow

### Schema Changes

1. Make changes in `prisma/schema.prisma`
2. Create Xata branch: `npx xata branch create feature-name --from dev`
3. Update `.env.overrides` with branch URL: `DATABASE_URL=your-xata-branch-url`
4. Push schema to Xata branch: `npx xata schema push --branch feature-name`
5. Test changes locally
6. Before merging code to target branch (dev/main), migrate schema first using GitHub Actions "Migrate Xata Schema Between Branches" workflow

### Schema Migration Between Environments

Always migrate database schema BEFORE merging code changes. Use GitHub Actions workflow:

1. Go to Actions > "Migrate Xata Schema Between Branches"
2. Specify base branch (your feature branch) and target branch (dev/main)
3. Wait for completion before merging code PR

## Deployment Architecture

### Three-Environment Strategy

- **test** branch → `*-test` Cloud Run service (experimental, can break)
- **dev** branch → `*-dev` Cloud Run service (stable staging)
- **main** branch → `*-prod` Cloud Run service (production)

### Automated Deployments

Pushing to `main`, `dev`, or `test` branches triggers GitHub Actions:

1. Fetches secrets from Infisical
2. Builds Docker image with Cloud Build (uses layer caching)
3. Pushes to Artifact Registry
4. Deploys to Cloud Run with zero-downtime rollout
5. Auto-migrates schema if PR merge detected (checks commit message)

### Manual Workflows

- **Reload Secrets**: Redeploys existing service with updated Infisical secrets (no rebuild)
- **Migrate Schema**: Migrates database schema between Xata branches

## TSOA and API Development

### Controller Pattern

```typescript
@Route("posts")
@Tags("Posts")
export class PostController {
  @Get("{id}")
  @Security("jwt")
  public async getPost(@Path() id: string): Promise<SerializedPost> {
    // Implementation
  }
}
```

### Important TSOA Rules

- Use `@Security("jwt")` for user auth, `@Security("api_key")` for internal services
- Specify roles via scopes: `@Security("jwt", ["admin"])`
- Complex nested types MUST be wrapped in `Expand<T>` utility type for TSOA compatibility
- TSOA validates types at compile time; use Zod for runtime validation (email format, min/max, regex)
- If Swagger docs don't update after changes, check for TypeScript errors first, then try wrapping complex types in `Expand`

### Validation Strategy

- **Basic validation** (required fields, types): TSOA TypeScript-based validation
- **Advanced validation** (email format, string length, regex): Zod schemas in `*.types.ts`
- Use `statusConst` object for HTTP status codes instead of hardcoding numbers

### Response Serialization

Always serialize database models before returning to remove sensitive fields and transform data:

```typescript
import { serializeUser } from "./user.serializer";
return serializeUser(user);
```

## Utility Functions

### Pagination

```typescript
import {
  paginatedSortQuery,
  PaginationSortParams,
} from "#/src/lib/utils/pagination";

const result = await paginatedSortQuery<Post>(
  "posts",
  { where: { author_id: userId }, include: { author: true } },
  { page: 1, limit: 10, sortField: "created_at", sortOrder: SortOrder.Desc }
);
// Returns: { list: Post[], total: number }
```

### Multi-column Search

```typescript
import { withSearch } from "#/src/lib/utils/search";

const query = withSearch<User>(
  { include: { posts: true } },
  ["name", "email", "bio"],
  searchTerm
);
// Generates case-insensitive OR query across specified fields
```

## Background Jobs

### Creating Jobs

```typescript
import bgJobsService from "#/src/modules/bg-jobs/bg-jobs.service";
import { BGJobType } from "#/src/modules/bg-jobs/bg-jobs.types";

await bgJobsService.create({
  type: BGJobType.RESIZE_IMAGE,
  data: { imagePath: "path/to/image.jpg", sizes: ["thumbnail", "small"] },
});
```

Jobs are queued to Google Cloud Tasks and tracked in Firestore with status updates.

## Notifications

### Triggering Multi-Channel Notifications

```typescript
import notificationService from "#/src/modules/notification/notification.service";
import { NotiEvent } from "#/src/modules/notification/notification.types";

await notificationService.trigger({
  event: NotiEvent.NEW_POST,
  title: "New Post Published",
  body: "Check out the latest post",
  user_ids: [userId], // or omit for all users
  metadata: { post_id: postId },
  link: `/posts/${postId}`,
});
```

Creates in-app notification record and queues background job for push + email delivery.

## Local Environment Overrides

Create `.env.overrides` file (gitignored) to override Infisical secrets locally:

```bash
DATABASE_URL=your-xata-branch-url
NODE_ENV=dev
```

This is useful for testing with feature-specific Xata branches or different configurations.

## Common Pitfalls

### TypeScript Path Aliases Not Resolved

Run `npm run build` to rebuild with alias resolution via tsc-alias.

### Prisma Client Out of Sync

Run `npm run prisma:generate` after any schema changes.

### TSOA Routes Not Regenerating

- Check for TypeScript compilation errors first
- Complex nested types may need `Expand<T>` wrapper
- Run `npm run tsoa` manually to see detailed errors

### Database Connection Issues

- Verify `DATABASE_URL` in `.env` or `.env.overrides`
- Check Xata dashboard for database/branch status
- Ensure `XATA_API_KEY` is valid

### hCaptcha Failing Locally

hCaptcha is automatically disabled in local development (not Cloud Run). If enabled, verify `HCAPTCHA_SECRET` and `HCAPTCHA_SITE_KEY` in Infisical.

## Project-Specific Conventions

### File Naming

- **kebab-case** for files/folders: `user-profile.service.ts`
- **PascalCase** for types: `UserProfile`
- **camelCase** for variables/functions: `getUserProfile`
- **snake_case** for database fields: `user_id`, `created_at`

### Code Organization

- Feature-independent code → `src/lib/`
- Feature-specific code → `src/modules/`
- Middleware → `src/middlewares/`
- Shared types → `src/lib/types/`
- Build/deployment scripts → `scripts/` (must use only Node built-ins, no external dependencies)

### Security

- Never commit `.env`, `.env.infisical`, or `service_account.json`
- Use hCaptcha on public endpoints prone to abuse (signup, password reset)
- All sensitive routes require `@Security("jwt")` or `@Security("api_key")`

## Testing Workflow

The `test` environment is designed for rapid iteration and experimentation. Multiple developers can deploy to test simultaneously. It's expected that test may break - this is normal.

For feature development:

1. Create feature branch from `dev`
2. Create Xata branch from `dev` if schema changes needed
3. Develop locally with `.env.overrides` pointing to feature Xata branch
4. Optionally deploy to `test` for integration testing (merge to test branch)
5. Migrate schema to `dev` BEFORE merging code PR
6. Merge to `dev` after code review
7. `dev` stays stable and production-ready at all times

## Key Dependencies

- **TSOA**: OpenAPI spec generation and type-safe routing
- **Prisma**: ORM with type safety, used with Xata PostgreSQL
- **Zod**: Runtime validation for complex schemas
- **Multer**: File upload middleware (stored in `/tmp`, then moved to Cloud Storage)
- **Sharp**: High-performance image processing
- **Firebase Admin SDK**: Push notifications (FCM), Firestore (job tracking), Storage
- **Brevo SDK**: Transactional email service
- **Google Cloud Tasks**: Distributed job queue
- **Infisical**: Secret management across environments
- **hCaptcha**: Bot protection
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT generation/verification

## Reference Files

- API documentation: `http://localhost:3000/api/v1/docs` (Swagger UI)
- OpenAPI spec: `swagger.json` (auto-generated)
- TSOA routes: `routes.ts` (auto-generated)
- Database schema: `prisma/schema.prisma`
- TSOA config: `tsoa.json`
- Docker build: `Dockerfile` (multi-stage build)
- Cloud Build: `cloudbuild.yaml` (with layer caching)
- GitHub Actions: `.github/workflows/` (dev-deploy.yml, prod-deploy.yml, test-deploy.yml, migrate-branch.yml, reload-secrets.yml)
