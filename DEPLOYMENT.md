## HostelOps Deployment (Docker + Nginx)

### 1. How to run with Docker

1. Copy `.env.example` to `.env` in the project root and adjust values:
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
   - `JWT_SECRET`
2. From the root (`HostelManagement`), run:
   - `docker compose build`
   - `docker compose up -d`
3. Open `http://localhost` in the browser.

Containers:
- `hostelops-frontend` (Nginx + built React app + reverse proxy)
- `hostelops-backend` (Node + Express API)
- `hostelops-mysql` (MySQL database)

### 2. Architecture (high-level)

- **Client (browser)** → HTTP on port **80** → **Nginx (frontend container)**  
  - `GET /` or any SPA route → serves React static files from `/usr/share/nginx/html`  
  - `GET/POST/PUT /api/...` → proxied to `backend:5000` inside the Docker network
- **Backend container** (`hostelops-backend`) connects to **MySQL** (`hostelops-mysql`) via internal hostname `mysql:3306`.

Only port **80** is published to the host; backend and MySQL are reachable only on the internal `hostelops-net` Docker network.

### 3. Nginx configuration (frontend/nginx.conf)

- Listens on port `80`.
- Serves the built React app from `/usr/share/nginx/html`:
  - `location / { try_files $uri /index.html; }` to support React Router.
- Proxies all `/api/` requests to the backend service:
  - `proxy_pass http://backend:5000;`
  - Forwards standard headers (`Host`, `X-Real-IP`, `X-Forwarded-*`).

### 4. Dockerfiles explanation

- **Backend/Dockerfile**
  - Uses `node:18-alpine`.
  - Installs production dependencies and runs `node server.js`.
  - Exposes port `5000` (internal; not published directly).

- **frontend/Dockerfile**
  - Stage 1 (builder): Node builds the Vite React app (`npm run build`).
  - Stage 2: `nginx:alpine` serves static files from `/usr/share/nginx/html` and uses `nginx.conf` for reverse proxy and SPA routing.

### 5. Networking & firewall strategy

- External:
  - Open only **TCP 80** on the host (HTTP).
  - All other ports (backend `5000`, MySQL `3306`) stay internal inside Docker.
- Internal:
  - Docker bridge network `hostelops-net` connects `frontend`, `backend`, and `mysql`.
  - `backend` talks to DB using `DB_HOST=mysql`.
  - `frontend` talks to `backend` via Nginx reverse proxy using `/api/...` URLs.

### 6. Container lifecycle, logging, resilience

- All services use `restart: unless-stopped` for crash resilience.
- Logs:
  - `docker compose logs -f backend` – view API logs.
  - `docker compose logs -f frontend` – view Nginx/access logs.
  - `docker compose logs -f mysql` – view database logs.
- Stateless containers:
  - MySQL data persists in the `mysql_data` Docker volume.

### 7. Request lifecycle

1. User opens `http://localhost`:
   - Request hits **Nginx** (frontend container) on port **80**.
   - Nginx returns `index.html` and static assets for the React app.
2. React app calls an API (e.g. `POST /api/auth/login`):
   - Browser → Nginx (`/api/auth/login`) → reverse proxy to `backend:5000/api/auth/login`.
3. Backend processes the request:
   - Express reads body and headers (including `Authorization: Bearer <token>`).
   - Uses MySQL connection to `mysql:3306` for user/complaints data.
4. Backend response flows back:
   - Backend → Nginx (reverse proxy) → Browser.

### 8. Serverful vs serverless (conceptual)

- **Serverful (this project)**:
  - Long-lived containers/servers (Node, Nginx, MySQL) running continuously.
  - You manage capacity, scaling, and updates.
  - Good fit for stateful apps with a traditional database and custom runtime.

- **Serverless**:
  - Short-lived functions (e.g. AWS Lambda) triggered per request/event.
  - Infrastructure scaling and provisioning abstracted away.
  - Ideal for bursty workloads and fine-grained scaling, but requires adapting code to stateless functions, and databases often remain separate managed services.

