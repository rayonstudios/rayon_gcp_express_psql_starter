# Rayon GCP Express PSQL Starter

Rayon GCP Express PSQL Starter is an opinionated starter kit designed to scaffold backend projects quickly with a wide range of pre-configured features, built-in best practices, and "batteries included." It leverages Google Cloud Platform for deployment and Prisma for database management, allowing you to focus on building functionality.

[Live Demo](https://compact-flash-306512.el.r.appspot.com/)

## Tech Stack

- **TypeScript** (NodeJS)
- **PostgreSQL** (via Prisma ORM)
- **Express.js**
- **Google App Engine**
- **Google Cloud Storage**
- **Infisical**
- **tsoa**
- **zod**
- **Morgan**
- **Brevo**

## Features

- 🔄 **Shared Types for Models & Request Validation**: Ensure consistent data types across the entire stack by sharing types between models and request validation.
- 📚 **Automatic Swagger Docs**: Generate comprehensive and up-to-date OpenAPI documentation straight from your codebase with tsoa.
- 🌐 **OpenAPI Specification**: Auto-generated OpenAPI JSON specification for seamless integration with API development tools and client SDKs.
- 🔐 **Flexible Authentication**: Secure authentication and authorization using both JWT for user sessions and API keys for service-to-service communication.
- 📜 **Request Validation with zod & tsoa**: Validate request data effortlessly using advanced schema validation with zod and TypeScript-based tsoa.
- 📝 **Data Logging with Morgan**: Log incoming requests and responses for enhanced observability and debugging.
- 🛡️ **Role-Based Access Control (RBAC)**: Manage user permissions and access levels through a robust role-based access control system.
- 🧬 **Database Introspection with Prisma**: Seamlessly interact with PostgreSQL using Prisma's intuitive ORM and database introspection.
- 🔄 **Automatic Schema Migration**: Automatically migrate database schemas using Xata CLI and GitHub Actions on PR merge.
- 📧 **Pre-configured Email Client**: Easily send emails through Brevo with the built-in, ready-to-use email client.
- 📂 **File Upload & Retrieval**: Handle file uploads and retrievals with multer and store them securely in Google Cloud Storage.
- 🖼️ **Config-based Auto Image Resizing**: Automatically resize uploaded images in the background based on configurable presets and dimensions.
- 🔄 **Live Code Reloading & Spec Generation**: Enjoy fast development cycles with live code reloading and on-the-fly API spec updates.
- 🚀 **CI/CD for GCP App Engine Deployments**: Automated deployment pipelines using GitHub Actions for continuous integration and deployment to GCP.
- 🔑 **Automatic Environment Variables with Infisical**: Simplify secret management and environment configuration using Infisical for secure variable injection.
- 🔔 **Multi-channel Notifications**: Send notifications across in-app, push, and email channels with a unified API for user engagement.
- 📊 **One-liner Pagination for Models**: Easily implement pagination for any database model with a single line of code.
- 🔍 **One-liner Multi-Column Search**: Add multi-column search functionality to your modules with a single line of code using the `withSearch` higher-order function, mimicking full-text search capabilities.
- 🛑 **Global Error Handling**: Catch and manage errors gracefully across your entire application with centralized error handling.
- 🛡️ **hCaptcha Protection**: Secure sensitive public routes with hCaptcha to prevent automated abuse and spam.
- ✅ **ESLint Integration**: Keep your codebase clean and consistent with linting rules enforced by ESLint.
- 🌍 **Development & Production Environment Separation**: Seamlessly switch between dev and prod configurations with environment-specific settings.
- 📁 **Feature-based Folder Structure**: Organize your project with a clear, scalable folder structure separating core logic by feature.

## Deployment

Deployment is managed through GitHub Actions, with automatic deployments to Google App Engine:
- **main branch**: Deploys to production.
- **dev branch**: Deploys to the development environment.

## Installation and Setup

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```
2. Create a .env.infisical file with the following variables:
    ```bash
    INFISICAL_CLIENT_ID=<your-infisical-client-id>
    INFISICAL_CLIENT_SECRET=<your-infisical-client-secret>
    INFISICAL_PROJECT_ID=<your-infisical-workspace-slug>
    ```
2. Install dependencies:
    ```bash
    npm i
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Best Practices
- Use **kebab-case** for file and folder names.
- Reusable, feature-independent code should be placed in the `lib` folder.
- Feature-dependent code goes under the `modules` folder, while middlewares are under the `middlewares` folder.
- **Snake case** should be used for database field names.
- Foreign key names should strictly be in the format `<name>_id` (ex: user_id) to allow schema transform scripts to work correctly.
- Use `statusConst` to define HTTP status codes and messages, rather than hardcoding them.
- Basic request validation can be handled by tsoa through TypeScript, but use zod for advanced validation (e.g., email format, min/max constraints).
- Exported module types that are mean to be used as input/output types of a controller method, should be wrapped inside the `Expand` utility type as a workaround for tsoa's inability to handle complex nested types.
- Files in **scripts folder should not have any external dependencies**, as they are meant to run prior to dependencies installation.

## Roadmap
- [ ] Add unit tests
