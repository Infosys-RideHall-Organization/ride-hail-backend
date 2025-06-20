export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #00a5c3, #31c6e2);
      color: white;
      padding: 25px;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      color: #333;
      text-align: left;
      line-height: 1.6;
    }
    .code-box {
      background: #00a5c3;
      color: white;
      font-size: 24px; /* Reduced size */
      font-weight: bold;
      letter-spacing: 4px;
      padding: 10px 20px;
      display: inline-block;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #777;
      padding: 15px;
      background: #f9f9f9;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Verify Your Email</div>
    <div class="content">
      <p>Hello,</p>
      <p>Thanks for signing up for RideHail! Your verification code is:</p>
      <div style="text-align: center;">
        <div class="code-box">{verificationCode}</div>
      </div>
      <p style="text-align: center;">Enter this code in the app to verify your account.</p>
      <p style="text-align: center; color: #777;">Code expires in 15 minutes for your security.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <p style="margin-top: 25px;">Best regards,<br><strong>RideHail</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} RideHail</p>
    </div>
  </div>
</body>
</html>
`;

export const VERIFICATION_EMAIL_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to RideHail</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      background-color: #ffffff;
      margin: 40px auto;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #00a5c3, #31c6e2);
      color: white;
      padding: 35px;
      font-size: 26px;
      text-align: center;
    }
    .content {
      padding: 30px;
      color: #333;
      font-size: 16px;
    }
    .welcome-box {
      background-color: #00a5c3;
      color: white;
      font-size: 22px;
      padding: 18px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    ul {
      margin: 20px 0;
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Welcome to RideHail!</div>
    <div class="content">
      <p>Hello <strong>{{user_name}}</strong>,</p>
      <p>Thanks for verifying your account. You're all set to book your first buggy ride with RideHail!</p>
      <p>With RideHail, you can:</p>
      <ul>
     <li>✅ Book buggies instantly without waiting</li>
        <li>✅ Track your buggy in real-time with live location</li>
        <li>✅ Travel safely with verified Infosys drivers</li>
        <li>✅ Get reliable updates on ride availability and schedules</li>
      </ul>
      <p style="margin-top: 25px;">Best regards,<br><strong>RideHail</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} RideHail</p>
    </div>
  </div>
</body>
</html>
`;

export const RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #00a5c3, #31c6e2);
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333;
    }
    .token-box {
      background: #00a5c3;
      color: white;
      font-size: 22px; /* Reduced size */
      font-weight: bold;
      padding: 10px 20px;
      border-radius: 6px;
      display: inline-block;
      letter-spacing: 4px;
      margin: 20px 0;
    }
    .footer {
      background: #fafafa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Password Reset Request</div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a password reset request for your RideHail account.</p>
      <p>Your reset code is:</p>
      <div style="text-align: center;">
        <div class="token-box">{resetPasswordToken}</div>
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
      <p style="margin-top: 25px;">Best regards,<br><strong>RideHail Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} RideHail</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      background-color: #ffffff;
      margin: 40px auto;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(to right, #00a5c3, #31c6e2);
      color: white;
      padding: 30px;
      font-size: 22px;
      text-align: center;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      color: #333;
    }
    .success-icon {
      font-size: 48px;
      color: white;
      background-color: #00a5c3;
      border-radius: 50%;
      padding: 15px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .security-tips {
      margin-top: 20px;
      background-color: #f0f8ff;
      padding: 15px;
      border-left: 4px solid #00a5c3;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      background-color: #f9f9f9;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Password Reset Successful</div>
    <div class="content" style="text-align: center;">
      <div class="success-icon">✔</div>
      <p>Your password has been reset successfully for your RideHail account.</p>
      <div class="security-tips">
        <p><strong>Security Tip:</strong> If you didn’t perform this action, please secure your account immediately by contacting our support team.</p>
      </div>
      <p style="margin-top: 20px;">Best regards,<br><strong>RideHail Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} RideHail App</p>
    </div>
  </div>
</body>
</html>
`;


