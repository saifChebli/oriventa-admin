# Client Account Feature Guide

## Overview
This feature allows managers to create client accounts and clients to access their own dashboard with mail, suivi (tracking), and profile management.

## Features Implemented

### 1. Client Account Creation (Manager Role)
- Managers can create client accounts through the Settings page
- Select "Client" role when creating a new user
- System automatically uses the client-specific endpoint for account creation

### 2. Client Dashboard
- **Dashboard**: Overview with mail, suivi, and profile sections
- **Messages**: Communication interface with support team
- **Suivi**: Track application progress and document status
- **Profile**: Manage personal information and account settings

### 3. Client-Specific Navigation
- Clients see a simplified navigation menu with only relevant options
- Navigation items: Dashboard, Messages, Suivi, Profile, Logout

## How to Use

### For Managers:
1. Login with manager credentials
2. Go to Settings page
3. Click "Add User" button
4. Fill in email and password
5. Select "Client" from the role dropdown
6. Click "Create User"

### For Clients:
1. Login with client credentials
2. Access the client dashboard with:
   - **Dashboard**: Overview of account status and recent activity
   - **Messages**: View and send messages to support team
   - **Suivi**: Track application progress and document status
   - **Profile**: Update email and password

## API Endpoints

### Client Management (Manager Access)
- `POST /api/clients/create` - Create new client account
- `GET /api/clients/all` - Get all client accounts
- `DELETE /api/clients/:clientId` - Delete client account

### Client Profile (Client Access)
- `GET /api/clients/profile` - Get client profile
- `PUT /api/clients/profile` - Update client profile

## Database Changes
- Added 'client' role to User model enum
- Client accounts are stored in the same User collection with role: 'client'

## Security
- Client creation requires manager/admin role
- Client profile access is restricted to the account owner
- All endpoints use JWT authentication with role-based access control

## File Structure
```
server/
├── controllers/clients/client.controller.js
├── routes/client.route.js
└── models/User.js (updated)

client/src/
├── pages/client/
│   ├── ClientDashboard.jsx
│   ├── ClientMail.jsx
│   ├── ClientSuivi.jsx
│   └── ClientProfile.jsx
├── Routes.jsx (updated)
├── ui/Layout.jsx (updated)
└── pages/settings/Settings.jsx (updated)
```

## Testing
1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm run dev`
3. Login as manager and create a client account
4. Login as client and test all client features
