// src/actions/run.js
const { checkBudgetAlert, generateMonthlyReports } = require("./budgetAlert");
module.exports = {
  functions: [checkBudgetAlert,
    generateMonthlyReports
  ],
};
