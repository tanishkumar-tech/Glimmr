Glimmr — Fix & Run Instructions

Summary of important fixes applied:
- Added missing `frontend/output.css` to prevent Vite import failure.
- Added `frontend/src/ErrorBoundary.jsx` and wrapped the app to prevent UI crashes.
- Configured global Axios defaults in `frontend/src/main.jsx` (no forced `/api` base so Vite proxy works).
- Improved backend startup logging and resilient MongoDB connection (prefers `MONGO_URI`, falls back to local `mongodb://127.0.0.1:27017/glimmr`, then to an in-memory server).
- Added request logging, a `/api/health` endpoint, and a global Express error handler.
- Added `.env.example` with recommended variables.

How to run (Windows PowerShell)
1. Install deps
   - Root (optional): `npm install`
   - Backend: `cd backend; npm install`
   - Frontend: `cd frontend; npm install`

2. Copy `.env.example` to `.env` and edit values before starting the backend
   - Most important: `MONGO_URI` and `JWT_SECRET`. You can keep the local default if running MongoDB locally.

3. Start backend
   ```pwsh
   cd C:\\glimmrr\\backend
   $env:PORT=5001
   npm run dev
   ```

4. Start frontend
   ```pwsh
   cd C:\\glimmrr\\frontend
   npm run dev
   ```

Firebase Phone Auth setup (manual; cannot be done purely from code)
1. In the Firebase Console for the project referenced in `frontend/src/firebase.js`:
   - Enable the Phone provider under Authentication → Sign-in method.
   - Add `localhost` domains under Authentication → Authorized domains (add `localhost` and `localhost:5173`).
2. If you want server-side verification of ID tokens, create a Firebase service account JSON and either:
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to the file path; or
   - Set `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env` to the JSON string.

Security notes
- Do not commit real service account keys or secrets to the repo.
- Use a real MongoDB Atlas URI in `MONGO_URI` for production.

If you start the servers and paste the backend stdout and the browser console logs here, I will continue to fix any remaining runtime errors (routes, missing imports, or UI warnings).  
