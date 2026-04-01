const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const  User  = require("../models/user.model");

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://finlock-backend-oo7z.onrender.com/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
          imageUrl: profile.photos[0].value,
          isVerified: true, // Google has already verified the email
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  })
);
