# PocketExpense+

A complete expense tracking mobile application with intelligent insights, built with React Native (Expo) and Node.js.

## Features

### Core Features
- **User Authentication** - Secure JWT-based registration and login
- **Expense Management** - Add, edit, delete expenses with categories
- **Smart Analytics** - Category-wise breakdown and spending insights
- **Offline Support** - Add expenses offline, auto-sync when online
- **Budget Tracking** - Set monthly budgets with overspending alerts
- **Multiple Views** - Daily and monthly expense views

### Insights
- Category comparison between months
- Spending trend analysis
- Budget utilization tracking
- Personalized spending recommendations

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design

### Frontend
- React Native (Expo)
- Redux Toolkit (State Management)
- React Navigation (Stack + Tabs)
- AsyncStorage (Offline Support)
- React Native Chart Kit (Analytics)

## Project Structure

```
PocketExpense+/
│
├── README.md                    # Complete documentation
├── QUICKSTART.md                # 5-minute setup guide
│
├── backend/                     # Node.js API Server
│   ├── package.json            # Dependencies: express, mongoose, jwt, bcrypt
│   ├── .env.example            # Environment template
│   ├── server.js               # Express app entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema (auth, budget)
│   │   └── Expense.js         # Expense schema (amount, category, etc)
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   └── expenseController.js # CRUD, analytics, sync
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Global error handling
│   └── routes/
│       ├── authRoutes.js      # /api/auth/*
│       └── expenseRoutes.js   # /api/expenses/*
│
└── mobile/                      # React Native App
    ├── package.json            # Dependencies: expo, redux, navigation
    ├── app.json                # Expo configuration
    ├── App.js                  # Root component with Redux Provider
    ├── babel.config.js         # Babel config for Expo
    ├── src/
    │   ├── navigation/
    │   │   └── AppNavigator.js # Stack + Tab navigation setup
    │   ├── screens/
    │   │   ├── LoginScreen.js   # Email/password login
    │   │   ├── RegisterScreen.js # User registration
    │   │   ├── HomeScreen.js    # Expense list with filters
    │   │   ├── AddExpenseScreen.js # Add/edit expense form
    │   │   ├── AnalyticsScreen.js # Charts and insights
    │   │   └── ProfileScreen.js # User profile & budget
    │   ├── store/
    │   │   ├── index.js        # Redux store config
    │   │   └── slices/
    │   │       ├── authSlice.js   # Auth state & actions
    │   │       └── expenseSlice.js # Expense state & actions
    │   ├── services/
    │   │   └── api.js          # Axios instance with interceptors
    │   ├── constants/
    │   │   └── index.js        # Categories, colors, payment methods
    │   └── utils/
    │       └── helpers.js      # Currency, date formatting
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pocketexpense
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod
```

6. Start the server:
```bash
npm run dev
```

Server should be running on `http://localhost:5000`

### Mobile Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.js`:
```javascript
// For iOS Simulator
const API_URL = 'http://localhost:5000/api';

// For Android Emulator
const API_URL = 'http://10.0.2.2:5000/api';

// For Physical Device (use your computer's IP)
const API_URL = 'http://192.168.1.XXX:5000/api';
```

4. Start the app:
```bash
npx expo start
```

5. Run on device/emulator:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyBudget": 0,
    "currency": "USD",
    "token": "jwt_token..."
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "monthlyBudget": 5000,
  "currency": "USD"
}
```

### Expense Endpoints

#### Create Expense
```
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,
  "category": "Food",
  "paymentMethod": "Cash",
  "description": "Lunch at cafe",
  "date": "2024-12-25T12:00:00Z"
}
```

#### Get All Expenses
```
GET /api/expenses?view=monthly
GET /api/expenses?startDate=2024-12-01&endDate=2024-12-31
GET /api/expenses?category=Food
Authorization: Bearer {token}
```

#### Get Single Expense
```
GET /api/expenses/:id
Authorization: Bearer {token}
```

#### Update Expense
```
PUT /api/expenses/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 60.00,
  "category": "Food"
}
```

#### Delete Expense
```
DELETE /api/expenses/:id
Authorization: Bearer {token}
```

#### Get Category Breakdown
```
GET /api/expenses/analytics/category-breakdown
GET /api/expenses/analytics/category-breakdown?startDate=2024-12-01
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "category": "Food",
        "amount": 500,
        "count": 25,
        "percentage": "35.71"
      }
    ],
    "totalSpent": 1400
  }
}
```

#### Get Insights
```
GET /api/expenses/analytics/insights
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "insights": [
      {
        "category": "Food",
        "message": "You spent 20% more on Food this month",
        "currentAmount": 500,
        "previousAmount": 416.67,
        "difference": 83.33,
        "percentageChange": 20.00
      }
    ],
    "currentMonthTotal": 1400,
    "previousMonthTotal": 1200,
    "monthlyBudget": 5000
  }
}
```

#### Sync Offline Expenses
```
POST /api/expenses/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "expenses": [
    {
      "amount": 30,
      "category": "Transportation",
      "paymentMethod": "Cash",
      "date": "2024-12-25T10:00:00Z"
    }
  ]
}
```

## Available Categories

- Food
- Transportation
- Shopping
- Entertainment
- Bills
- Healthcare
- Education
- Travel
- Other

## Payment Methods

- Cash
- Credit Card
- Debit Card
- UPI
- Net Banking
- Other

## Features in Detail

### Offline Support
The app automatically detects network status and saves expenses locally when offline. When the connection is restored, you can manually sync or it will auto-sync on app launch.

### Budget Tracking
Set a monthly budget in your profile. The app will:
- Show budget utilization percentage
- Alert when you've used 90% or more
- Display progress bars in analytics

### Smart Insights
The app analyzes your spending patterns and provides:
- Month-over-month category comparisons
- New spending category alerts
- Budget overspending warnings
- Personalized recommendations

### Security
- Passwords hashed with bcrypt
- JWT tokens with expiration
- Protected API endpoints
- Secure token storage in AsyncStorage
