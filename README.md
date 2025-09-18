# MessengerApp

A full-stack, real-time chat app (Telegram/Discord-style):

* **Custom Node.js backend** (no Express) + Socket.IO
* **JWT auth** (cookies)
* **PostgreSQL** persistence
* **Cloudinary** for media uploads
* **React + Vite** front-end with **Zustand**, **Tailwind/DaisyUI**

Repo layout: `backend/` and `frontend/`.

---

## Tech Stack

**Frontend**

* React (Vite), Tailwind CSS, DaisyUI
* Zustand, Axios
* Socket.IO client

**Backend**

* Node.js (custom HTTP server/router—no Express)
* Socket.IO
* JWT auth
* PostgreSQL (`pg` pool)
* Cloudinary SDK
* Cookie + CORS handling
* Custom middleware chain (parsing/routing/errors)

**Dev/Tooling**

* Node 18+ (20 LTS recommended)
* npm (or pnpm if you prefer—README shows npm where relevant)

---

## Prerequisites

* **Node.js** ≥ 18
* **PostgreSQL** ≥ 14
* **Cloudinary** account (for image uploads)

**macOS (Apple Silicon, e.g., M3)**

```bash
# Node (choose one approach you actually use)
brew install node

# PostgreSQL
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Debian/Ubuntu)**

```bash
# Node (example via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

**Windows**

* Install Node LTS from nodejs.org (or use nvm-windows).
* Install PostgreSQL for Windows (pgAdmin includes `psql`).
* To run `.bash` scripts use **WSL (Ubuntu)** or **Git Bash**.

---

## Database bootstrap (role + DB)

Use your own names if you want; examples use `messenger_user` / `messenger_db`.

**macOS/Linux**

```bash
sudo -u postgres createuser -s messenger_user
createdb messenger_db -O messenger_user
psql -d messenger_db -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

**Windows (in psql)**

```sql
CREATE ROLE messenger_user WITH SUPERUSER LOGIN;
CREATE DATABASE messenger_db OWNER messenger_user;
\c messenger_db
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q
```

---

## Environment variables

Create **`backend.env`** (put it wherever your backend reads it—root or `backend/`):

```
# Server
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# PostgreSQL (either DATABASE_URL or discrete vars)
DATABASE_URL=postgres://messenger_user@localhost:5432/messenger_db
# PGHOST=localhost
# PGPORT=5432
# PGUSER=messenger_user
# PGPASSWORD=
# PGDATABASE=messenger_db

# Auth
JWT_SECRET=change-this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Create **`frontend/.env`**:

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

> If using cookies: set Axios `withCredentials: true` and configure server CORS with `Access-Control-Allow-Credentials: true` and exact `CLIENT_ORIGIN`.

---

## Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Setup & Run (using your scripts)

> Your scripts live under `./backend/scripts/`. On macOS/Linux they run as is.
> On Windows, use **WSL** or **Git Bash** to execute them.

### 1) Project setup (DB/env scaffolding, etc.)

```bash
# macOS/Linux
chmod +x ./backend/scripts/setup_script.bash
./backend/scripts/setup_script.bash
```

```bash
# Windows (WSL or Git Bash)
bash ./backend/scripts/setup_script.bash
```

### 2) Start the backend

```bash
# macOS/Linux
chmod +x ./backend/scripts/starting_script.bash
./backend/scripts/starting_script.bash
```

```bash
# Windows (WSL or Git Bash)
bash ./backend/scripts/starting_script.bash
```

### 3) Start the frontend

```bash
cd frontend
npm run dev   # Vite at http://localhost:5173
```

Open `http://localhost:5173`, create an account, and test:

* real-time messaging (Socket.IO)
* persistence (PostgreSQL)
* image uploads (Cloudinary)

---

## Troubleshooting

* **CORS**

  * `Access-Control-Allow-Origin: http://localhost:5173`
  * `Access-Control-Allow-Credentials: true`
  * Allow the headers/methods your client uses.

* **Cookies/JWT**

  * Client must use `withCredentials: true`
  * Verify JWT on protected HTTP routes **and** in Socket.IO handshake.

* **Windows**

  * Prefer **WSL** for the `.bash` scripts. If `psql` isn’t on PATH, use “SQL Shell (psql)” or add PostgreSQL `bin` to PATH.

---

## Suggested npm scripts (if not already present)

**backend/package.json**

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  }
}
```

**frontend/package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```
