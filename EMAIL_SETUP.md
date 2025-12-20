# Email Service Setup for MediTRACKNG

## Using Brevo (Recommended for Production)

Brevo (formerly Sendinblue) is a reliable email service that works on all hosting platforms including Render.

### Step 1: Create Brevo Account
1. Go to [Brevo](https://www.brevo.com/)
2. Sign up for a free account (300 emails/day)
3. Verify your email address

### Step 2: Get SMTP Credentials
1. Log into Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Under **SMTP**, you'll see:
   - **SMTP Server:** smtp-relay.brevo.com
   - **Port:** 587
   - **Login:** (your email or username)
   - **SMTP Key:** Click "Create a new SMTP key" if you don't have one

### Step 3: Verify Sender Email
1. In Brevo dashboard, go to **Senders**
2. Click **Add a sender**
3. Fill in your details (name and email)
4. Check your email for verification link
5. Click to verify

### Step 4: Add to Environment Variables

#### For Render (Production):
1. Go to your Render dashboard
2. Select your MediTRACKNG service
3. Go to **Environment** tab
4. Add these variables:
   ```
   BREVO_API_KEY=your-smtp-key-here
   BREVO_SMTP_USER=your-brevo-login-email
   BREVO_FROM_EMAIL=verified-sender@yourdomain.com
   FRONTEND_URL=https://meditrackng.vercel.app
   ```
5. Click **Save Changes**

#### For Local Development (.env file):
```env
BREVO_API_KEY=your-smtp-key-here
BREVO_SMTP_USER=your-brevo-login-email
BREVO_FROM_EMAIL=verified-sender@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

---

## Alternative: Using Gmail (Local Development Only)

Gmail can be used for local development but **will not work on Render** due to SMTP restrictions.

### Setup Gmail:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "2-Step Verification", scroll to "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. Add to `.env`:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-16-char-app-password
   ```

---

## Features Implemented

### 1. OTP Verification
- ✅ Email sent during provider/patient registration
- ✅ 6-digit OTP code
- ✅ 10-minute expiration
- ✅ Resend OTP functionality

### 2. Password Reset
- ✅ Request reset via email
- ✅ Secure token-based reset link
- ✅ 1-hour expiration
- ✅ Works for all user types (provider, patient, admin)

### API Endpoints:

#### Request Password Reset:
```http
POST /api/multi-auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com",
  "userType": "provider" // or "patient" or "admin"
}
```

#### Reset Password:
```http
POST /api/multi-auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newPassword123",
  "userType": "provider"
}
```

#### Verify OTP:
```http
POST /api/multi-auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "userType": "provider"
}
```

#### Resend OTP:
```http
POST /api/multi-auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "userType": "provider"
}
```

---

## Troubleshooting

### "Email service not configured"
- Ensure you added the environment variables in Render
- Wait for the service to redeploy after adding variables
- Check the logs to confirm variables are loaded

### "Connection timeout"
- For Render: Use Brevo, not Gmail
- Verify SMTP credentials are correct
- Check that port 587 is being used

### Emails go to spam
- Add SPF record to your domain DNS
- Verify sender email in Brevo
- Ask recipients to mark as "Not Spam"

### "Invalid or expired token"
- Password reset tokens expire after 1 hour
- Request a new reset link
- Ensure the token wasn't modified

---

## Environment Variables Summary

### Production (Render):
```env
BREVO_API_KEY=your-smtp-key
BREVO_SMTP_USER=your-email@domain.com
BREVO_FROM_EMAIL=noreply@meditrackng.com
FRONTEND_URL=https://meditrackng.vercel.app
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-connection-string
```

### Local Development:
```env
BREVO_API_KEY=your-smtp-key
BREVO_SMTP_USER=your-email@domain.com
BREVO_FROM_EMAIL=noreply@meditrackng.com
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/meditrackng
```

---

## Testing

### Test OTP Email:
1. Register a new provider or patient
2. Check your email for 6-digit code
3. Enter code in verification screen
4. Account should be activated

### Test Password Reset:
1. Go to login page
2. Click "Forgot Password"
3. Enter email and user type
4. Check email for reset link
5. Click link and enter new password
6. Login with new password
