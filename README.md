# No Reboot HQ

A dynamic configuration management system built with Spring Boot (Backend) and React (Frontend).

## Prerequisites
- **Java 21+**
- **Node.js 18+**
- **Docker** & **Docker Compose**
- **Maven**

## Project Structure
- `/backend`: The Spring Boot API server with PostgreSQL, Redis caching, and WebSockets.
- `/frontend`: The React (Vite) user interface.

## Quick Start Configuration

### 1. Start the Database and Cache
The easiest way to get the required PostgreSQL and Redis instances running is via Docker.
Run this command from the root directory:
```bash
docker-compose up -d
```
*(This starts PostgreSQL on port `5433` and Redis on port `6379`)*

### 2. Start the Backend API
Navigate to the `backend` directory and run the Spring Boot server:
```bash
cd backend
mvn spring-boot:run
```
*(The backend will start on `http://localhost:8080`)*

### 3. Start the Frontend Application
Navigate to the `frontend` directory, install the required packages, and run the dev server:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will start on `http://localhost:5173`)*

## License
MIT
