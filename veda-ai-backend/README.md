# VedaAI Backend

AI Assessment Creator backend — Node.js + Express + TypeScript + Prisma + PostgreSQL + BullMQ + WebSocket.

## Architecture

```
src/
├── config/
│   ├── env.ts          # Zod-validated env vars
│   ├── database.ts     # Prisma singleton
│   ├── redis.ts        # IORedis (local or Upstash)
│   └── queue.ts        # BullMQ queue definitions
├── controllers/
│   ├── assignment.controller.ts
│   └── health.controller.ts
├── routes/
│   ├── index.ts
│   └── assignment.routes.ts
├── services/
│   ├── assignment.service.ts   # All DB operations
│   └── job.service.ts          # BullMQ job tracking
├── workers/
│   └── assessment.worker.ts    # BullMQ processor + AI calls
├── lib/
│   ├── ai.ts           # Gemini + Mistral (with fallback)
│   ├── prompt.ts       # Prompt builder
│   ├── schemas.ts      # Zod schemas
│   ├── serializers.ts  # Prisma → frontend DTOs
│   └── websocket.ts    # WS server + job broadcasting
├── middleware/
│   ├── error.ts        # Global error handler + AppError
│   ├── validate.ts     # Zod request validation
│   └── upload.ts       # Multer file upload
├── types/
│   └── index.ts        # Shared TypeScript types
├── app.ts              # Express app factory
└── index.ts            # Server entry point
```

## Request Flow

```
Frontend Form Submit
      ↓
POST /api/assignments (multipart/form-data)
      ↓
Create assignment in PostgreSQL
      ↓
Enqueue BullMQ job → Redis
      ↓
Return { assignmentId, jobId }
      ↓
Frontend connects WebSocket: ws://HOST/ws?jobId=BULL_JOB_ID
      ↓
BullMQ Worker picks up job
      ↓
Calls Gemini API (fallback: Mistral)
      ↓
Saves output to PostgreSQL
      ↓
Sends JOB_COMPLETED via WebSocket with full output payload
      ↓
Frontend navigates to /output/:assignmentId
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database setup

**Option A — Local PostgreSQL**
```bash
# Create database
createdb vedaai
# Push schema
npx prisma db push
```

**Option B — Neon (free PostgreSQL cloud)**
- Sign up at https://neon.tech
- Create a project, copy the connection string
- Set `DATABASE_URL` in `.env`
```bash
npx prisma db push
```

### 4. Redis setup

**Option A — Local Redis**
```bash
redis-server
# REDIS_URL=redis://localhost:6379
```

**Option B — Upstash (free, production-ready)**
- Sign up at https://upstash.com
- Create a Redis database (free tier: 10k commands/day)
- Copy the `rediss://` connection string
- Set `REDIS_URL=rediss://default:TOKEN@HOST:PORT` in `.env`

### 5. AI API Keys

**Gemini (primary)**
- Get key at https://aistudio.google.com/app/apikey (free tier available)
- Set `GEMINI_API_KEY` in `.env`

**Mistral (fallback)**
- Get key at https://console.mistral.ai
- Set `MISTRAL_API_KEY` in `.env`

The system tries Gemini first; if it fails, it falls back to Mistral automatically.

### 6. Run development server
```bash
npm run dev
```

This runs the HTTP server, WebSocket server, and BullMQ worker **all in one process**.

### 7. Generate Prisma client
```bash
npm run prisma:generate
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB + Redis) |
| GET | `/api/assignments` | List all assignments |
| POST | `/api/assignments` | Create assignment + queue AI job |
| GET | `/api/assignments/:id` | Get single assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |
| GET | `/api/assignments/:id/output` | Get generated paper |
| POST | `/api/assignments/:id/regenerate` | Re-run AI generation |
| GET | `/api/assignments/:id/job` | Get job status |

### WebSocket

Connect to `ws://HOST/ws?jobId=BULL_JOB_ID`

Events received:
```json
{ "type": "JOB_QUEUED",      "jobId": "...", "message": "..." }
{ "type": "JOB_PROCESSING",  "jobId": "...", "progress": 30, "message": "..." }
{ "type": "PROGRESS_UPDATE", "jobId": "...", "progress": 70, "message": "..." }
{ "type": "JOB_COMPLETED",   "jobId": "...", "progress": 100, "payload": { ...GeneratedOutput } }
{ "type": "JOB_FAILED",      "jobId": "...", "message": "error reason" }
```

## Production Deployment

### Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://...  # Neon or Railway
REDIS_URL=rediss://...         # Upstash
GEMINI_API_KEY=...
MISTRAL_API_KEY=...
FRONTEND_URL=https://your-domain.com
```

### Build & start
```bash
npm run build
npm start
```

### Free production stack
| Service | Provider | Free tier |
|---------|----------|-----------|
| PostgreSQL | Neon.tech | 0.5 GB |
| Redis / BullMQ | Upstash | 10k cmds/day |
| Backend hosting | Railway / Render | 500 hrs/month |
| Frontend | Vercel | Unlimited |
