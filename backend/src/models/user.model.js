const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: "https://res.cloudinary.com/demo/image/upload/v1717398651/default-avatar.png"
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  refreshToken: {
    type: String
  },
  // ─── RBAC fields ───
  role: {
    type: String,
    enum: ['viewer', 'analyst', 'admin'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // ─── Email verification ───
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpiry: {
    type: Date,
    default: null
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

module.exports = mongoose.model('User', userSchema);
