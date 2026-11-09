# InterviewAI Platform — Production Deployment Guide

This project consists of a decoupled frontend (Vite + React 18 + TypeScript) and backend (Node.js + Express + Socket.IO + MongoDB Atlas).

---

## 1. Environment Configurations

### Backend (`Backend/.env`)
Configure the following environment variables in your hosting provider (e.g., Render, Railway, AWS ECS, or Docker):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP Server Port | `6000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URL` | MongoDB Atlas Connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/InterviewAI` |
| `JWT_SECRET` | Secret key for signing JWTs | `strong_random_jwt_secret_key` |
| `OPENROUTER_API_KEY` | OpenRouter API Key | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI Model identifier | `openai/gpt-4o-mini` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `secret_...` |
| `FRONTEND_URL` | Deployed Frontend Origin URL | `https://interviewai.onrender.com` |

### Frontend (`Frontend/.env`)
Configure these during the build phase:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Origin of the deployed Backend API | `https://interviewai-backend.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Public Key for Razorpay Checkout Popup | `rzp_live_...` or `rzp_test_...` |

---

## 2. Production Build & Run Commands

### Backend Service
- **Build Command:** `npm install`
- **Start Command:** `npm start` (or `node index.js`)
- **Health Check Path:** `/api/health`

### Frontend Service
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

---

## 3. Pre-Flight Verification & Health Check

1. **Verify Health Endpoint:**
   ```bash
   curl -i https://interviewai-backend.onrender.com/api/health
   ```
   *Expected Response:* `HTTP 200 OK` with JSON `{ "status": "ok", "ready": true, "db": "connected" }`.
   *(Note: Returns HTTP 503 if MongoDB connection is pending or disconnected).*

2. **Verify CORS Headers:**
   ```bash
   curl -i -X OPTIONS "https://interviewai-backend.onrender.com/api/auth" \
     -H "Origin: https://interviewai.onrender.com" \
     -H "Access-Control-Request-Method: GET"
   ```
   *Expected Header:* `Access-Control-Allow-Origin: https://interviewai.onrender.com` and `Access-Control-Allow-Credentials: true`.

3. **Run Automated Test Suites:**
   ```bash
   # Run Backend Tests
   npm --prefix Backend test

   # Run Frontend Tests
   npm --prefix Frontend test
   ```
