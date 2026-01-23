# Miad Healthcare Training Portal

## Overview
B2C healthcare training booking platform prototype for Miad (part of TTC Group). Enables healthcare professionals to book live webinar training, purchase e-learning courses, and receive automated notifications.

## Tech Stack
- React 18+ with Vite
- Tailwind CSS for styling (dark theme, cyan/blue accent colors)
- React Router for navigation
- Lucide React for icons

## Key Features
- **Course Catalog**: Browse healthcare training courses by category
- **Live Webinars**: Book Zoom-delivered training sessions
- **E-Learning**: Instant access self-paced courses with 2FA enrollment
- **Booking Flow**: Multi-step wizard with attendee capture
- **Payment**: Stripe integration for card payments
- **Notifications**: Booking confirmations, joining instructions, reminders

## Project Structure
```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── ui/              # Reusable UI components
│   ├── booking/         # Booking flow components
│   └── elearning/       # E-learning components
├── pages/               # Page components
├── services/            # API integrations
│   ├── zoomService.js       # Zoom API integration
│   ├── notificationService.js # Email notifications
│   ├── bookingService.js    # Booking orchestration
│   └── paymentService.js    # Stripe integration
├── data/                # Course data and mock data
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## Build & Run Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables (Production)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_ZOOM_CLIENT_ID=xxx
VITE_ZOOM_CLIENT_SECRET=xxx
VITE_ZOOM_ACCOUNT_ID=xxx
```

## Design System
- Dark theme with gray-900 background
- Cyan/blue accent colors (from-cyan-600 to-blue-600)
- Cards: bg-gray-800/50 with cyan border
- Buttons: Gradient from cyan to blue
- Healthcare-focused iconography

## MVP Requirements (from Miad PDF)
- Online booking portal (book/pay/deliver)
- E-learning with 2FA enrollment and instant access
- Zoom integration for webinar delivery
- Automatic booking confirmations and joining instructions
- Stripe payment processing
- Self-service delegate information capture
