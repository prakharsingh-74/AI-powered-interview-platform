# Interview Prep AI

AI-powered interview preparation platform. Create sessions for roles (e.g., frontend, backend), generate Q&A with Gemini, pin questions, view explanations, and manage sessions.

## Tech Stack

- Client: React (Vite), TailwindCSS, Framer Motion
- Server: Node.js, Express, MongoDB, JWT
- AI: Google Gemini 1.5
- Dev tools: Axios, Nodemon, Docker

## Monorepo Structure

- client/ — React front-end
- server/ — Express API

---

## Prerequisites

- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Gemini API key
- Docker Desktop (for Docker setup)

---

## Environment Variables

Create .env files for both client and server.

### server/.env
```
PORT=8000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace_with_strong_secret
GEMINI_API_KEY=your_gemini_api_key
```

### client/.env
```
VITE_API_BASE_URL=http://localhost:8000
```

Ensure your axios instance uses `VITE_API_BASE_URL`.

---

## Run Locally (without Docker)

Open two terminals.

### 1) API server
Server Github link - https://github.com/prakharsingh-74/Interview-platform-server
```
cd server
npm install
npm run dev      # nodemon, listens on http://localhost:8000
```

### 2) Client
```
cd client
npm install
npm run dev      # Vite, http://localhost:5173
```

Log in/register, then create sessions and generate Q&A.

---

## Run with Docker (local)

A docker-compose file runs both client and server in containers.

Create docker files if not present:

### server/Dockerfile
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

### client/Dockerfile
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### docker-compose.yml (at repo root)
```
services:
  server:
    build: ./server
    ports:
      - "8000:8000"
    env_file: ./server/.env
    environment:
      - NODE_ENV=development
    volumes:
      - ./server:/app
      - /app/node_modules

  client:
    build: ./client
    ports:
      - "5173:5173"
    env_file: ./client/.env
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    depends_on:
      - server
    volumes:
      - ./client:/app
      - /app/node_modules
```

Run:
```
docker compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:8000

---

## Using the prebuilt Docker image

You mentioned a public Docker Hub image. Pull and run like this:

```
docker pull https://hub.docker.com/r/prakhar744/aiinterview
docker run -p 5173:5173 https://hub.docker.com/r/prakhar744/aiinterview
```