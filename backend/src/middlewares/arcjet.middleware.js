// middlewares/arcjet.middleware.js
const arcjetImport = require("@arcjet/node");
const { shield, detectBot, tokenBucket } = arcjetImport;
const { isSpoofedBot } = require("@arcjet/inspect");

const arcjet = arcjetImport.default;

const aj = arcjet({
  key: process.env.ARCJET_API_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 50, // 10 tokens per hour
      interval: 3600, // 3600 seconds = 1 hour
      capacity: 50,
    }),
  ],
});

// Middleware for rate-limiting + bot detection
const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || req.ip;

    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too Many Requests. Try again Later" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ error: "Bots not allowed" });
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({ error: "Spoofed bot detected" });
    }

    next();
  } catch (err) {
    console.error("Arcjet error:", err);
    res.status(500).json({ error: "Arcjet internal error" });
  }
};

module.exports = { rateLimiter };
