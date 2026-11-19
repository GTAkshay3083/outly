# Outly Django + FCM Push Notification Microservice

This service bridges Supabase real-time events and Firebase Cloud Messaging (FCM) to deliver background push notifications to Android & iOS mobile devices running the Outly Capacitor app.

---

## 1. Quick Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py check
python manage.py runserver 8000
```

---

## 2. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Project Settings** > **Service Accounts**.
3. Click **Generate New Private Key** to download your JSON credentials.
4. Place the file inside `backend/` as `firebase-service-account.json` (or set the path in `.env` as `FIREBASE_CREDENTIALS_PATH`).

> *Note: If no credentials file is present, the service runs in **Mock Mode**, logging push payloads to the console for local development.*

---

## 3. Supabase Database Migration

Run this single SQL command in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) to enable device token tracking:

```sql
-- Add FCM token column for push notifications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token text;
```

---

## 4. Supabase Database Webhook Setup

In your Supabase project dashboard:
1. Go to **Database** > **Webhooks** > **Create a new webhook**.
2. **Webhook Name**: `Outly Push Dispatcher`
3. **Table**: Select `plan_requests` (and a second one for `plan_messages`).
4. **Events**: Check `INSERT` and `UPDATE`.
5. **HTTP Request**:
   * Method: `POST`
   * URL: `https://<your-backend-host>/api/notifications/webhook/supabase/`
   * HTTP Headers: `Content-Type: application/json`

---

## 5. Automated Outing Reminders (Countdown)

To send 2-hour countdown reminders to all squad members before an outing begins, run:

```bash
python manage.py check_reminders
```

*(You can schedule this command to run every 15 minutes using cron, Windows Task Scheduler, or Celery Beat).*

---

## 6. Endpoints Reference

* `GET /api/notifications/health/` — Health check endpoint.
* `POST /api/notifications/webhook/supabase/` — Handles Supabase row change webhooks.
* `POST /api/notifications/test-push/` — Direct testing endpoint to send a push to a specific token:
  ```json
  {
    "token": "YOUR_DEVICE_FCM_TOKEN",
    "title": "Outly Test",
    "body": "Testing push notifications from Django"
  }
  ```
