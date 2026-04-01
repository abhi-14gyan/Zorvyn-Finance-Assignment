// emails/budgetAlertHtml.js

function budgetAlertHtml({ userName = "", data = {}, type = "budget-alert" }) {

  if (type == "monthly-report") {
    return `
  <html>
    <body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px 0;">
      <div style="background: #fff; border-radius: 10px; padding: 40px; max-width: 600px; margin: auto; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        <h2 style="text-align: center; color: #1e293b;">📊 Monthly Financial Report</h2>
        <p style="color: #334155;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #334155;">Here’s your financial summary for <strong>${data?.month}</strong>:</p>

        <!-- Main Stats -->
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p><strong>💰 Total Income:</strong> ₹ ${data?.stats.totalIncome}</p>
          <p><strong>🧾 Total Expenses:</strong> ₹ ${data?.stats.totalExpenses}</p>
          <p><strong>📈 Net:</strong> ₹ ${data?.stats.totalIncome - data?.stats.totalExpenses}</p>
        </div>

        <!-- Category Breakdown -->
        ${data?.stats?.byCategory
        ? `
            <div style="margin-top: 24px;">
              <h3 style="color: #1e293b; font-size: 18px;">💼 Expenses by Category</h3>
              <ul style="list-style-type: none; padding-left: 0; color: #334155; margin-top: 10px;">
                ${Object.entries(data?.stats.byCategory)
          .map(
            ([category, amount]) =>
              `<li style="margin-bottom: 4px;"><strong>${category}:</strong> ₹ ${amount}</li>`
          )
          .join("")}
              </ul>
            </div>
          `
        : ""
      }

        <!-- AI Insights -->
        ${data?.insights
        ? `
            <div style="margin-top: 24px;">
              <h3 style="color: #1e293b; font-size: 18px;">💡 Finlock Insights</h3>
              <ul style="list-style-type: disc; color: #334155; padding-left: 20px; margin-top: 10px;">
                ${data.insights
          .map((insight) => `<li style="margin-bottom: 6px;">${insight}</li>`)
          .join("")}
              </ul>
            </div>
          `
        : ""
      }

        <p style="margin-top: 24px;">Thank you for using <strong>Finlock</strong>. Keep tracking your finances for better financial health!</p>
        <a href="http://localhost:3001/dashboard" style="display: inline-block; margin-top: 24px; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center;">You're receiving this email because you're subscribed to financial insights on Finlock.<br>© ${new Date().getFullYear()} Finlock</p>
      </div>
    </body>
  </html>
`;

  }

  if (type === "budget-alert") {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px 0;">
        <div style="background: #fff; border-radius: 10px; padding: 40px; max-width: 600px; margin: auto; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <h2 style="text-align: center; color: #1e293b;">⚠ Budget Alert from Finlock</h2>
          <p style="color: #334155;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #334155;">You've used <strong>${data?.percentageUsed}%</strong> of your monthly budget. Here's a breakdown:</p>
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 24px;">
            <p><strong>💰 Budget Limit:</strong> ₹ ${data?.budgetAmount}</p>
            <p><strong>🧾 Spent So Far:</strong> ₹ ${data?.totalExpenses}</p>
            <p><strong>📉 Remaining:</strong> ₹ ${data?.budgetAmount - data?.totalExpenses}</p>
          </div>
          <p style="margin-top: 20px;">To maintain your financial goals, we recommend reviewing your expenses and adjusting accordingly.</p>
          <a href="http://localhost:3001/dashboard" style="display: inline-block; margin-top: 24px; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View My Dashboard</a>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center;">You're receiving this email because you have an active budget set on Finlock.<br>© ${new Date().getFullYear()} Finlock</p>
        </div>
      </body>
    </html>
  `;
  }
}

module.exports = { budgetAlertHtml };
