// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:4000",
      changeOrigin: true,
      cookieDomainRewrite: "localhost", // ✅ needed for cookies to work
      secure: false, // in case you're using self-signed certs for HTTPS
    })
  );
};
