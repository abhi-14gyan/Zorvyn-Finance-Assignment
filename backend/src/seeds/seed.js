/**
 * Seed script for Zorvyn Finance Backend
 * Creates demo users with different roles and sample financial data
 *
 * Usage: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../db/index.js");
const User = require("../models/user.model.js");
const Account = require("../models/account.model.js");
const Transaction = require("../models/transaction.model.js");
const Budget = require("../models/budget.model.js");

const SEED_USERS = [
  {
    username: "Admin User",
    email: "admin@zorvyn.com",
    password: "admin123",
    role: "admin",
    status: "active",
    isVerified: true,
  },
  {
    username: "Analyst User",
    email: "analyst@zorvyn.com",
    password: "analyst123",
    role: "analyst",
    status: "active",
    isVerified: true,
  },
  {
    username: "Viewer User",
    email: "viewer@zorvyn.com",
    password: "viewer123",
    role: "viewer",
    status: "active",
    isVerified: true,
  },
  {
    username: "Guest Demo",
    email: "guest@zorvyn.demo",
    password: "guest123",
    role: "admin",
    status: "active",
    isVerified: true,
  },
];

const SAMPLE_CATEGORIES_INCOME = ["salary", "freelance", "investments", "rental", "other-income"];
const SAMPLE_CATEGORIES_EXPENSE = [
  "housing", "transportation", "groceries", "utilities",
  "entertainment", "food", "shopping", "healthcare",
  "education", "personal", "travel", "insurance",
  "gifts", "bills", "other-expense",
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(monthsBack) {
  const date = new Date();
  date.setMonth(date.getMonth() - Math.floor(Math.random() * monthsBack));
  date.setDate(Math.floor(Math.random() * 28) + 1);
  return date;
}

async function seed() {
  try {
    await connectDB();
    console.log("🌱 Starting seed...\n");

    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create users (Mongoose pre-save hook handles password hashing)
    const createdUsers = [];
    for (const userData of SEED_USERS) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.email} (role: ${user.role})`);
    }

    // Create accounts and transactions for admin and guest users
    const usersWithData = createdUsers.filter(u =>
      ["admin@zorvyn.com", "guest@zorvyn.demo"].includes(u.email)
    );

    for (const user of usersWithData) {
      // Create 2 accounts
      const savingsAccount = await Account.create({
        name: "Primary Savings",
        type: "savings",
        balance: mongoose.Types.Decimal128.fromString("25000.00"),
        isDefault: true,
        userId: user._id,
      });

      const currentAccount = await Account.create({
        name: "Business Current",
        type: "current",
        balance: mongoose.Types.Decimal128.fromString("15000.00"),
        isDefault: false,
        userId: user._id,
      });

      console.log(`🏦 Created accounts for ${user.email}`);

      // Create 30 sample transactions spread across 6 months
      const transactions = [];
      for (let i = 0; i < 30; i++) {
        const isIncome = Math.random() > 0.6; // 40% income, 60% expense
        const account = Math.random() > 0.5 ? savingsAccount : currentAccount;
        const category = isIncome
          ? SAMPLE_CATEGORIES_INCOME[Math.floor(Math.random() * SAMPLE_CATEGORIES_INCOME.length)]
          : SAMPLE_CATEGORIES_EXPENSE[Math.floor(Math.random() * SAMPLE_CATEGORIES_EXPENSE.length)];

        const amount = isIncome ? randomBetween(5000, 50000) : randomBetween(100, 5000);

        transactions.push({
          type: isIncome ? "INCOME" : "EXPENSE",
          amount: mongoose.Types.Decimal128.fromString(amount.toString()),
          description: `${isIncome ? "Income" : "Expense"} - ${category} (#${i + 1})`,
          date: randomDate(6),
          category,
          isRecurring: false,
          status: "COMPLETED",
          userId: user._id,
          accountId: account._id,
        });
      }

      await Transaction.insertMany(transactions);
      console.log(`💰 Created ${transactions.length} transactions for ${user.email}`);

      // Create budget
      await Budget.create({
        amount: mongoose.Types.Decimal128.fromString("30000.00"),
        userId: user._id,
      });
      console.log(`📊 Created budget for ${user.email}`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:   admin@zorvyn.com    / admin123");
    console.log("Analyst: analyst@zorvyn.com  / analyst123");
    console.log("Viewer:  viewer@zorvyn.com   / viewer123");
    console.log("Guest:   (use guest login button)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
