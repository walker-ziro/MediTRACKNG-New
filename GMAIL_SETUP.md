# Gmail SMTP Setup Guide

To use Gmail for sending OTPs, you need to configure an **App Password**. You cannot use your regular Gmail password if you have 2-Step Verification enabled (which is recommended).

## 1. Enable 2-Step Verification
1.  Go to your [Google Account](https://myaccount.google.com/).
2.  Select **Security** on the left panel.
3.  Under "How you sign in to Google", select **2-Step Verification**.
4.  Follow the steps to turn it on if it's not already.

## 2. Generate an App Password
1.  Go back to the **Security** page.
2.  Search for "App passwords" in the search bar at the top, or look under "How you sign in to Google" (it might be hidden inside 2-Step Verification settings).
    *   Direct link: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3.  Enter a name for the app (e.g., "MediTRACKNG").
4.  Click **Create**.
5.  Copy the 16-character password generated (it will look like `xxxx xxxx xxxx xxxx`).

## 3. Update Your Environment Variables
Open `backend/.env` and update the Gmail settings:

```dotenv
GMAIL_USER=your_actual_email@gmail.com
GMAIL_PASS=your_16_char_app_password
```

*Note: Remove the spaces in the app password if you want, but it usually works with them too.*

## 4. Restart the Backend
After saving the `.env` file, make sure to restart your backend server for the changes to take effect.
