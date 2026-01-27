# WeChat Mini Program - Backend Development Environment

This project features an all-in-one Dockerized development environment for NestJS, MySQL, and Redis.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Node.js (if running commands locally, though Docker handles this).

## Stack Information

- **Backend**: NestJS (Node.js LTS) - Port `3000`
- **Database**: MySQL 8 - Port `3306`
- **Cache**: Redis 7 - Port `6379`

---

## Quick Start

### 1. Initialize Environment Variables
Copy the development environment template to your local `.env`:

```bash
cp .env.dev .env
```

### 2. Start the Environment
Run the following command to build the containers and start the services in the background:

```bash
docker compose up -d --build
```

### 3. Verify Services
- **API**: [http://localhost:3000](http://localhost:3000)
- **Database**: Connect via `localhost:3306` using details in `.env`
- **Redis**: Connect via `localhost:6379`

---

## Service Details

### Backend (api)
- **Hot Reload**: Enabled. Changes made to files in `src/` will automatically trigger a rebuild inside the container.
- **Log Access**: `docker compose logs -f api`

### Database (mysql)
- **Database Name**: `wechat_dev`
- **User**: `wechat`
- **Password**: `wechat123`
- **Persistence**: Data is stored in the Docker volume `mysql_data`.

### Cache (redis)
- **Persistence**: None (Development usage only).

---

## Common Commands

| Task | Command |
| :--- | :--- |
| Start all services | `docker compose up -d` |
| Stop all services | `docker compose down` |
| View logs | `docker compose logs -f` |
| Restart API only | `docker compose restart api` |
| Rebuild containers | `docker compose up -d --build` |

---

## Project Structure
- `Dockerfile`: Configuration for the NestJS container.
- `docker-compose.yml`: Orchestration for API, DB, and Redis.
- `.env.dev`: Template for development environment variables.
