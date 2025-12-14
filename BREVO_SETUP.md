# Brevo (Sendinblue) SMTP Setup Guide

If you are not receiving verification emails, follow these steps to ensure your Brevo account is correctly configured.

## 1. Verify Your Sender Identity
**This is the most common reason for failure.** You cannot send emails from a domain (like `@meditrackng.com`) unless you have verified ownership of that domain.

1.  Log in to your [Brevo Dashboard](https://app.brevo.com/).
2.  Click on your name in the top-right corner and select **Senders & IP**.
3.  Look at the **Senders** list.
4.  **Action:** Ensure you have a verified email address here.
    *   If you are testing, use your personal email (e.g., `walkertech001@gmail.com`) and verify it.
    *   Once verified, update your `.env` file (see below).

## 2. Get Your SMTP Credentials
1.  Go to **Transactional** > **Settings** (or click your name > **SMTP & API**).
2.  Click on the **SMTP** tab.
3.  Copy the **SMTP Key** (This is your password). *Note: You might need to generate a new key if you lost the old one.*
4.  Copy the **Login** (This is your username).

## 3. Update Your Environment Variables
Open `backend/.env` and ensure these values match what you got from Brevo:

```dotenv
BREVO_SMTP_USER=your_login_email@example.com
BREVO_SMTP_PASS=your_smtp_key_here
# Optional: If you want to send from a specific verified email
BREVO_SENDER_EMAIL=walkertech001@gmail.com 
```

## 4. Check Your Spam Folder
*   Emails sent from unverified domains or free SMTP accounts often land in **Spam** or **Promotions**.
*   Search for "MediTRACKNG" in your email.

## 5. Monitor Brevo Logs
1.  Go to **Transactional** > **Logs** in the Brevo dashboard.
2.  Check if the emails are appearing there.
    *   **Delivered**: The email was sent. Check your inbox/spam.
    *   **Deferred/Bounced**: There is an issue with the recipient address or your reputation.
    *   **Blocked**: You might be sending to invalid addresses or have been flagged.

## Troubleshooting
*   **Error: "Sender not authorized"**: You are trying to send from `no-reply@meditrackng.com` but that domain is not verified. Set `BREVO_SENDER_EMAIL` in your `.env` to a verified email address.
