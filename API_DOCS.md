# Zorvyn Finance — API Documentation

> Base URL: `http://localhost:4000/api/v1`

All authenticated endpoints require a JWT access token, sent automatically as an httpOnly cookie or via `Authorization: Bearer <token>` header.

---

## 🔐 Authentication

### Register
```
POST /users/register
```
**Body:**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** `201 Created` — sends verification email, creates user with `viewer` role.

---

### Login
```
POST /users/login
```
**Body:**
```json
{
  "email": "admin@zorvyn.com",
  "password": "admin123"
}
```
**Response:** `200 OK` — sets `accessToken` and `refreshToken` cookies.
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@zorvyn.com",
      "username": "Admin User",
      "role": "admin",
      "status": "active",
      "isVerified": true
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "message": "User logged in successfully"
}
```

---

### Guest Login
```
POST /users/guest-login
```
**Body:** None  
**Response:** `200 OK` — logs in as demo user.

---

### Logout
```
POST /users/logout
```
**Auth:** Required  
**Response:** `200 OK` — clears cookies, removes refresh token from DB.

---

### Refresh Token
```
POST /users/refresh-token
```
**Response:** `200 OK` — new access + refresh tokens set.

---

### Verify Email
```
GET /users/verify-email?token=<raw_token>&email=<email>
```
**Response:** `200 OK`

---

### Resend Verification
```
POST /users/resend-verification
```
**Body:** `{ "email": "user@example.com" }`  
**Response:** `200 OK` — rate limited to 1 per 2 minutes.

---

### Get Current User
```
GET /users/me
```
**Auth:** Required  
**Response:** `200 OK` — returns logged-in user's profile.

---

### Google OAuth
```
GET /auth/google          → Redirects to Google consent screen
GET /auth/google/callback → Handles OAuth callback, sets cookies, redirects to frontend
```

---

## 👥 User Management (Admin Only)

### List All Users
```
GET /users?role=analyst&status=active&search=john
```
**Auth:** Admin  
**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `role` | string | Filter by role: `viewer`, `analyst`, `admin` |
| `status` | string | Filter by status: `active`, `inactive` |
| `search` | string | Search by username or email |

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "username": "Analyst User",
      "email": "analyst@zorvyn.com",
      "role": "analyst",
      "status": "active",
      "isVerified": true,
      "createdAt": "2026-04-01T..."
    }
  ],
  "message": "Users fetched successfully"
}
```

---

### Update User Role
```
PATCH /users/:id/role
```
**Auth:** Admin  
**Body:**
```json
{ "role": "analyst" }
```
**Validation:** Role must be `viewer`, `analyst`, or `admin`.  
**Restriction:** Cannot change your own role.  
**Response:** `200 OK`

---

### Update User Status
```
PATCH /users/:id/status
```
**Auth:** Admin  
**Body:**
```json
{ "status": "inactive" }
```
**Validation:** Status must be `active` or `inactive`.  
**Restriction:** Cannot deactivate yourself.  
**Response:** `200 OK`

---

## 💰 Transactions

### Create Transaction
```
POST /transaction
```
**Auth:** Admin  
**Body:**
```json
{
  "type": "EXPENSE",
  "amount": 1500.50,
  "description": "Grocery shopping",
  "date": "2026-04-01T10:00:00Z",
  "category": "groceries",
  "accountId": "6641a1b2c3d4e5f6a7b8c9d0",
  "isRecurring": false
}
```
**Validation:**
- `type`: required, must be `INCOME` or `EXPENSE`
- `amount`: required, must be positive number
- `date`: required, ISO format
- `category`: required
- `accountId`: required, valid ObjectId
- `isRecurring`: optional, if `true` then `recurringInterval` required

**Response:** `201 Created`

---

### List Transactions
```
GET /transaction?type=EXPENSE&category=groceries&startDate=2026-01-01&endDate=2026-03-31&search=grocery&page=1&limit=20
```
**Auth:** Analyst, Admin  
**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | `INCOME` or `EXPENSE` |
| `category` | string | — | Filter by category |
| `accountId` | string | — | Filter by account |
| `startDate` | string | — | ISO date, inclusive |
| `endDate` | string | — | ISO date, inclusive |
| `search` | string | — | Search in description |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Get Transaction
```
GET /transaction/:id
```
**Auth:** Analyst, Admin  
**Response:** `200 OK`

---

### Update Transaction
```
PUT /transaction/:id
```
**Auth:** Admin  
**Body:** Any subset of create fields  
**Response:** `200 OK`

---

### Delete Transaction
```
DELETE /transaction/:id
```
**Auth:** Admin  
**Response:** `200 OK` — atomically reverses balance change.

---

### Scan Receipt (AI)
```
POST /transaction/scan-receipt
```
**Auth:** Admin  
**Body:** `multipart/form-data` with `file` field (image)  
**Response:** `200 OK` — returns parsed receipt data from Gemini AI.

---

## 🏦 Accounts

### List User Accounts
```
GET /dashboard/accounts
```
**Auth:** All roles  
**Response:** `200 OK`

---

### Create Account
```
POST /dashboard/accounts
```
**Auth:** Admin  
**Body:**
```json
{
  "name": "HDFC Savings",
  "type": "savings",
  "balance": 25000,
  "isDefault": true
}
```
**Validation:**
- `name`: required, 1-100 characters
- `type`: required, one of `savings`, `current`, `investment`, `credit`, `other`
- `balance`: required, valid number
- `isDefault`: optional, boolean

**Response:** `201 Created`

---

### Delete Account
```
DELETE /dashboard/accounts/:accountId
```
**Auth:** Admin  
**Response:** `200 OK` — also deletes all associated transactions.

---

### Get Account with Transactions
```
GET /account/:accountId
```
**Auth:** Analyst, Admin  
**Response:** `200 OK` — returns account details + all its transactions.

---

### Update Default Account
```
PUT /account/default/:accountId
```
**Auth:** Admin  
**Response:** `200 OK`

---

### Bulk Delete Transactions
```
DELETE /account/transactions/bulk-delete
```
**Auth:** Admin  
**Body:** `{ "transactionIds": ["id1", "id2", ...] }`  
**Response:** `200 OK`

---

## 📊 Dashboard

### Dashboard Summary
```
GET /dashboard/summary
```
**Auth:** All roles  
**Response:** `200 OK`
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

---

### Dashboard Transactions (Raw)
```
GET /dashboard/transactions
```
**Auth:** All roles  
**Response:** `200 OK` — returns all transactions for the logged-in user, sorted by date.

---

## 💼 Budget

### Get Current Budget
```
GET /budget
```
**Auth:** All roles  
**Response:** `200 OK`
```json
{
  "budget": { "amount": 30000, "userId": "...", "lastAlertSent": null },
  "currentExpenses": 18500
}
```

---

### Update Budget
```
POST /budget
```
**Auth:** Admin  
**Body:** `{ "amount": 35000 }`  
**Response:** `200 OK`

---

## 🏥 Health Check

```
GET /api/health
```
**Auth:** None  
**Response:** `200 OK` — `{ "status": "ok", "timestamp": "..." }`

---

## ❌ Error Responses

All errors return structured JSON:

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

### Common Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (wrong role or inactive account) |
| `404` | Not Found |
| `409` | Conflict (duplicate email) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |
