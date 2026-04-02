# 🏦 Zorvyn Finance — Finance Data Processing and Access Control Backend

> A role-based finance data processing and access control system built with the MERN stack.

**🌐 Live Frontend:** [https://zorvyn-finance-assignment.vercel.app](https://zorvyn-finance-assignment.vercel.app)  
**🖥️ Live Backend API:** [https://zorvyn-finance-assignment.onrender.com](https://zorvyn-finance-assignment.onrender.com)  
**📖 API Documentation:** [API_DOCS.md](./API_DOCS.md)  
**📂 GitHub Repository:** [https://github.com/abhi-14gyan/Zorvyn-Finance-Assignment](https://github.com/abhi-14gyan/Zorvyn-Finance-Assignment)

> **Quick Access:** Click "🚀 Explore as Guest" on the login page to instantly access the dashboard with pre-loaded sample data — no registration required.

---

## 📋 Table of Contents

- [Assignment Mapping](#-assignment-mapping)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployed URLs](#-deployed-urls)
- [Authentication Flow](#-authentication-flow)
- [Data Modeling](#-data-modeling)
- [Access Control Implementation](#️-access-control-implementation)
- [Dashboard Summary API](#-dashboard-summary-api)
- [Validation & Error Handling](#-validation--error-handling)
- [Optional Enhancements](#-optional-enhancements)
- [Testing the RBAC](#-testing-the-rbac)
- [Assumptions & Trade-offs](#️-assumptions--trade-offs)
- [Author](#-author)

---

## 📋 Assignment Mapping

This project was built as a submission for the **Finance Data Processing and Access Control Backend** assignment. Below is a direct mapping of each core requirement to its implementation:

| # | Requirement | Implementation | Key Files |
|---|---|---|---|
| 1 | **User & Role Management** | Users with `role` (viewer / analyst / admin) and `status` (active / inactive). Admin endpoints for creating users, assigning roles, and managing status. | `user.model.js`, `user.controller.js`, `authorize.middleware.js` |
| 2 | **Financial Records Management** | Full CRUD for transactions with amount, type (INCOME/EXPENSE), category, date, and description. Filtering by date range, category, type. Pagination and search. | `transactions.controller.js`, `transaction.routes.js`, `transaction.validation.js` |
| 3 | **Dashboard Summary APIs** | MongoDB aggregation pipeline returning total income/expenses, net balance, category-wise breakdown, recent transactions, and monthly trends. | `dashboard.controller.js` → `getDashboardSummary` |
| 4 | **Access Control Logic** | `authorize(...roles)` middleware enforces role-based route access. Viewer = read-only dashboard, Analyst = read records + summaries, Admin = full CRUD + user management. | `authorize.middleware.js`, all route files |
| 5 | **Validation & Error Handling** | Joi schemas for all write endpoints. Global error handler returns structured JSON with field-level errors. Custom `ApiError` class with proper HTTP status codes. | `validations/`, `validate.middleware.js`, `app.js` |
| 6 | **Data Persistence** | MongoDB Atlas with Mongoose ODM. `Decimal128` for financial precision. MongoDB sessions for atomic transaction + balance updates. | `models/`, controllers |

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Backend Framework** | Express.js 5 |
| **Database** | MongoDB Atlas (Mongoose ODM, Decimal128 for money) |
| **Frontend** | React 18, Tailwind CSS, Recharts, React Router v6 |
| **Authentication** | JWT (Access + Refresh tokens in httpOnly cookies), Passport.js (Google OAuth) |
| **Validation** | Joi schema validation (backend), Zod (frontend) |
| **AI** | Google Gemini 1.5 Flash (receipt scanning) |
| **Email** | Nodemailer (Gmail SMTP — verification emails, budget alerts) |
| **Background Jobs** | Inngest (cron-based budget monitoring) |
| **Security** | Arcjet (rate limiting + bot detection), Helmet.js (HTTP headers), bcryptjs |
| **File Uploads** | Multer + Cloudinary |
| **Deployment** | Render (backend), Vercel (frontend) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 React Frontend (Vercel)                   │
│  Dashboard │ Admin Panel │ Transactions │ Accounts        │
└─────────┬────────────────────────────────────────────────┘
          │ HTTPS (JWT in httpOnly cookies)
┌─────────▼────────────────────────────────────────────────┐
│               Express.js Backend (Render)                 │
│                                                           │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────────┐  │
│  │ verifyJWT │→│ authorize │→│ validate(joiSchema)    │  │
│  │ Middleware│  │ (roles)   │  │ Joi validation         │  │
│  └──────────┘  └───────────┘  └───────────────────────┘  │
│                                                           │
│  ┌─────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │ Arcjet  │  │ checkActive    │  │ Multer + Cloud  │   │
│  │ Rate    │  │ Status         │  │ inary           │   │
│  │ Limiter │  │ Middleware     │  │ File Uploads    │   │
│  └─────────┘  └────────────────┘  └─────────────────┘   │
│                                                           │
│  Controllers: User │ Transaction │ Dashboard │ Budget     │
│                         ↕ MongoDB Sessions                │
│  ┌────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Mongoose)               │   │
│  │  Users │ Accounts │ Transactions │ Budgets          │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Middleware Chain (Every Protected Request)

```
Request → verifyJWT → checkActiveStatus → authorize(roles) → validate(schema) → Controller
```

### Role-Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View dashboard summary | ✅ | ✅ | ✅ |
| View accounts list | ✅ | ✅ | ✅ |
| View budget info | ✅ | ✅ | ✅ |
| List / view transactions | ❌ | ✅ | ✅ |
| View account details | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ❌ | ✅ |
| Update transactions | ❌ | ❌ | ✅ |
| Delete transactions | ❌ | ❌ | ✅ |
| Create / delete accounts | ❌ | ❌ | ✅ |
| Update budget | ❌ | ❌ | ✅ |
| Manage users (roles, status) | ❌ | ❌ | ✅ |

---

## 📂 Project Structure

```
Zorvyn-Finance-Assignment/
├── backend/
│   ├── src/
│   │   ├── config/                  # Passport Google strategy
│   │   ├── controllers/
│   │   │   ├── user.controller.js          # Auth + admin user management
│   │   │   ├── transactions.controller.js  # CRUD + filters + pagination + AI receipt scan
│   │   │   ├── dashboard.controller.js     # Summary aggregation pipeline
│   │   │   ├── account.controller.js       # Account CRUD operations
│   │   │   └── budgetController.js         # Budget management
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js           # JWT verification
│   │   │   ├── authorize.middleware.js      # Role-based access control
│   │   │   ├── validate.middleware.js       # Joi schema validation
│   │   │   ├── arcjet.middleware.js         # Rate limiting (per-user token bucket)
│   │   │   └── multer.middleware.js         # File upload handling
│   │   ├── models/
│   │   │   ├── user.model.js               # role, status, verification fields
│   │   │   ├── account.model.js            # Decimal128 balance
│   │   │   ├── transaction.model.js        # Decimal128 amount
│   │   │   └── budget.model.js
│   │   ├── routes/                  # Express routers with RBAC guards
│   │   ├── validations/             # Joi schemas
│   │   │   ├── user.validation.js
│   │   │   ├── transaction.validation.js
│   │   │   └── account.validation.js
│   │   ├── seeds/
│   │   │   └── seed.js              # Creates demo users + sample data
│   │   ├── utils/                   # ApiError, ApiResponse, asyncHandler, Cloudinary
│   │   ├── actions/                 # Email sending, budget alerts (Inngest)
│   │   ├── templates/               # HTML email templates
│   │   ├── app.js                   # Express setup + CORS + global error handler
│   │   └── index.js                 # Server entry point + Inngest registration
│   ├── .env.example                 # Environment variable template
│   └── package.json
│
├── Frontend/finlock/
│   └── src/
│       ├── pages/
│       │   ├── dashboard.jsx            # Role-aware financial dashboard
│       │   ├── AdminPanel.jsx           # Admin user management panel
│       │   ├── account.jsx              # Account detail + transactions
│       │   ├── transaction.jsx          # Transaction creation form
│       │   ├── Signin.jsx               # Login page
│       │   ├── Register.jsx             # Registration with image upload
│       │   └── LandingPage.jsx          # Public landing page
│       ├── components/
│       │   ├── AppLayout.jsx            # Sidebar with role badge + admin nav
│       │   ├── transaction-form.jsx     # Full transaction form with calendar
│       │   ├── CreateAccountDrawer.jsx  # Account creation modal
│       │   ├── receiptScanner.jsx       # AI receipt scanning UI
│       │   └── ...
│       ├── context/
│       │   ├── AuthContext.js           # Authentication state management
│       │   └── ThemeContext.js          # Dark/light mode theming
│       └── utils/
│           └── axios.js                 # Pre-configured Axios instance
│
├── API_DOCS.md                      # Complete API documentation
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/abhi-14gyan/Zorvyn-Finance-Assignment.git
cd Zorvyn-Finance-Assignment
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, etc.
```

**Required environment variables:**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (default: `zorvyn`) |
| `ACCESS_TOKEN_SECRET` | Random string for signing JWTs |
| `REFRESH_TOKEN_SECRET` | Random string for signing refresh tokens |
| `CORS_ORIGIN` | Frontend URL (e.g., `http://localhost:3000`) |
| `FRONTEND_URL` | Used in email verification links |

See `.env.example` for the complete list of variables (required and optional).

### 3. Seed the Database

```bash
npm run seed
```

This creates demo users with sample financial data:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@zorvyn.com` | `admin123` |
| Analyst | `analyst@zorvyn.com` | `analyst123` |
| Viewer | `viewer@zorvyn.com` | `viewer123` |
| Guest | Use "🚀 Explore as Guest" button | — |

### 4. Start the Backend

```bash
npm run dev    # Development mode (with nodemon)
npm start      # Production mode
```

Backend runs on `http://localhost:4000`

### 5. Frontend Setup

```bash
cd ../Frontend/finlock
npm install

# Create .env file
echo REACT_APP_BACKEND_URL=http://localhost:4000 > .env

npm start
```

Frontend runs on `http://localhost:3000`

---

## 🌐 Deployed URLs

| Service | Platform | URL |
|---|---|---|
| **Backend API** | Render | [https://zorvyn-finance-assignment.onrender.com](https://zorvyn-finance-assignment.onrender.com) |
| **Frontend** | Vercel | [https://zorvyn-finance-assignment.vercel.app](https://zorvyn-finance-assignment.vercel.app) |
| **Health Check** | — | [https://zorvyn-finance-assignment.onrender.com/api/health](https://zorvyn-finance-assignment.onrender.com/api/health) |

> **Note:** The Render free tier spins down after 15 minutes of inactivity. The first request after inactivity may take ~30 seconds to cold-start.

---

## 🔐 Authentication Flow

```
Register → Email Verification → Login → JWT Cookie → Authenticated Requests → Refresh Token
```

1. **Register** → Creates user with `viewer` role → Sends verification email
2. **Verify Email** → User clicks link in email → `isVerified` set to `true`
3. **Login** → JWT access token (short-lived) + refresh token (long-lived) set as httpOnly cookies
4. **API Requests** → `verifyJWT` middleware extracts and verifies token from cookie
5. **Token Refresh** → Automatic renewal via `POST /api/v1/users/refresh-token`
6. **Google OAuth** → Optional alternative login → Auto-verified `viewer` role
7. **Guest Login** → One-click demo access with pre-seeded admin account

### Token Strategy

| Token | Storage | Expiry | Purpose |
|---|---|---|---|
| Access Token | httpOnly cookie (`Secure`, `SameSite=None`) | 1 day | API authentication |
| Refresh Token | httpOnly cookie + DB | 10 days | Token renewal |

---

## 💰 Data Modeling

### Why Decimal128 for Money?

Standard JavaScript `Number` (IEEE 754 float) loses precision with decimal arithmetic:
```js
0.1 + 0.2 === 0.30000000000000004 // true — unacceptable in finance
```

MongoDB's `Decimal128` provides exact decimal representation. Every `amount` and `balance` field uses `Decimal128` to ensure financial accuracy.

### Atomic Transactions

Every transaction creation, update, or deletion uses **MongoDB sessions** to atomically update both the transaction record AND the account balance. If either operation fails, both are rolled back — preventing data inconsistency.

```js
const session = await Transaction.startSession();
session.startTransaction();
try {
  // 1. Create/update/delete the transaction record
  // 2. Update the account balance accordingly
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();  // Both operations safely rolled back
  throw error;
}
```

### Data Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `username`, `email`, `password`, `role`, `status`, `isVerified`, `imageUrl` | Roles: `viewer`, `analyst`, `admin`. Status: `active`, `inactive`. |
| **Account** | `name`, `type`, `balance` (Decimal128), `userId`, `isDefault` | Types: `savings`, `current`, `investment`, `credit`, `other`. |
| **Transaction** | `type`, `amount` (Decimal128), `category`, `date`, `description`, `accountId`, `userId` | Types: `INCOME`, `EXPENSE`. Optional: `isRecurring`, `recurringInterval`. |
| **Budget** | `amount`, `userId`, `lastAlertSent` | Unique per user. Inngest cron monitors usage at 80%. |

---

## 🛡️ Access Control Implementation

### Middleware Architecture

Every protected route passes through a layered middleware chain:

```
Request → verifyJWT → checkActiveStatus → authorize(roles) → validate(schema) → Controller
```

| Middleware | Purpose | Failure Response |
|---|---|---|
| `verifyJWT` | Extracts JWT from cookie/header, verifies signature, loads user from DB | `401 Unauthorized` |
| `checkActiveStatus` | Blocks users with `status: "inactive"` | `403 Forbidden` |
| `authorize(...roles)` | Checks `req.user.role` against the allowed roles array | `403 Forbidden` |
| `validate(schema)` | Validates `req.body` against Joi schema, returns field-level errors | `400 Bad Request` |

### Example Protected Route

```js
// Only admin can create transactions
router.post("/",
  verifyJWT,                           // Must be logged in
  checkActiveStatus,                    // Must have active account
  authorize("admin"),                   // Must be admin role
  rateLimiter,                          // Arcjet rate limiting
  validate(createTransactionSchema),    // Request body must pass Joi validation
  createTransaction                     // Business logic
);
```

### Inactive User Handling

If an admin deactivates a user's account via `PATCH /users/:id/status`, the `checkActiveStatus` middleware immediately blocks all subsequent API requests from that user with a `403 Forbidden` response — even if their JWT is still valid.

---

## 📊 Dashboard Summary API

`GET /api/v1/dashboard/summary` returns a comprehensive financial overview built from MongoDB aggregation pipelines:

```json
{
  "success": true,
  "data": {
    "totalIncome": 150000,
    "totalExpenses": 82500,
    "netBalance": 67500,
    "totalBalance": 40000,
    "categoryBreakdown": [
      { "category": "salary", "type": "INCOME", "total": 100000, "count": 4 },
      { "category": "groceries", "type": "EXPENSE", "total": 12000, "count": 15 }
    ],
    "recentTransactions": [
      {
        "_id": "...",
        "type": "EXPENSE",
        "amount": 500,
        "category": "food",
        "date": "2026-03-30T...",
        "description": "Dinner"
      }
    ],
    "monthlyTrends": [
      { "month": "2025-11", "income": 25000, "expenses": 14000 },
      { "month": "2025-12", "income": 25000, "expenses": 13500 },
      { "month": "2026-01", "income": 25000, "expenses": 12800 }
    ],
    "accountCount": 2
  }
}
```

The aggregation pipeline runs server-side in MongoDB, computing totals, grouping by category, and building monthly trends — all in a single efficient query rather than multiple round-trip fetches.

---

## ✅ Validation & Error Handling

### Input Validation

All write endpoints are protected by **Joi schemas** that validate request bodies before they reach the controller:

```js
// Example: transaction.validation.js
const createTransactionSchema = Joi.object({
  type: Joi.string().valid("INCOME", "EXPENSE").required(),
  amount: Joi.number().positive().precision(2).required(),
  date: Joi.date().iso().required(),
  category: Joi.string().trim().required(),
  accountId: Joi.string().hex().length(24).required(),
  // ...
});
```

### Error Response Format

All errors return structured, consistent JSON:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "type", "message": "Type must be either INCOME or EXPENSE" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| `200` | Success | Login, data fetch, update |
| `201` | Created | New transaction, new account |
| `400` | Bad Request | Validation error, missing fields |
| `401` | Unauthorized | Missing/invalid JWT token |
| `403` | Forbidden | Wrong role, inactive account |
| `404` | Not Found | Invalid resource ID |
| `409` | Conflict | Duplicate email on registration |
| `429` | Too Many Requests | Rate limited by Arcjet |
| `500` | Internal Server Error | Unhandled exception |

### Global Error Handler

A centralized error handler in `app.js` catches all thrown `ApiError` instances and unhandled exceptions, returning consistent JSON responses. In development mode, the stack trace is included for debugging.

---

## ✨ Optional Enhancements

| Enhancement | Status | Details |
|---|---|---|
| **Token-based Authentication** | ✅ | JWT access + refresh tokens in httpOnly cookies with `Secure` and `SameSite=None` |
| **Google OAuth** | ✅ | Passport.js Google strategy — works without credentials (graceful degradation) |
| **Email Verification** | ✅ | Crypto tokens + Nodemailer verification flow with 24-hour expiry |
| **Pagination** | ✅ | `page` and `limit` query params on transactions (default: 20, max: 100) |
| **Search Support** | ✅ | `?search=keyword` on transaction descriptions (case-insensitive regex) |
| **Rate Limiting** | ✅ | Arcjet token-bucket rate limiter (50 requests/hour per user on write endpoints) |
| **Filtering** | ✅ | By type, category, date range, and account |
| **Guest Login** | ✅ | One-click demo account with pre-seeded data — no registration required |
| **Frontend Dashboard** | ✅ | Full React + Tailwind dashboard with charts, role-aware UI, and admin panel |
| **AI Receipt Scanning** | ✅ | Google Gemini 1.5 Flash parses receipt images to auto-fill transaction forms |
| **Budget Alerts** | ✅ | Inngest cron jobs send email alerts when spending reaches 80% of budget |
| **Security Headers** | ✅ | Helmet.js for HTTP security headers |
| **Dark/Light Mode** | ✅ | Fully themed UI with persistent preference |

---

## 🧪 Testing the RBAC

### Quick Test Flow

You can verify role-based access control using the seeded demo accounts:

1. **Login as Admin** (`admin@zorvyn.com` / `admin123`)
   - ✅ Can see dashboard, accounts, transactions, admin panel
   - ✅ Can create / edit / delete transactions
   - ✅ Can manage other users' roles and status
   - ✅ Has "Add Transaction" and "Admin Panel" in navigation

2. **Login as Analyst** (`analyst@zorvyn.com` / `analyst123`)
   - ✅ Can see dashboard summary and charts
   - ✅ Can view transactions (read-only)
   - ❌ Cannot create / edit / delete transactions → `403 Forbidden`
   - ❌ No "Admin Panel" in navigation

3. **Login as Viewer** (`viewer@zorvyn.com` / `viewer123`)
   - ✅ Can see dashboard summary and account balances
   - ❌ Cannot view individual transactions → `403 Forbidden`
   - ❌ Cannot create / edit / delete anything → `403 Forbidden`
   - ❌ No "Add Transaction" or "Admin Panel" in navigation

4. **Guest Login** (click "🚀 Explore as Guest")
   - Logs in as the pre-seeded admin demo account
   - Full dashboard access with sample financial data

### Testing Access Control via API

```bash
# Login as viewer
curl -c cookies.txt -X POST https://zorvyn-finance-assignment.onrender.com/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "viewer@zorvyn.com", "password": "viewer123"}'

# Try to create a transaction (should fail with 403)
curl -b cookies.txt -X POST https://zorvyn-finance-assignment.onrender.com/api/v1/transaction \
  -H "Content-Type: application/json" \
  -d '{"type": "EXPENSE", "amount": 100, "category": "food", "date": "2026-04-01T00:00:00Z", "accountId": "..."}'

# Response: {"success": false, "message": "Access denied. Required role(s): admin"}
```

---

## ⚠️ Assumptions & Trade-offs

1. **Single-user budget model**: Each user has at most one budget (enforced by unique index on `userId`). A multi-budget system (per account or per category) would be more flexible but adds complexity beyond the assignment scope.

2. **Viewer access restricted from records**: Viewers can see the dashboard summary (aggregate data) but cannot list individual transactions. This is a deliberate security decision — summary data reveals totals but not individual financial entries.

3. **Guest login uses pre-seeded data**: The guest demo account (`guest@zorvyn.demo`) uses pre-seeded sample data for demonstration purposes. In a production system, this would be isolated or strictly read-only.

4. **Single currency (INR)**: All amounts are in INR (₹). Currency is not stored per-transaction. A production system would need multi-currency support with exchange rates.

5. **Email verification is optional for local dev**: The app can work without email service configured. The seed script creates pre-verified users. For manual testing, set `isVerified: true` directly in the database.

6. **Arcjet and Inngest are optional**: Rate limiting (Arcjet) and background jobs (Inngest) require API keys. The application works without them — the middleware gracefully degrades when keys are missing.

7. **Render cold starts**: The backend is deployed on Render's free tier, which spins down after 15 minutes of inactivity. The first request after inactivity may take ~30 seconds.

---

## 👨‍💻 Author

**Abhigyan Srivastava**  
[LinkedIn](https://www.linkedin.com/in/abhigyan-srivastava-19609827b) · [GitHub](https://github.com/abhi-14gyan)

---

## 📄 License

MIT License — feel free to use for learning and personal projects.
