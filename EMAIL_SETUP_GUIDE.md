# MedPup Email Setup Guide

## Step 1: Create Gmail App Password (Required)
Since May 30, 2022, Google no longer allows third-party apps to sign in using only your username and password. You must use an App Password.

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left navigation panel
3. Under **Signing in to Google**, choose **App Passwords**
   - If you don't see this option, you may need to enable 2-Factor Authentication first
4. At the bottom, choose **Select app** and choose **Mail**
5. Choose **Select device** and choose **Other (Custom name)**
6. Enter "MedPup" and click **Generate**
7. Google will generate a 16-character App Password
8. **Copy this password** - you won't be able to see it again!

## Step 2: Update Email Configuration
Edit `email-config.json` in the MedPup root directory:

```json
{
    "_comment": "MedPup Email Configuration",
    "_help": "For Gmail: use an App Password from https://myaccount.google.com/apppasswords",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "your_email@gmail.com",
    "smtp_password": "YOUR_16_CHARACTER_APP_PASSWORD_HERE",
    "from_email": "hello@medpup.com",
    "from_name": "MedPup Veterinary Concierge"
}
```

Replace:
- `your_email@gmail.com` with your actual Gmail address
- `YOUR_16_CHARACTER_APP_PASSWORD_HERE` with the 16-character password generated above

## Step 3: Test Email Configuration
Run the validation script:
```bash
python scripts/validate_email_config.py
```

Expected output:
```
Email configuration test PASSED
SMTP connection successful
Authentication successful
```

## Step 4: Send Test Email
```bash
python scripts/send-email.py --to your_email@gmail.com --subject "MedPup Test" --body "Email system is working!"
```

## Troubleshooting
- **Authentication failed**: Double-check your App Password is exactly 16 characters with no spaces
- **Account access blocked**: Google may block sign-in attempts - check your Google account for security alerts
- **Less secure apps**: Not needed with App Passwords (more secure method)
- **2-Factor Authentication**: Must be enabled to use App Passwords

## Alternative: Use Different Email Provider
If you prefer not to use Gmail:
1. Update `email-config.json` with your provider's SMTP settings
2. Common providers:
   - Outlook/Hotmail: `smtp-mail.outlook.com`, port 587
   - Yahoo: `smtp.mail.yahoo.com`, port 587
   - Use App Passwords or equivalent for all providers

## Next Steps After Email Setup
Once email is working, proceed with:
1. Website deployment: `cd website && hugo --minify`
2. Send clinic outreach emails using templates in `emails/`
3. Run Facebook demand validation tests
4. Test first client intake pipeline