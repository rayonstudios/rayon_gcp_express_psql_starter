# Rayon GCP Express PostgreSQL Starter

A production-ready, batteries-included Express.js starter kit built for rapid backend development. This opinionated starter scaffolds your project with pre-configured authentication, notifications, background jobs, file management, and seamless GCP deployment—so you can focus on building features, not infrastructure.

**[Live Demo](https://be.starters.rayonstudios.com/)** | **[API Documentation](https://be.starters.rayonstudios.com/docs)**

---

## Table of Contents

- [Why This Starter?](#why-this-starter)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [SDLC Workflow](#sdlc-workflow)
- [Project Structure](#project-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Why This Starter?

Building a production-ready backend from scratch involves countless decisions and boilerplate. This starter eliminates that overhead by providing:

- **Ready-to-use authentication** with JWT, RBAC, and email verification
- **Multi-channel notifications** (in-app, push, email) out of the box
- **Background job processing** with Google Cloud Tasks
- **Auto-generated API documentation** that stays in sync with your code
- **Three-environment deployment** (dev, test, prod) via GitHub Actions
- **Type-safe APIs** with TypeScript, TSOA, and Zod validation
- **Best practices baked in** from folder structure to error handling

Perfect for developers who want to ship features fast without compromising on code quality or scalability.

---

## Tech Stack

### Core Framework
- **TypeScript** - Type-safe JavaScript
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **TSOA** - TypeScript-based OpenAPI generator
- **Zod** - Schema validation

### Database & ORM
- **PostgreSQL** - Relational database
- **Xata** - Managed PostgreSQL hosting with built-in search and analytics
- **Prisma** - Modern ORM with type safety

### Google Cloud Platform (GCP - default region: us-east1)
- **Cloud Run** - Serverless container platform
- **Cloud Tasks** - Distributed task queue for background jobs
- **Cloud Storage** - Object storage for files and images
- **Artifact Registry** - Container image registry
- **Cloud Build** - Docker image building with caching

### Authentication & Security
- **JWT** - JSON Web Tokens for stateless authentication
- **bcrypt** - Password hashing
- **hCaptcha** - Bot protection for public endpoints
- **API Keys** - Service-to-service authentication

### Notifications & Messaging
- **Firebase Cloud Messaging (FCM)** - Push notifications
- **Brevo (SendinBlue)** - Transactional email service
- **Firestore** - As a secondary real-time database

### File Management
- **Multer** - File upload middleware
- **Sharp** - High-performance image processing
- **Firebase Storage** - Cloud-based file storage

### Development Tools
- **Infisical** - Secret management and environment variables
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Nodemon** - Live code reloading
- **Morgan** - HTTP request logging

---

## Features

### 🔐 Authentication & Security
- **Flexible Authentication**: JWT access/refresh tokens + API keys for service-to-service communication
- **Complete Auth Flow**: Signup, login, email verification (OTP), password reset, change password
- **Role-Based Access Control (RBAC)**: User, admin, and super-admin roles with hierarchical permissions
- **Token Management**: Refresh token versioning for multi-device sign-out
- **hCaptcha Protection**: Bot prevention on sensitive public routes (auto-disabled in local dev)
- **Secure Password Handling**: bcrypt hashing with automatic salting

### 🗄️ Database & ORM
- **Database Introspection with Prisma**: Type-safe queries with auto-completion
- **Automatic Schema Migration**: Migrate schemas between environments (dev, test, prod) via GitHub Actions
- **Managed PostgreSQL**: Xata hosting
- **Relationship Management**: Automatic foreign key handling and cascading deletes

### 📡 API & Documentation
- **Automatic Swagger Docs**: OpenAPI 3.0 specification auto-generated from TypeScript code
- **Interactive API Explorer**: Swagger UI at `/docs` for testing endpoints
- **Shared Types for Models & Validation**: Single source of truth for data structures
- **Request Validation**: Dual-layer validation with TSOA (TypeScript) and Zod (runtime)
- **Global Error Handling**: Consistent error responses across all endpoints

### 🔔 Notifications & Messaging
- **Multi-channel Notifications**: Unified API for in-app, push (FCM), and email notifications
- **Event-Based Notifications**: Pre-configured events (SIGN_UP, NEW_POST, GENERAL)
- **User/Role Targeting**: Send notifications to specific users or all admins
- **Unread Count Tracking**: Real-time unread notification counts
- **Email Templates**: Pre-built templates for verification, password reset, and notifications
- **Push Notification Management**: FCM token registration and device management

### ⚙️ Background Processing
- **Cloud Tasks Integration**: Reliable, scalable background job processing
- **Job Status Tracking**: Monitor job progress in Firestore
- **Built-in Job Types**:
  - Image resizing with configurable dimensions
  - Multi-channel notification sending
- **Scheduled Jobs**: Delay job execution to a specific time
- **Retry Handling**: Automatic retries with exponential backoff

### 📂 File Management
- **File Upload & Retrieval**: Secure uploads to Google Cloud Storage with signed URLs
- **Auto Image Resizing**: Background processing to generate multiple sizes (thumbnail, small, medium, etc.)
- **Image Optimization**: Sharp-based compression for optimal file sizes
- **Multi-file Support**: Upload multiple files in a single request
- **MIME Type Validation**: Ensure only allowed file types are uploaded

### 🚀 Deployment & DevOps
- **Three-Environment Architecture**: Separate dev, test, and production environments
- **CI/CD with GitHub Actions**: Automated deployments on branch push
- **Docker Multi-stage Builds**: Optimized images with layer caching
- **Zero-Downtime Deployments**: Cloud Run managed rollouts
- **Automatic Secret Injection**: Infisical integration for secure environment variables
- **Health Check Endpoint**: Cloud Run health monitoring at `/health`

### 🛠️ Developer Experience
- **Live Code Reloading**: Instant feedback with Nodemon
- **On-the-fly Spec Updates**: Swagger docs regenerate automatically
- **TypeScript Path Aliases**: Clean imports with `#/` prefix
- **One-liner Pagination**: Add pagination to any model with `paginatedSortQuery()`
- **One-liner Multi-column Search**: Full-text-like search with `withSearch()`
- **Serializers**: Transform database models to API responses
- **Feature-based Folder Structure**: Organized by domain, not technical layer
- **Pre-commit Hooks**: ESLint and Prettier run automatically on staged files

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Apps                            │
│                   (Web, Mobile, Third-party)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Cloud Run                             │
│                   (Express.js API Server)                       │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  Auth Module   │  │  Post Module   │  │  File Module    │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  User Module   │  │ Notification   │  │  BG Jobs        │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└───────────┬──────────────┬─────────────────┬──────────────┬────┘
            │              │                 │              │
            │              │                 │              │
            ▼              ▼                 ▼              ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│  Xata/PostgreSQL │ │   Firebase  │ │ Cloud Tasks  │ │    Brevo     │
│   (Main DB)      │ │  (Storage,  │ │ (Job Queue)  │ │   (Email)    │
│  - Users         │ │   FCM, Jobs)│ │              │ │              │
│  - Posts         │ │             │ │              │ │              │
│  - Notifications │ │             │ │              │ │              │
└──────────────────┘ └─────────────┘ └──────────────┘ └──────────────┘
```

### Request Flow
1. **Client** sends request to Cloud Run endpoint
2. **Express Router** matches route to TSOA-generated controller
3. **Middleware** validates JWT/API key and request payload
4. **Controller** processes business logic
5. **Prisma ORM** queries PostgreSQL database via Xata
6. **Response** serialized and returned to client

### Background Job Flow
1. Call `bgJobsService.create()` from any module to create a background job
2. Job saved to **Firestore** with PENDING status
3. **Cloud Tasks** queued with handler endpoint
4. Task triggers `/bg-jobs/handler` with API key
5. **Handler** processes job (e.g., resize image, send notification)
6. Job status updated to SUCCESS/FAILED in Firestore

### Notification Flow
1. **Event trigger** (e.g., user signup) calls `notificationService.trigger()`
2. Notification saved to **PostgreSQL** (in-app)
3. **Background job** created for async processing
4. Job sends **FCM push** to user devices
5. Job sends **email** via Brevo
6. User unread count incremented

---

## Prerequisites

Before you begin, ensure you have the following set up:

### Required Accounts & Services

#### 1. Google Cloud Platform (GCP)
- **GCP Project** with billing enabled
- **Service Account** with the following IAM roles:
  - Cloud Run Admin
  - Cloud Build Editor
  - Artifact Registry Writer
  - Cloud Tasks Admin
  - Storage Admin
  - Service Account User
- **Enabled APIs**:
  - Cloud Run API
  - Cloud Build API
  - Cloud Tasks API
  - Cloud Storage API
  - Artifact Registry API
- **Resources to create**:
  - Cloud Tasks queues for each environment to hand bg jobs
  - Cloud Storage bucket for each environment with public access

**Download service account JSON key** and save securely.

#### 2. Xata Database
- Create a [Xata account](https://xata.io)
- Create a new database (PostgreSQL)
- Note your **database URL** and **API key**
- Region: `us-east-1` (recommended for low latency)

#### 3. Firebase Project
- Create a [Firebase project](https://console.firebase.google.com) (Use the already create GCP project above)
- Enable **Cloud Messaging** (FCM) for push notifications
- Create **Firestore** databaes in native mode for each environment

#### 4. Infisical (Secret Management)
- Create an [Infisical account](https://infisical.com)
- Create a new project
- Create three environments: `dev`, `test`, `production`
- Generate **Machine Identity** credentials:
  - Client ID
  - Client Secret
  - Project ID
- Add all required environment variables (see [Environment Variables](#environment-variables))

#### 5. Brevo (Email Service)
- Create a [Brevo account](https://www.brevo.com) (formerly SendinBlue)
- Generate an **API key**
- Verify a sender email address
- Create email templates for verification, password reset, user invitation and notification (if needed)

#### 6. hCaptcha (Bot Protection)
- Create an [hCaptcha account](https://www.hcaptcha.com)
- Register a site and get:
  - Site Key
  - Secret Key

#### 7. GitHub Repository
- Fork or clone this repository
- Add the following **repository secrets** (Settings > Secrets):
  - `INFISICAL_CLIENT_ID`
  - `INFISICAL_CLIENT_SECRET`
  - `INFISICAL_PROJECT_ID`
  - `GCP_SA` (full GCP service account JSON)

### Local Development Requirements
- **Node.js 20+** (LTS recommended)
- **npm 10+** or **yarn**
- **Git**

---

## Installation and Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/rayon-gcp-express-psql-starter.git
cd rayon-gcp-express-psql-starter
```

### Step 2: Configure Infisical Secrets
Create a `.env.infisical` file in the project root:
```bash
INFISICAL_CLIENT_ID=your-infisical-client-id
INFISICAL_CLIENT_SECRET=your-infisical-client-secret
INFISICAL_PROJECT_ID=your-infisical-project-id
```

**Important**: This file is gitignored. Never commit it to version control.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Initialize Database Schema
First, install the Xata CLI:
```bash
npm install @xata.io/cli
```

Then initialize your empty Xata database with the schema from [schema.prisma](prisma/schema.prisma):
```bash
npm run schema:initialize
```

This script will push the schema defined in your local `schema.prisma` file to your empty Xata database.

### Step 5: Create a Super Admin User
Create a super admin user to get started:

```bash
npm run create:superadmin -- --email admin@example.com --password your-secure-password
```

### Step 6: Start Development Server
```bash
npm run dev
```
This script automatically fetches secrets from Infisical and generates a `.env` file with all environment variables from Infisical. This script also introspects your xata database and updates the schema.prisma file.

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Step 7: Access API Documentation
Open your browser to:
```
http://localhost:3000/api/v1/docs
```

You'll see the interactive Swagger UI where you can test all endpoints.

---

## Available Scripts

### Development
```bash
npm run dev          # Start development server with live reload (NODE_ENV=dev)
npm run test         # Start test server (NODE_ENV=test)
npm run prod         # Start production-like server (NODE_ENV=production)
```

### Build & Deploy
```bash
npm run build        # Build TypeScript to dist/ folder
npm start            # Run production build (node dist/server.js)
npm run setup        # Full setup: fetch env, pull schema, generate, tsoa
```

### Database
```bash
npm run prisma:pull          # Pull schema from Xata database
npm run prisma:generate      # Generate Prisma Client
npm run prisma:format        # Format schema.prisma file
npm run schema-transform     # Transform Xata conventions to standard naming
npm run schema:initialize    # Initialize new schema
npm run sync-xata-schema     # Sync schema changes with Xata
```

### User Management
```bash
npm run create:superadmin    # Create a super admin user with verified email
                             # Usage: npm run create:superadmin -- -e email -p password [-n name]
```

### Code Generation
```bash
npm run tsoa         # Generate TSOA routes and Swagger spec
```

### Environment
```bash
npm run env:fetch    # Fetch secrets from Infisical to .env
npm run env:replace  # Replace env variables in config files
```

**Local Environment Overrides**: Create a `.env.overrides` file (gitignored) to override any Infisical secrets locally without modifying Infisical. Useful for testing with different configurations.

### Code Quality
```bash
npm run lint                 # Run ESLint
npm run prettier:check       # Check code formatting
npm run prettier:write       # Fix code formatting
```

---

## Environment Variables

The following environment variables must be configured in Infisical for each environment (dev, test, production):

### GCP Configuration
```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service_account.json
STORAGE_BUCKET=your-unique-bucket-name
GENERAL_TASKS_QUEUE=projects/your-project/locations/us-east1/queues/general
```

### Database
```bash
DATABASE_URL=postgresql://your-xata-url
XATA_API_KEY=xau_your-api-key
```

### Authentication
```bash
ACCESS_TOKEN_SECRET=your-long-random-secret
ACCESS_TOKEN_LIFE=8h
REFRESH_TOKEN_SECRET=your-long-random-secret
REFRESH_TOKEN_LIFE=30d
API_KEY_SECRET=your-internal-api-key
```

### Security
```bash
HCAPTCHA_SECRET=your-hcaptcha-secret
HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

### Email
```bash
BREVO_API_KEY=xkeysib-your-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### OTP
```bash
OTP_LIFE=30  # OTP expiration in minutes
```

### Firebase
```bash
FIRESTORE_DB_ID=your-firestore-db-id
```

### Environment
```bash
NODE_ENV=env-alias  # dev | test | production
```

**Security Note**: Never commit `.env` or `.env.infisical` files. Use Infisical for all environments.

---

## Deployment

### Architecture
This starter uses a **three-environment deployment strategy**:

| Environment | Branch | Cloud Run Service | Purpose |
|-------------|--------|-------------------|---------|
| **Production** | `main` | `rayon-gcp-express-psql-starter-prod` | Live user-facing environment |
| **Development** | `dev` | `rayon-gcp-express-psql-starter-dev` | Staging for pre-production verification |
| **Test** | `test` | `rayon-gcp-express-psql-starter-test` | Testing environment to deploy and test unfinished features |

All services run on **GCP Cloud Run** in the **us-east1** region.

### Automated Deployment via GitHub Actions

#### How It Works
1. Push code to `main`, `dev`, or `test` branch or trigger manually
2. GitHub Actions workflow triggers:
   - Loads secrets from Infisical
   - Authenticates with GCP
   - Builds Docker image using Cloud Build (with layer caching)
   - Pushes image to Artifact Registry
   - Deploys to Cloud Run
   - Automatically migrates database schema (if PR merge detected)

#### Manual Workflows
Access via GitHub Actions tab:

**Reload Secrets**: Redeploys existing Cloud Run service with updated Infisical secrets
```
Workflow: reload-secrets.yml
Inputs: environment (dev, test, production)
```

**Migrate Database Schema**: Migrate schema between environments
```
Workflow: migrate-branch.yml
Inputs: baseBranch, targetBranch, lastCommonMigrationId (optional)
```

### Cloud Run Configuration

#### Production (main branch)
- **Memory**: 1Gi
- **CPU**: 1
- **Max instances**: 20
- **Min instances**: 0 (scales to zero)
- **Concurrency**: 100 requests per container

#### Development/Test
- **Memory**: 512Mi
- **CPU**: 1
- **Max instances**: 5
- **Min instances**: 0

All environments use:
- **Port**: 8080
- **Timeout**: 3600s (1 hour)
- **Execution environment**: gen2
- **Authentication**: allow-unauthenticated (public access)
- **Session affinity**: enabled

### Monitoring Deployments
- **Cloud Run Logs**: View in [GCP Console](https://console.cloud.google.com/run)
- **GitHub Actions**: Check workflow runs for build/deploy status
- **Health Check**: `https://your-service-url.run.app/api/v1/health`

---

## SDLC Workflow

This section outlines the standard Software Development Lifecycle (SDLC) workflow for developing and deploying features in this project. Following this workflow ensures code quality, proper testing, and smooth collaboration across the team.

### Workflow Overview

The development workflow follows a **branch-based strategy** with three main environments:
- **`test`** - Quick testing of under-development features
- **`dev`** - Stable staging environment for pre-production verification
- **`main`** - Production environment with live user-facing features

### Step-by-Step Feature Development Workflow

#### 1. Create Feature Branch
Start by creating a new feature branch from the `dev` branch:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/description` - Documentation updates

#### 2. Create Xata Branch (If Schema Changes Required)
If your feature involves database schema changes, create a corresponding Xata branch:

```bash
# Create Xata branch from dev
npx xata branch create feature-your-feature-name --from dev
```

Update your `.env.overrides` file to point to this Xata branch during development:
```bash
DATABASE_URL=your-xata-branch-url
```

**Important**: Always create Xata branches from `dev` to ensure they have the latest stable schema.

#### 3. Create Draft Pull Request Early
As soon as you have your first commit, push your code and create a **draft PR** against the `dev` branch:

```bash
git add .
git commit -m "feat: initial implementation of feature X"
git push origin feature/your-feature-name
```

Then on GitHub:
- Create a Pull Request targeting the `dev` branch
- Mark it as "Draft" if the feature is not ready for review
- Add a clear description of what the feature does
- Link any related issues

**Benefits of early draft PRs**:
- Enables early feedback from the team
- Makes your work visible to others
- Prevents merge conflicts by showing what you're working on
- Allows CI/CD checks to run early

#### 4. Deploy to Test Environment (Optional)
If you want to test your feature in a deployed environment (recommended for integration testing):

**Step 4a: Migrate Database Schema to Test (if applicable)**

If your feature has schema changes, first migrate your Xata feature branch to the `test` branch:

1. Go to **GitHub Actions** tab in your repository
2. Select **"Migrate Xata Schema Between Branches"** workflow
3. Click **"Run workflow"**
4. Fill in the parameters:
   - **Base branch**: `feature-your-feature-name` (your Xata branch)
   - **Target branch**: `test`
   - **Last common migration ID**: (leave empty unless you know the specific migration)
5. Click **"Run workflow"** and wait for completion

**Step 4b: Deploy Code to Test**

Option A - Create PR against test:
```bash
# Create a PR from your feature branch to test and self-merge
```

Option B - Merge directly to test:
```bash
git checkout test
git pull origin test
git merge feature/your-feature-name
git push origin test
```

**Important**: Code changes to the `test` branch will automatically deploy to the test environment via GitHub Actions.

**About the Test Environment**:
- Used for quickly testing under-development features
- Multiple developers may deploy to test simultaneously
- QA/testers may also use this environment for API testing
- **It's okay if test breaks** - this is an experimental environment
- Test environment is NOT meant to be stable

#### 5. Code Review and Testing
While your feature is deployed on test:

1. **Test your feature** in the test environment
2. **Request code review** by converting your draft PR to "Ready for review"
3. Address any feedback from reviewers
4. Ensure all tests pass
5. Fix any issues found during testing

**Testing checklist**:
- [ ] Feature works as expected in test environment
- [ ] No breaking changes to existing features
- [ ] API documentation is updated (Swagger)
- [ ] Error handling is implemented
- [ ] Security considerations are addressed

#### 6. Merge to Dev Branch
Once your PR is **approved by a reviewer** and testing is successful:

**Step 6a: Migrate Schema to Dev (BEFORE merging code)**

If you made database schema changes, run the Xata migration workflow **before merging your code**:

1. Go to **GitHub Actions** > **"Migrate Xata Schema Between Branches"**
2. Run workflow with:
   - **Base branch**: `feature-your-feature-name`
   - **Target branch**: `dev`
3. Wait for migration to complete successfully

**Critical**: Schema changes must always be synced to the target branch **before** syncing code changes.

**Step 6b: Merge Your PR**

After schema migration is complete, merge your PR:
```bash
# Click "Merge Pull Request" on GitHub
# or via CLI:
git checkout dev
git merge feature/your-feature-name
git push origin dev
```

**Step 6c: Automatic Deployment**

Code changes to `dev` will automatically deploy to the dev environment via GitHub Actions. Monitor the deployment in the Actions tab.

#### 7. Keep Dev Stable
The `dev` branch should always be in a **production-ready state**:

- All features on `dev` should be fully tested
- `dev` should be stable enough to promote to `main` at any time
- Avoid pushing untested or experimental code to `dev`
- Use `test` branch for experimentation

#### 8. Promote to Production
Periodically (or at defined release intervals), a **team lead** or **release manager** will promote `dev` to production:

1. **Migrate schema from dev to main**:
   - Run **"Migrate Xata Schema Between Branches"** workflow
   - Base: `dev`, Target: `main`

2. **Merge dev to main**:
   ```bash
   git checkout main
   git pull origin main
   git merge dev
   git push origin main
   ```

3. **Monitor production deployment**:
   - Check GitHub Actions for successful deployment
   - Monitor Cloud Run logs for any issues
   - Verify health check endpoint

### Common Scenarios

#### Working with Multiple Features Simultaneously
If multiple developers are working on different features:
- Each creates their own feature branch from `dev`
- Each can deploy to `test` independently
- The last merge to `test` will be deployed (expected behavior)
- PRs to `dev` are merged sequentially after review

#### Schema Conflicts
If two features modify the same tables/fields:
- Coordinate with other developers via draft PRs
- Consider rebasing your feature branch on latest `dev`
- Run schema migrations carefully, checking for conflicts
- Use the `lastCommonMigrationId` parameter if needed

Alternatively, use GitHub's "Revert" button on the merged PR.

### Best Practices Summary

- **Always create Xata branches for schema changes**
- **Create draft PRs early** to enable collaboration
- **Test in `test` environment** before merging to `dev`
- **Migrate schema BEFORE merging code** to target branches
- **Keep `dev` stable** and production-ready
- **Communicate with the team** about test environment usage
- **Monitor deployments** after merging to any environment branch

---

## Project Structure

```
rayon-gcp-express-psql-starter/
├── .github/workflows/         # CI/CD pipelines for deployment
├── .husky/                    # Git hooks (pre-commit linting)
├── .xata/                     # Xata database configuration
├── prisma/                    # Prisma ORM schema
│   └── schema.prisma          # Database models and relations
├── scripts/                   # Build and deployment automation scripts
│   ├── load-secrets-ci.ts     # Fetch Infisical secrets in CI
│   ├── schema-transform.ts    # Transform Xata naming conventions
│   ├── xata-migration.ts      # Migrate schemas between environments
│   └── ...                    # Other utility scripts
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Entry point (HTTP server)
│   ├── lib/                   # Reusable, feature-independent code
│   │   ├── cloud-task/        # Google Cloud Tasks client
│   │   ├── firebase/          # Firebase Admin SDK setup
│   │   ├── mail/              # Brevo email client
│   │   ├── otp/               # OTP generation and verification
│   │   ├── types/             # Shared TypeScript types
│   │   ├── utils/             # Utility functions (pagination, search, etc.)
│   │   └── constants.ts       # Application constants
│   ├── middlewares/           # Express middleware
│   │   ├── auth.middleware.ts # JWT and API key authentication
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validation.middleware.ts # Request validation
│   └── modules/               # Feature modules (domain-driven)
│       ├── auth/              # Authentication and authorization
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.types.ts
│       │   └── auth.serializer.ts
│       ├── user/              # User management
│       ├── profile/           # User profiles
│       ├── post/              # Posts module (example entity)
│       ├── file/              # File upload and storage
│       ├── notification/      # Multi-channel notifications
│       ├── bg-jobs/           # Background job processing
│       └── misc/              # Health check, Swagger docs
├── Dockerfile                 # Multi-stage Docker build
├── cloudbuild.yaml            # GCP Cloud Build configuration
├── tsoa.json                  # TSOA API generator config
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

### Module Structure
Each feature module follows a consistent pattern:
```
module-name/
├── module-name.controller.ts  # TSOA controller (routes + validation)
├── module-name.service.ts     # Business logic
├── module-name.types.ts       # TypeScript types
└── module-name.serializer.ts  # Response transformers
```

This structure promotes:
- **Separation of concerns**: Controllers handle HTTP, services handle logic and are reusable
- **Testability**: Services can be tested independently
- **Type safety**: Shared types ensure consistency
- **Maintainability**: Related code stays together

---

## Best Practices

### Code Style
- Use **kebab-case** for file and folder names (e.g., `user-profile.service.ts`)
- Use **PascalCase** for type names (e.g., `UserProfile`)
- Use **camelCase** for variable and function names (e.g., `getUserProfile`)
- Use **snake_case** for database field names (e.g., `user_id`, `created_at`)

### Project Organization
- **Reusable, feature-independent code** → `src/lib/` folder
- **Feature-specific code** → `src/modules/` folder
- **Middleware** → `src/middlewares/` folder
- **Types meant for multiple modules** → `src/lib/types/` folder

### Database Design
- Foreign key names **must** follow the format `<name>_id` (e.g., `user_id`, `author_id`)
  - This convention allows schema transform scripts to auto-detect relationships
- Use `snake_case` for all field names
- Leverage Prisma relations for type-safe joins

### API Development
- Use **`statusConst`** object for HTTP status codes instead of hardcoding numbers
- Basic validation → rely on TSOA's TypeScript-based validation
- Advanced validation (email format, min/max, regex) → use Zod schemas
- Wrap complex nested types in the **`Expand`** utility type for TSOA compatibility
- Always serialize database models before returning (remove sensitive field, transform objects)

### Authentication
- Use **`@Security("jwt")`** for user-authenticated routes
- Use **`@Security("api_key")`** for internal service-to-service routes
- Specify required roles via TSOA scopes: `@Security("jwt", ["admin"])`

### Background Jobs
- Use background jobs for:
  - Long-running tasks (image processing, data exports)
  - Heavy external API calls (ex: push notifications)
  - Tasks that can tolerate eventual consistency

### Notifications
- **In-app notifications**: Always create for important events
- **Push notifications**: Use for time-sensitive updates
- **Email**: Use for critical account-related actions (verification, password reset)
- Target specific users or roles, not all users, to avoid spam

### Error Handling
- Throw descriptive errors with appropriate HTTP status codes
- Let the global error middleware handle uncaught internal errors (status code: 500) and validation errors (status code: 422)
- Log errors for debugging

### Security
- **Never commit** `.env`, `.env.infisical`, or `service_account.json` files
- Use hCaptcha on public endpoints prone to abuse
- Validate and sanitize all user inputs
- Use parameterized queries (Prisma does this automatically)

### Scripts Folder
- Files in **`scripts/`** should have **no external dependencies** (node built-ins only)
- Scripts run before `npm install` in some contexts (e.g., Docker build)

---

## Troubleshooting

### Common Issues

#### "Cannot find module '#/...'"
**Cause**: TypeScript path aliases not resolved.

**Solution**:
```bash
npm run build  # Rebuilds with alias resolution
```

#### "Prisma Client not generated"
**Cause**: Prisma Client out of sync with schema.

**Solution**:
```bash
npm run prisma:generate
```

#### "Database connection failed"
**Cause**: Invalid `DATABASE_URL` or Xata database offline.

**Solution**:
1. Verify `DATABASE_URL` in `.env`
2. Check Xata dashboard for database status
3. Ensure Xata API key is valid

#### "Firebase initialization failed"
**Cause**: Missing or invalid `service_account.json`.

**Solution**:
1. Ensure `service_account.json` exists in project root
2. Verify JSON structure is valid
3. Re-download from Firebase Console if needed

#### "Cloud Tasks create failed"
**Cause**: Invalid queue name or insufficient permissions.

**Solution**:
1. Verify `GENERAL_TASKS_QUEUE` format: `projects/PROJECT_ID/locations/REGION/queues/QUEUE_NAME` in infisical stored secret
2. Ensure service account has "Cloud Tasks Admin" role
3. Confirm queue exists in GCP Console

#### "hCaptcha validation failed"
**Cause**: Invalid site key or secret.

**Solution**:
1. Verify `HCAPTCHA_SECRET` and `HCAPTCHA_SITE_KEY` in Infisical
2. Check hCaptcha dashboard for site status
3. Ensure frontend sends correct `hCaptchaToken`

#### "Swagger docs not updating"
**Cause**: TSOA routes not regenerated.

**Solution**:
1. Make sure there are no typescript errors
2. Sometimes there's no typescript error, but still a tsoa error. If you are using a complex nested type in a controller, make sure to wrap inside Expand type utility.

#### GitHub Actions deployment fails
**Cause**: Missing secrets or incorrect GCP configuration.

**Solution**:
1. Verify all GitHub secrets are set (see [Prerequisites](#prerequisites))
2. Check workflow logs for specific error
3. Ensure GCP service account has required IAM roles
4. Confirm Cloud Run service name matches workflow config

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/your-org/rayon-gcp-express-psql-starter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/rayon-gcp-express-psql-starter/discussions)
- **Documentation**: Check the [Live Demo](https://be.starters.rayonstudios.com/docs) for API examples

---

## Roadmap

### Improvements
- [ ] **Add unit tests**: Jest + Supertest for comprehensive test coverage
- [ ] **Add rate limiting**: Protect endpoints from abuse with `express-rate-limit`
- [ ] **Add database seeding**: Seed scripts for local development
- [ ] **Add IAC**: Auto provision new environments / projects
- [ ] **Add request logging**: Structured logging with request IDs for tracing
- [ ] **Disaster Recovery**: Automated backup and restore procedures for PostgreSQL and Firestore with point-in-time recovery

**Want to contribute?** See [Contributing](#contributing) below!

---

## Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help makes this starter better for everyone.

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Follow the [Best Practices](#best-practices) above
4. **Test thoroughly**: Ensure all existing functionality still works
5. **Commit with descriptive messages**: `git commit -m "feat: add rate limiting middleware"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request**: Describe your changes and link any related issues

### Code of Conduct
- Follow the existing code style and conventions
- Write clear commit messages
- Update documentation for any user-facing changes

### Development Guidelines
- Run `npm run lint` before committing
- Ensure Prettier formatting is applied (`npm run prettier:write`)
- Test changes in at least the `dev` environment before PR
- Update the README if you add new features or change behavior

### Reporting Issues
Found a bug or have a feature request? [Open an issue](https://github.com/your-org/rayon-gcp-express-psql-starter/issues) with:
- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with love by the [Rayon Studios](https://rayonstudios.com) team. Special thanks to all contributors.

**Happy coding!** If this starter helped you ship faster, consider giving it a star ⭐ on GitHub.
