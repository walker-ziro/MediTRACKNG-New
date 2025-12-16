# Email Service Setup for Render Deployment

## Problem
Render's free tier blocks outbound SMTP connections to Gmail (ports 465, 587, 25), causing "Connection timeout" errors.

## Solution: Use SendGrid (Recommended)

SendGrid works on Render and offers a free tier with 100 emails/day.

### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://signup.sendgrid.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create API Key
1. Log into SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it "MediTRACKNG" or similar
5. Select **Full Access** or **Restricted Access** with "Mail Send" permission
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### Step 3: Verify Sender Email (Required)
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form with your email (e.g., walkertech001@gmail.com)
4. Check your email and click the verification link
5. Once verified, this email will be your "From" address

### Step 4: Add to Render Environment Variables
1. Go to your Render dashboard
2. Select your **MediTRACKNG** service
3. Go to **Environment** tab
4. Add these variables:
   - **Key:** `SENDGRID_API_KEY`  
     **Value:** (paste the API key from Step 2)
   - **Key:** `SENDGRID_FROM_EMAIL`  
     **Value:** (the email you verified in Step 3, e.g., walkertech001@gmail.com)

5. Click **Save Changes**
6. Your service will automatically redeploy

### Step 5: Test
- Try registering a new provider
- You should receive the OTP email within seconds
- Check spam folder if you don't see it

---

## Alternative: Keep Gmail for Local Development

The code now automatically uses:
- **SendGrid** when `SENDGRID_API_KEY` is present (production/Render)
- **Gmail** when only `GMAIL_USER`/`GMAIL_PASS` are present (local development)

This way you don't need to change anything for local testing!

---

## Environment Variables Summary

### For Render (Production):
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=walkertech001@gmail.com
```

### For Local Development (.env file):
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

---

## Troubleshooting

### "Email service not configured"
- Make sure you added the environment variables in Render
- Wait for the service to redeploy after adding them

### "Connection timeout" (with SendGrid)
- Double-check the API key is correct
- Ensure the API key has "Mail Send" permission

### Emails go to spam
- Add SendGrid IP addresses to your SPF record (if using custom domain)
- Ask recipients to mark as "Not Spam"
- Use SendGrid's sender authentication features

### "Sender email not verified"
- You must verify your sender email in SendGrid before it will send emails
- Check your email for the verification link from SendGrid
