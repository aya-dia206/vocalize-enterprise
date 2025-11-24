# Vocalize Enterprise - Project TODO

## Design & Configuration
- [x] Configure Tailwind CSS with PortSynt design system (Deep Black #07090E, Purple #9333EA)
- [x] Import Inter font from Google Fonts
- [x] Set up dark theme with CSS variables in index.css
- [x] Configure shadcn/ui components

## Components & UI
- [x] Install and set up shadcn/ui components (Button, Card, Input, Table, Sheet, Select, Form)
- [x] Build Login page with glassmorphism design
- [x] Build Dashboard page with metric cards (Calls, Spend, Sentiment, Bookings)
- [x] Implement Recharts area chart with purple fill
- [x] Build Live Activity Feed component
- [x] Build Settings page with forms (Vapi Assistant ID, GHL Token, etc.)
- [x] Implement global sidebar navigation with clinic switcher (Combobox)

## Backend & API
- [x] Create API layer (src/lib/api.ts) for n8n webhook communication
- [x] Implement authentication context (AgencyContext)
- [x] Wire login endpoint to api.login()
- [x] Wire settings save to api.saveSettings()
- [ ] Create database schema for agencies and settings

## Testing
- [x] Write Vitest tests for API layer
- [x] Write Vitest tests for authentication flows
- [x] Test dashboard data loading and rendering

## Deployment
- [ ] Create GitHub repository named vocalize-enterprise
- [ ] Push code to GitHub
- [ ] Save project checkpoint
