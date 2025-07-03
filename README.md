# Subsaver

Subsaver is a modern subscription expense management app. It helps you track, manage, and get reminders for all your online subscriptions in one place.

## Features
- **Gmail Import:** Automatically extract subscription details from your Gmail receipts (supports plain text & HTML emails).
- **Dashboard:** View, add, and delete subscriptions with a clean UI.
- **Theme Support:** Switch between light and dark mode (remembers your choice).
- **Service Detection:** Recognizes popular services like Netflix, Amazon Prime, Spotify, and more.

## Quick Start

### Backend
1. `cd backend`
2. `npm install`
3. Set up your `.env` file (see `.env.example` for required variables).
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Visit [http://localhost:5173](http://localhost:5173) to use the app.

## Gmail Import Setup
- Configure Google OAuth credentials in your backend `.env`.
- Click "Import Subscriptions from Gmail" in the dashboard to connect your Gmail and import subscriptions.

## Tech Stack
- **Frontend:** React, Tailwind CSS, DaisyUI
- **Backend:** Node.js, Express, MongoDB

## License
MIT 