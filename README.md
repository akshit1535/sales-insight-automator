## Sales Insight Automator – Engineer’s Log

### 1. Overview

This prototype implements the **“Sales Insight Automator”** quick‑response tool:

- **Frontend (SPA)**: React + Vite single page that lets a sales rep:
  - Upload a `.csv` sales file.
  - Enter a recipient email address.
  - See clear **loading / success / error** status and a **preview** of the AI summary.
- **Backend (API)**: Node.js + Express service that:
  - Accepts a CSV upload and email.
  - Parses the sales data.
  - Calls **Google Gemini** to generate an executive summary.
  - Sends the summary to the requested email using **Nodemailer (Gmail)**.
  - Exposes **Swagger/OpenAPI docs** at `/docs`.
- **Security**:
  - Global and per‑route **rate limiting**.
  - `helmet` hardening.
  - Simple **API key** (`x-api-key`) to protect the upload endpoint against casual abuse.
- **DevOps**:
  - **Docker** for frontend and backend, plus `docker-compose` to run the full stack.
  - **GitHub Actions CI**: build + lint on PRs to `main`.

### 2. Running via docker-compose (required deliverable)

Prerequisites:

- Docker and Docker Compose installed.

Steps:

1. **Clone the repo**:

   ```bash
   git clone https://github.com/akshit1535/sales-insight-automator.git
   cd sales-insight-automator
   ```

2. **Create `.env` from the example**:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and fill in:

   - `GEMINI_API_KEY`: Google Gemini API key.
   - `EMAIL`: Your Gmail address.
   - `EMAIL_PASS`: Your Gmail **app password** (not your main password).
   - `API_KEY`: Any strong random string (used for `x-api-key`).
   - Leave `PORT=5000` and `VITE_API_BASE_URL=http://localhost:5000` for local runs.

3. **Build and start containers**:

   ```bash
   docker-compose up --build
   ```

4. **Access the app**:

   - Frontend SPA: `http://localhost:4173`
   - API docs (Swagger UI): `http://localhost:5000/docs`

5. **Test the full flow** (Upload → AI Summary → Email):

   - Open `http://localhost:4173`.
   - Upload a CSV file (e.g. the provided `sales_q1_2026.csv`).
   - Enter a valid email address.
   - Make sure the frontend includes the `x-api-key` header by configuring the environment (see “Secured endpoints” below) or using a REST client like Postman for explicit testing.
   - Check the inbox for **“Sales Data Summary”**.

### 3. Endpoint security – how it’s secured

**Primary protections** on `/api/upload`:

- **API key middleware** (`x-api-key` header):
  - Implemented in `backend/routes/uploadRoute.js`.
  - Compares `x-api-key` from the request to `process.env.API_KEY`.
  - If missing or mismatched, returns `401 Unauthorized`.
- **Rate limiting**:
  - Global limit via `express-rate-limit` in `backend/server.js`.
  - Additional per‑route limiter in `uploadRoute.js` to further protect `/api/upload`.
- **Helmet**:
  - Enabled in `server.js` to set secure HTTP headers and reduce common attack surface.
- **Input validation**:
  - Validates `email` using `validator.isEmail`.
  - Ensures a file is present and only accepts `.csv` in this prototype.
  - Streams CSV rows and handles parse errors gracefully.

In a real production environment, you would extend this with:

- Authenticated users (JWT / SSO).
- Object storage for files.
- More advanced file validation and size controls.

### 4. Swagger / OpenAPI

- The OpenAPI spec is generated in `backend/uploads/swagger.js` using `swagger-jsdoc`.
- It documents:
  - `/api/upload` endpoint.
  - Request body (`multipart/form-data` with `file` and `email`).
  - Security scheme `ApiKeyAuth` for the `x-api-key` header.
- Swagger UI is exposed at:

  - `GET /docs` (e.g. `http://localhost:5000/docs` locally).

This allows the team to test the API independently of the frontend.

### 5. Local development without Docker

Prerequisites:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
cd frontend && npm install && cd ..
```

Create `.env`:

```bash
cp .env.example .env
```

Run backend:

```bash
npm run dev:backend
```

In a second terminal, run frontend:

```bash
cd frontend
npm run dev
```

Access:

- Frontend: `http://localhost:5173`
- Backend Swagger: `http://localhost:5000/docs`

### 6. CI/CD – GitHub Actions

File: `.github/workflows/ci.yml`

On every **pull request to `main`**, the workflow:

1. Checks out the repo.
2. Sets up Node.js 20.
3. Installs root and frontend dependencies.
4. Runs:
   - `npm run lint:backend`
   - `npm run lint` in `frontend/`
5. Builds the frontend with:
   - `npm run build` in `frontend/` using `VITE_API_BASE_URL` pointing at a backend URL.

This ensures that:

- Code is at least minimally lint‑clean.
- Frontend builds successfully before merging.

### 7. Deployment guide (what you should do)

**Backend (Render, Railway, or similar)**:

1. Push this repo to GitHub (already configured).
2. Create a new **web service** from the GitHub repo.
3. Use:
   - Runtime: Node 20.
   - Start command: `node backend/server.js`.
4. Set environment variables in the service dashboard:
   - `GEMINI_API_KEY`
   - `EMAIL`
   - `EMAIL_PASS`
   - `API_KEY`
   - `PORT=5000` (or platform default; update if needed).
5. Deploy and note the public URL, e.g. `https://sales-insight-backend.onrender.com`.
6. Visit `https://your-backend-url/docs` to verify Swagger is live.

**Frontend (Vercel or Netlify)**:

1. Create a new project from the same GitHub repo, pointing to the `frontend` folder.
2. Build settings:
   - Build command: `npm run build`.
   - Output directory: `dist`.
3. Environment variables:
   - `VITE_API_BASE_URL=https://your-backend-url` (from the backend deployment).
4. Deploy and note the public frontend URL, e.g. `https://sales-insight-frontend.vercel.app`.

**CI configuration for production builds**:

- In GitHub repo settings → Secrets and variables → Actions:
  - Add `VITE_API_BASE_URL` with your real backend URL.

### 8. What you must submit for the task

For the case study submission, you should provide:

1. **GitHub repository URL**:
   - `https://github.com/akshit1535/sales-insight-automator`
2. **Hosted frontend URL**:
   - From Vercel/Netlify (e.g. `https://sales-insight-frontend.vercel.app`).
3. **Swagger docs URL (backend)**:
   - `https://your-backend-url/docs`
4. Optional but helpful to mention in the form / interview:
   - You implemented API key security, rate limiting, helmet, and input validation.
   - You created Dockerfiles + docker-compose for local production‑like runs.
   - You wired CI on PRs to ensure lint + build.

With these in place, the flow **Upload → AI Summary → Email Received** should work end‑to‑end and satisfy the evaluation rubric (Execution, DevOps, Security, Architecture).

# sales-insight-automator