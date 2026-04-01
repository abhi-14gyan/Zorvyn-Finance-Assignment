require('dotenv').config();
require('./config/passport');
const express = require('express');
const { serve } = require("inngest/express");
const connectDB = require('./db/index.js');
const { app } = require('./app.js');

// Inngest setup
const { inngest } = require('./inngest.js');
const { checkBudgetAlert, generateMonthlyReports } = require('./actions/budgetAlert.js'); // You can add more functions here

// Register the Inngest route before the app starts
app.use('/api/inngest', serve({ client: inngest, functions: [checkBudgetAlert, generateMonthlyReports] }));

// Start your server after DB connects
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("connectDB Connection Failed!!", error);
  });
