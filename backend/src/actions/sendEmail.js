const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async function ({ to, subject, html }) {
  const mailOptions = {
    from: `Finlock <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    console.log("📧 Sending email to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
