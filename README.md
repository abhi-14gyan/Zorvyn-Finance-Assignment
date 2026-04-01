# 🏦 Zorvyn Finance — Full-Stack Finance Dashboard with RBAC

> A role-based finance data processing and access control system built with the MERN stack.

**Live Demo:** [Coming Soon]  
**API Documentation:** [API_DOCS.md](./API_DOCS.md)

---

## 📋 Assignment Mapping

This project was built as a submission for the **Finance Data Processing and Access Control Backend** assignment. Below is how each core requirement is implemented:

| # | Requirement | Implementation | Location |
|---|---|---|---|
| 1 | **User & Role Management** | Users with `role` (viewer/analyst/admin) and `status` (active/inactive) fields. Admin endpoints for managing users. | `user.model.js`, `user.controller.js`, `authorize.middleware.js` |
| 2 | **Financial Records Management** | Full CRUD for transactions with amount, type, category, date, description. Filtering by date range, category, type. Pagination. | `transactions.controller.js`, `transaction.routes.js` |
| 3 | **Dashboard Summary APIs** | MongoDB aggregation pipeline returning total income/expenses, net balance, category breakdown, recent transactions, monthly trends. | `dashboard.controller.js` → `getDashboardSummary` |
| 4 | **Access Control Logic** | `authorize(...roles)` middleware enforces role-based route access. Viewer = read-only dashboard, Analyst = read records, Admin = full CRUD + user management. | `authorize.middleware.js`, all route files |
| 5 | **Validation & Error Handling** | Joi schemas for all write endpoints. Global error handler returns structured JSON. Custom `ApiError` class with proper HTTP status codes. | `validations/`, `validate.middleware.js`, `app.js` |
| 6 | **Data Persistence** | MongoDB Atlas with Mongoose ODM. Decimal128 for financial precision. MongoDB sessions for atomic transaction + balance updates. | `models/`, controllers |

### Optional Enhancements Implemented

| Enhancement | Status | Details |
|---|---|---|
| Token-based Auth | ✅ | JWT access + refresh tokens in httpOnly cookies |
| Google OAuth | ✅ | Passport.js Google strategy (optional — works without credentials) |
| Email Verification | ✅ | Crypto tokens + Nodemailer verification flow |
| Pagination | ✅ | `page` and `limit` query params on transactions (default: 20, max: 100) |
| Search Support | ✅ | `?search=keyword` on transaction descriptions |
| Rate Limiting | ✅ | Arcjet token-bucket rate limiter on write endpoints |
| Guest Login | ✅ | One-click demo account access |
| Filtering | ✅ | By type, category, date range, account |
| Frontend Dashboard | ✅ | React + Tailwind with role-aware UI and admin panel |
| AI Receipt Scanning | ✅ | Google Gemini 1.5 Flash parses receipt images |
| Budget Alerts | ✅ | Inngest cron jobs send email alerts at 80% budget usage |
| Security Headers | ✅ | Helmet.js for HTTP security headers |

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js 5, MongoDB, Mongoose |
| **Frontend** | React 18, Tailwind CSS, Recharts, React Router v6 |
| **Auth** | JWT (Access + Refresh tokens), Passport.js (Google OAuth) |
| **Validation** | Joi schema validation |
| **AI** | Google Gemini 1.5 Flash (receipt scanning) |
| **Email** | Nodemailer (verification emails, budget alerts) |
| **Background Jobs** | Inngest (cron-based budget monitoring) |
| **Security** | Arcjet (rate limiting), Helmet.js, bcryptjs |
| **Database** | MongoDB Atlas (Decimal128 for financial precision) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  Dashboard │ Admin Panel │ Transactions │ Accounts       │
└─────────┬───────────────────────────────────────────────┘
          │ HTTP (JWT cookies)
