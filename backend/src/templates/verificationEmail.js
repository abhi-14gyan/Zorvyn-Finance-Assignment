/**
 * Generates a styled HTML email for email verification.
 * Matches Finlock's green brand palette.
 */
function getVerificationEmailHtml({ userName, verificationUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email — Finlock</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff; border-radius:12px; padding:48px 40px; max-width:600px; box-shadow:0 8px 30px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          
          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="width:56px; height:56px; background:linear-gradient(135deg,#10B981,#4EDEA3); border-radius:14px; display:inline-flex; align-items:center; justify-content:center;">
                <span style="font-size:28px; font-weight:bold; color:#003824;">F</span>
              </div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:26px; font-weight:700; color:#1e293b;">Verify Your Email</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:16px;">
              <p style="margin:0; font-size:16px; color:#334155; line-height:1.6;">
                Hello <strong>${userName}</strong>,
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:16px; color:#334155; line-height:1.6;">
                Thank you for signing up for <strong>Finlock</strong>! Please click the button below to verify your email address and activate your account.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${verificationUrl}"
                style="display:inline-block; background:linear-gradient(135deg,#10B981,#4EDEA3); color:#003824; font-size:16px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px; box-shadow:0 4px 14px rgba(16,185,129,0.3);">
                ✅ Verify My Email
              </a>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0; font-size:13px; color:#10B981; word-break:break-all;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:20px; background-color:#f9fafb; border-radius:8px; border:1px solid #e2e8f0;">
              <p style="margin:0; font-size:14px; color:#64748b; line-height:1.5;">
                ⏰ This verification link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the sign-in page.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                If you didn't create a Finlock account, you can safely ignore this email.
                <br/>
                © ${new Date().getFullYear()} Finlock | Your Premium Financial Companion
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = { getVerificationEmailHtml };
