# Authentication (Email + OTP)

This project includes an email + OTP authentication flow (backend + frontend).

## What was added / verified
- Backend OTP auth implemented in `backend/routes/auth.js`.
- User model in `backend/models/User.js` includes `email`, `otp` (hashed), `otpExpiry`, `isVerified`, timestamps (includes `createdAt`).
- Frontend `Auth` component (`frontend/src/pages/Auth.jsx`) supports signup/login, OTP verify, and resend flows.
- `.env.example` in `backend` updated with required variables for SMTP, Twilio, JWT, MongoDB and OTP settings.

## Environment variables
Copy `backend\.env.example` to `backend\.env` and set values:

- `MONGO_URI` - MongoDB connection string (or leave blank to use in-memory DB for development).
- `JWT_SECRET` - Secret for signing auth tokens.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` - For sending OTP emails.
- `TWILIO_...` - If you want SMS OTPs.
	- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`.
	- Optional: `TWILIO_VERIFY_SERVICE_SID` to use Twilio Verify service (recommended).

Optional OTP settings:
- `OTP_EXPIRY_MINUTES` (default 10)
- `OTP_MAX_ATTEMPTS` (default 5)
- `OTP_RESEND_INTERVAL_SECONDS` (default 60)
- `OTP_LOCK_DURATION_MINUTES` (default 10)

## How to run (development)

From project root, run backend and frontend separately.

Backend (PowerShell):
```powershell
cd backend
npm install
# create .env from .env.example and set values
npm run dev
```

Frontend (PowerShell):
```powershell
cd frontend
npm install
npm run dev
```

Frontend expects the backend API to be available at `/api`. If using Vite proxy, set `VITE_API_BASE_URL` accordingly in `frontend/.env`.

## Testing the flow
1. Open the frontend `/signup` page or `/login` page.
2. Enter an email and click send OTP.
3. Check the email (or SMTP JSON transport logged to backend console when SMTP not configured) for the OTP.
4. Enter the OTP to verify. On success a JWT token is returned and persisted to `localStorage` by the frontend.

### Mailtrap (safe email testing)

1. Sign up for a free Mailtrap account at https://mailtrap.io.
2. Create an inbox and copy the SMTP credentials Mailtrap provides.
3. In `backend/.env` set the SMTP values, for example:

```dotenv
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>
MAIL_FROM=no-reply@example.com
```

4. Restart the backend. Emails will be captured in your Mailtrap inbox where you can view them safely.

### Phone (Firebase) and India-only note

- This project now prefers Firebase client-side phone authentication for SMS OTPs (phone-first, India-only). The backend no longer sends SMS directly.
- To use phone verification:
	- Enable **Phone Authentication** in the Firebase Console for your project.
	- Add `http://localhost:5173` (or your dev URL) to **Authorized Domains** in Firebase Auth settings.
	- The frontend uses Firebase SDK + reCAPTCHA to send the SMS to the user's phone. After the client confirms the code, it sends the Firebase ID token to `POST /api/auth/firebase-login` for server-side verification and account creation.

- The auth flow enforces Indian mobile numbers (E.164 `+91XXXXXXXXXX`). The frontend auto-prefixes `+91` when you enter a 10-digit mobile number.

- If you still require server-side SMS sending, configure your preferred provider and update the backend accordingly; Twilio is no longer configured by default in this repository.

### Profile verification UI

- The `Profile` page now shows per-contact verification status:
	- `emailVerified` and `phoneVerified` are displayed individually as `Verified` or `Not verified`.
	- `isVerified` is true if either contact has been verified.

This allows users to see whether their email or phone is already confirmed and to request/resend OTPs as needed from the Auth UI.

## Notes
- OTPs are hashed before saving to the DB and have expiry and attempt-limits.
- If you do not provide a `MONGO_URI`, the backend falls back to an in-memory MongoDB server (useful for local testing but not for persistence).
- Configure SMTP for real email delivery; otherwise the backend will log a JSON email object to the console for development.

If you'd like, I can:
- Add email templates or an admin view for users.
- Add logout and refresh token flows.
- Add UI for showing verification state in the `Profile` page.
