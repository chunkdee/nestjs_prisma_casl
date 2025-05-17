# My Workspace CRM

This repository is an Nx workspace for the CRM application. It leverages NestJS, Prisma, and Redis, and uses Nx 21.0.3 with npm as the package manager.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Running Applications](#running-applications)
- [Database & Prisma](#database--prisma)
- [Cache & Redis](#cache--redis)
- [Nx Workspace](#nx-workspace)
- [Docker](#docker)
- [License](#license)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-workspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Development

- **Start the development server for the CRM Auth app**
   ```bash
   npx nx serve crm-auth
   ```

- **Visualize the project graph**
   ```bash
   npx nx graph
   ```

## Running Applications

- You can run individual projects using Nx CLI, for example:
   ```bash
   npx nx serve crm-auth
   ```
- To run multiple projects:
   ```bash
   npx nx run-many --target=serve
   ```

## Database & Prisma

- **Database:** PostgreSQL  
- **ORM:** Prisma  
- **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
- **Apply migrations:**
   ```bash
   npx nx run crm-auth:migrate
   ```

## Cache & Redis

- **Cache Provider:** Redis is used via the CacheModule.
- Ensure Redis is running. You can start Redis with Docker.

## Nx Workspace

This workspace leverages Nx’s powerful tooling to manage multiple projects, enforce best practices, and optimize build times.  
For more information on Nx, refer to the [Nx Documentation](https://nx.dev).

## Docker

A `docker-compose.yml` file is provided to run the necessary services:

- **PostgreSQL:** Database service  
- **Redis:** Caching service

To start the services, run:
```bash
docker-compose up
```

## License

This project is licensed under the MIT License.