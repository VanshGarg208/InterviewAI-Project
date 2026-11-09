# InterviewAI Platform

InterviewAI is a full-stack, AI-powered mock interview platform built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js). Candidates can practice technical and HR interviews with real-time AI feedback, speech recognition, audio evaluation, scoring breakdowns, PDF report downloads, credit balance management, Razorpay payment top-ups, and user profile management.

---

## Architecture Overview

```text
InterviewAI/
│
├── Frontend/                 # React 18 + Vite + TypeScript Single Page Application
│   ├── src/
│   │   ├── components/       # Interview steps, landing sections, UI primitives (Radix / Tailwind)
│   │   ├── context/          # AuthContext & SocketContext
│   │   ├── pages/            # Index, Login, Register, InterviewPage, History, Report, Profile
│   │   ├── services/         # Axios API configuration & Razorpay checkout service
│   │   ├── test/             # Vitest frontend unit tests
│   │   └── App.tsx           # React Router & QueryClient setup
│   ├── dist/                 # Production optimized build bundle
│   ├── .env.example          # Sample frontend environment file
│   └── package.json
│
├── Backend/                  # Node.js + Express.js + Socket.IO REST API
│   ├── config/               # Database (connectDb.js), env loader (env.js) & JWT Token generators
│   ├── controllers/          # Auth, Interview, User & Payment controllers
│   ├── middlewares/          # Authentication (isAuth.js), DB Readiness, Multer & Error handler
│   ├── models/               # Mongoose Schemas (User, Interview, Payment)
│   ├── routes/               # Express Router definitions
│   ├── services/             # OpenRouter AI & Razorpay integrations
│   ├── tests/                # Native Node.js test suite
│   ├── index.js              # Express server entry point
│   ├── .env.example          # Sample backend environment file
│   └── package.json
│
├── scripts/                  # Deployment check scripts
├── DEPLOYMENT.md             # Production deployment & configuration guide
└── README.md                 # Project documentation
```

---

## Tech Stack

* **MongoDB Atlas + Mongoose:** User credentials, interview history sessions, and credit transaction documents.
* **Express.js + Node.js:** High-performance RESTful API with cookie & token authentication, route authorization, and centralized error logging.
* **React 18 + TypeScript + Vite:** Modern SPA interface styled with Tailwind CSS, Radix UI, Framer Motion animations, and Recharts.
* **OpenRouter AI Engine:** Prompt engineering and generation using top-tier LLMs (`openai/gpt-4o-mini` default, customizable).
* **Razorpay Payment Gateway:** Secure server-side signature verification (HMAC SHA-256) and automated credit top-ups.
* **Socket.IO:** Authenticated WebSocket communication with per-user room isolation.
* **Web Speech API & PDF Tools:** Browser speech synthesis & recognition; PDF text extraction with `pdfjs-dist` and report generation with `jspdf`.

---

## Implemented Workflows

1. **User Authentication & Session Persistence:**
   - User registration and login with bcrypt password hashing (10 salt rounds).
   - HttpOnly + SameSite JWT cookies with Bearer header fallback.
   - Session restoration via `/api/auth/me` on application load.

2. **Interview Configuration & Resume Extraction:**
   - Configure technical or HR interview by role and experience level.
   - Upload PDF resumes with strict file type validation (PDF only, 5MB limit).
   - Server-side text parsing with `pdfjs-dist` and AI extraction of candidate skills and projects.

3. **Interactive AI Interview Practice & Evaluation:**
   - Questions generated adaptively across difficulty tiers (easy to hard).
   - Candidate answers evaluated for Confidence, Communication, and Correctness.
   - Human-like concise feedback with question-by-question scoring and downloadable PDF reports.

4. **Credits & Balance Management:**
   - Starter credit grant (1,000 credits).
   - 50 credits deducted per interview session (deduction only occurs after AI generation succeeds).

5. **Razorpay Payments & Credit Top-ups:**
   - Server-side Razorpay order creation (`/api/payment/order`).
   - Client checkout modal via official Razorpay SDK (`Frontend/src/services/payment.ts`).
   - Server-side HMAC SHA-256 payment signature verification (`/api/payment/verify`).
   - Transaction history viewable in User Profile (`/api/payment/history`).

6. **User Profile & Account Management:**
   - View profile, credits, and account details.
   - Update full name and change password (`PUT /api/user/profile`).
   - Sign out with cookie revocation.

7. **Security & Resilience:**
   - Broken Object Level Authorization (IDOR) protection: Interview reports, answer submissions, and payment verifications verify user ownership.
   - Database readiness middleware (`503 Service Unavailable` with clean message if DB is disconnected).
   - Socket.IO connection authentication preventing unauthorized room access.
   - Zero sensitive credentials or secrets exposed to logs or client code.

---

## Running the Automated Tests

### Backend Tests
```bash
npm --prefix Backend test
```
*Executes unit and integration tests for Password Hashing, JWT Tokens, Interview Scoring, IDOR Protection, Razorpay HMAC Verification, and PDF File Filtering.*

### Frontend Tests
```bash
npm --prefix Frontend test
```
*Executes Vitest tests for Pricing tiers, credit calculations, interview form validation, and feedback formatting.*

---

## Production Build

```bash
# Build Frontend
npm --prefix Frontend run build

# Start Backend Server
npm --prefix Backend start
```