┌─────────▼───────────────────────────────────────────────┐
│                  Express.js Backend                      │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ verifyJWT │→│ authorize │→│ validate(schema)      │  │
│  │ Middleware│  │ (roles)   │  │ Joi validation        │  │
│  └──────────┘  └───────────┘  └──────────────────────┘  │
│                                                          │
│  Controllers: User │ Transaction │ Dashboard │ Budget    │
│                         ↕ MongoDB Sessions               │
│  ┌───────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Mongoose)              │   │
│  │  Users │ Accounts │ Transactions │ Budgets         │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Role-Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View dashboard summary | ✅ | ✅ | ✅ |
| View accounts list | ✅ | ✅ | ✅ |
| View budget | ✅ | ✅ | ✅ |
| List/view transactions | ❌ | ✅ | ✅ |
| View account details | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ❌ | ✅ |
| Update transactions | ❌ | ❌ | ✅ |
| Delete transactions | ❌ | ❌ | ✅ |
| Create/delete accounts | ❌ | ❌ | ✅ |
| Update budget | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Activate/deactivate users | ❌ | ❌ | ✅ |

---

## 📂 Project Structure

```
zorvyn/
├── backend/
│   ├── src/
│   │   ├── config/              # Passport Google strategy
│   │   ├── controllers/         # Business logic
│   │   │   ├── user.controller.js       # Auth + admin user management
│   │   │   ├── transactions.controller.js # CRUD + filters + pagination
│   │   │   ├── dashboard.controller.js  # Summary aggregation pipeline
│   │   │   ├── account.controller.js    # Account operations
│   │   │   └── budgetController.js      # Budget management
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # JWT verification
│   │   │   ├── authorize.middleware.js   # Role-based access control
│   │   │   ├── validate.middleware.js    # Joi validation
│   │   │   ├── arcjet.middleware.js      # Rate limiting
│   │   │   └── multer.middleware.js      # File uploads
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── user.model.js            # + role, status fields
│   │   │   ├── account.model.js
│   │   │   ├── transaction.model.js
│   │   │   └── budget.model.js
│   │   ├── routes/              # Express routers with RBAC guards
│   │   ├── validations/         # Joi schemas
│   │   │   ├── user.validation.js
│   │   │   ├── transaction.validation.js
│   │   │   └── account.validation.js
│   │   ├── seeds/
│   │   │   └── seed.js          # Creates demo users + sample data
│   │   ├── utils/               # ApiError, ApiResponse, asyncHandler
│   │   ├── app.js               # Express setup + global error handler
│   │   └── index.js             # Server entry point
│   ├── .env.example
│   └── package.json
│
└── Frontend/finlock/
    └── src/
        ├── pages/
        │   ├── dashboard.jsx        # Role-aware dashboard
        │   ├── AdminPanel.jsx       # Admin user management
        │   ├── account.jsx
        │   ├── transaction.jsx
        │   └── ...
        ├── components/
        │   ├── AppLayout.jsx        # Sidebar with role badge + admin nav
        │   └── ...
        └── context/
            ├── AuthContext.js
            └── ThemeContext.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zorvyn-finance.git
cd zorvyn-finance
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, etc.
```

### 3. Seed the Database

```bash
npm run seed
```

This creates demo users with sample data:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@zorvyn.com` | `admin123` |
| Analyst | `analyst@zorvyn.com` | `analyst123` |
| Viewer | `viewer@zorvyn.com` | `viewer123` |
| Guest | Use guest login button | — |

### 4. Start the Backend

```bash
npm run dev    # Development (with nodemon)
npm start      # Production
```

Backend runs on `http://localhost:4000`

### 5. Frontend Setup

