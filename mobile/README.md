# CLSU NEXUS - Mobile App (React Native)

Mobile application for CLSU NEXUS Smart Queue Management System.

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain (recommended for beginners)
- **React Navigation** - Navigation library
- **AsyncStorage** - Local storage for tokens
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time WebSocket connections

## Project Structure

```
mobile/
├── App.js                    # Main app entry point
├── package.json              # Dependencies
├── app.json                  # Expo configuration
├── src/
│   ├── navigation/           # Navigation setup
│   ├── screens/              # Screen components
│   │   ├── auth/             # Authentication screens
│   │   ├── student/          # Student screens
│   │   └── staff/            # Staff screens (optional)
│   ├── components/           # Reusable components
│   ├── services/             # API services
│   │   ├── api.js            # API client configuration
│   │   ├── auth.js           # Authentication API calls
│   │   ├── queue.js          # Queue API calls
│   │   └── socket.js         # WebSocket client
│   ├── context/              # React Context (Auth context)
│   ├── utils/                # Utility functions
│   └── constants/            # App constants
└── assets/                   # Images, fonts, etc.
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
npm start
# or
expo start
```

Scan the QR code with Expo Go app on your phone.

## API Base URL

Default: `http://localhost:3000/api`

For physical device testing, you'll need to use your computer's IP address:
- Windows: `ipconfig` (look for IPv4 address)
- Mac/Linux: `ifconfig` (look for inet address)

Update the API base URL in `src/services/api.js` accordingly.

