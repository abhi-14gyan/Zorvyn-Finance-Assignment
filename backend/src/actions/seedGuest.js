require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");

const GUEST_EMAIL = "guest@finlock.demo";
const GUEST_PASSWORD = "GuestDemo123!";
const GUEST_USERNAME = "Demo User";

const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [45000, 65000] },
    { name: "freelance", range: [5000, 15000] },
    { name: "investments", range: [2000, 8000] },
    { name: "other-income", range: [1000, 5000] },
  ],
  EXPENSE: [
    { name: "housing", range: [8000, 15000] },
    { name: "transportation", range: [1500, 4000] },
    { name: "groceries", range: [2000, 5000] },
    { name: "utilities", range: [800, 2500] },
    { name: "entertainment", range: [500, 3000] },
    { name: "food", range: [1000, 4000] },
    { name: "shopping", range: [1500, 6000] },
    { name: "healthcare", range: [500, 3000] },
    { name: "education", range: [1000, 5000] },
    { name: "travel", range: [2000, 8000] },
  ],
};

function getRandomAmount(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

function getRandomDescription(type, category) {
  const descriptions = {
    salary: ["Monthly salary", "Salary payment", "Pay received"],
    freelance: ["Freelance project", "Client payment", "Contract work"],
    investments: ["Dividend income", "Stock returns", "Mutual fund payout"],
    "other-income": ["Cashback reward", "Gift received", "Bonus income"],
    housing: ["Monthly rent", "Rent payment", "Housing EMI"],
    transportation: ["Uber ride", "Fuel expense", "Metro card recharge", "Auto fare"],
    groceries: ["BigBasket order", "Grocery shopping", "Zepto delivery", "DMart purchase"],
    utilities: ["Electricity bill", "Water bill", "WiFi subscription", "Mobile recharge"],
    entertainment: ["Netflix subscription", "Movie tickets", "Spotify premium", "Gaming"],
    food: ["Swiggy order", "Zomato delivery", "Restaurant dinner", "Cafe visit"],
    shopping: ["Amazon order", "Flipkart purchase", "Clothing", "Electronics"],
    healthcare: ["Doctor consultation", "Medicine purchase", "Lab test", "Health insurance"],
    education: ["Course subscription", "Book purchase", "Udemy course", "Exam fees"],
    travel: ["Flight booking", "Hotel stay", "Train ticket", "Trip expenses"],
  };
  const options = descriptions[category] || [`${type === "INCOME" ? "Received" : "Paid for"} ${category}`];
  return options[Math.floor(Math.random() * options.length)];
}

async function seedGuest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("📦 Connected to MongoDB");

    // 1. Delete existing guest data
    const existingUser = await User.findOne({ email: GUEST_EMAIL });
    if (existingUser) {
      await Transaction.deleteMany({ userId: existingUser._id });
      await Account.deleteMany({ userId: existingUser._id });
      await Budget.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log("🗑️  Cleared existing guest data");
    }

    // 2. Create guest user
    const guestUser = await User.create({
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD,
      username: GUEST_USERNAME,
      isVerified: true,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1717398651/default-avatar.png",
    });
    console.log("👤 Guest user created:", guestUser._id.toString());

    // 3. Create accounts
    const savingsAccount = await Account.create({
      name: "Main Savings",
      type: "SAVINGS",
      balance: mongoose.Types.Decimal128.fromString("0"),
      isDefault: true,
      userId: guestUser._id,
    });

    const currentAccount = await Account.create({
      name: "Current Account",
      type: "CURRENT",
      balance: mongoose.Types.Decimal128.fromString("0"),
      isDefault: false,
      userId: guestUser._id,
    });
    console.log("🏦 Accounts created");

    // 4. Generate transactions for the last 30 days
    const transactions = [];
    let savingsBalance = 50000; // Starting balance
    let currentBalance = 25000;
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 1-4 transactions per day
      const txCount = Math.floor(Math.random() * 4) + 1;

      for (let j = 0; j < txCount; j++) {
        const type = Math.random() < 0.35 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        const description = getRandomDescription(type, category);

        // Alternate between accounts (70% savings, 30% current)
        const useCurrentAccount = Math.random() < 0.3;
        const account = useCurrentAccount ? currentAccount : savingsAccount;

        const transaction = {
          type,
          amount: mongoose.Types.Decimal128.fromString(amount.toString()),
          description,
          date,
          category,
          status: "COMPLETED",
          userId: guestUser._id,
          accountId: account._id,
          isRecurring: Math.random() < 0.1,
          recurringInterval: Math.random() < 0.1 ? "MONTHLY" : undefined,
        };

        transactions.push(transaction);

        if (useCurrentAccount) {
          currentBalance += type === "INCOME" ? amount : -amount;
        } else {
          savingsBalance += type === "INCOME" ? amount : -amount;
        }
      }
    }

    await Transaction.insertMany(transactions);
    console.log(`💰 ${transactions.length} transactions created`);

    // 5. Update account balances
    await Account.findByIdAndUpdate(savingsAccount._id, {
      balance: mongoose.Types.Decimal128.fromString(Math.max(savingsBalance, 1000).toFixed(2)),
    });
    await Account.findByIdAndUpdate(currentAccount._id, {
      balance: mongoose.Types.Decimal128.fromString(Math.max(currentBalance, 500).toFixed(2)),
    });
    console.log("📊 Account balances updated");

    // 6. Create budget
    await Budget.create({
      amount: mongoose.Types.Decimal128.fromString("50000"),
      userId: guestUser._id,
    });
    console.log("📋 Budget created");

    console.log("\n✅ Guest account seeded successfully!");
    console.log(`   Email: ${GUEST_EMAIL}`);
    console.log(`   Password: ${GUEST_PASSWORD}`);
    console.log(`   User ID: ${guestUser._id}`);
    console.log(`   Savings Account: ${savingsAccount._id}`);
    console.log(`   Current Account: ${currentAccount._id}`);
    console.log(`   Transactions: ${transactions.length}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📦 Disconnected from MongoDB");
  }
}

seedGuest();