```bash
cd ../Frontend/finlock
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## 🔐 Authentication Flow

1. **Register** → Creates user with `viewer` role → Sends verification email
2. **Verify Email** → Clicks link in email → Account activated
3. **Login** → JWT access token (short-lived) + refresh token (long-lived) set as httpOnly cookies
4. **Refresh** → Automatic token refresh via `/api/v1/users/refresh-token`
5. **Google OAuth** → Optional alternative login → Auto-verified, `viewer` role

### Token Strategy

| Token | Storage | Expiry | Purpose |
|---|---|---|---|
| Access Token | httpOnly cookie | 1 day | API authentication |
| Refresh Token | httpOnly cookie + DB | 10 days | Token renewal |

---

## 💰 Data Modeling

### Why Decimal128 for Money?

Standard JavaScript `Number` (IEEE 754 float) loses precision with decimal arithmetic:
```js
0.1 + 0.2 === 0.30000000000000004 // true — this is a bug in finance
```

MongoDB's `Decimal128` provides exact decimal representation, essential for financial calculations. Every `amount` and `balance` field uses `Decimal128`.

### Atomic Transactions

Every transaction creation/update/deletion uses **MongoDB sessions** to atomically update both the transaction record AND the account balance. If either operation fails, both are rolled back.

```js
const session = await Transaction.startSession();
session.startTransaction();
try {
  // Create transaction
  // Update account balance
  await session.commitTransaction();
} catch {
  await session.abortTransaction();  // Both operations rolled back
}
```

---

## 🛡️ Access Control Implementation

### Middleware Chain

Every protected route passes through this middleware chain:

```
Request → verifyJWT → checkActiveStatus → authorize(roles) → validate(schema) → Controller
```

1. **verifyJWT**: Extracts JWT from cookie/header, verifies, loads user
2. **checkActiveStatus**: Blocks inactive users with 403
3. **authorize**: Checks `req.user.role` against allowed roles
4. **validate**: Joi schema validation on request body

### Example Route

```js
// Only admin can create transactions
router.post("/",
  verifyJWT,              // Must be logged in
  checkActiveStatus,       // Must be active
  authorize("admin"),      // Must be admin
  validate(createTransactionSchema),  // Request body must be valid
  createTransaction        // Business logic
);
```

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
    "recentTransactions": [...],
    "monthlyTrends": [
      { "month": "2025-11", "income": 25000, "expenses": 14000 },
      { "month": "2025-12", "income": 25000, "expenses": 13500 }
    ],
    "accountCount": 2
  }
}
```

---

## ⚠️ Assumptions & Trade-offs

1. **Single-user budget**: Each user has at most one budget (enforced by unique index on `userId`). A multi-budget system (per account or per category) would be more flexible but adds complexity beyond the assignment scope.

2. **Viewer access to transactions**: Viewers can see the dashboard summary but cannot list individual transactions. This is a deliberate security decision — summary data reveals totals but not individual entries.

3. **Guest login uses pre-seeded data**: The guest demo account (`guest@zorvyn.demo`) uses pre-seeded sample data. In production, you'd want this isolated or read-only.

4. **Currency**: All amounts are in INR (₹). Currency is not stored per-transaction — a production system would need multi-currency support.

5. **Email verification optional**: The app can work without email service configured. Just set `isVerified: true` manually in the database or use the seed script.

6. **Inngest/Arcjet optional**: Background jobs (Inngest) and rate limiting (Arcjet) require API keys. The app works without them — those middleware gracefully degrade.

---

## 🧪 Testing the RBAC

### Quick Test Flow

1. Run `npm run seed` to create demo users
2. Login as **admin** (`admin@zorvyn.com` / `admin123`)
   - ✅ Can see dashboard, accounts, transactions, admin panel
   - ✅ Can create/edit/delete transactions
   - ✅ Can manage other users' roles and status
3. Login as **analyst** (`analyst@zorvyn.com` / `analyst123`)
   - ✅ Can see dashboard summary
   - ✅ Can view transactions (read-only)
   - ❌ Cannot create/edit/delete transactions (403)
   - ❌ Cannot access admin panel
4. Login as **viewer** (`viewer@zorvyn.com` / `viewer123`)
   - ✅ Can see dashboard summary and accounts
   - ❌ Cannot view individual transactions (403)
   - ❌ Cannot create/edit/delete anything (403)
   - ❌ No "Add Transaction" or "Admin Panel" in navigation

---

## 👨‍💻 Author

**Abhigyan Srivastava**  
[LinkedIn](https://www.linkedin.com/in/abhigyan-srivastava-19609827b)

---

## 📄 License

MIT License — feel free to use for learning and personal projects.
