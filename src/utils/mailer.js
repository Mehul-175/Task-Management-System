import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (email, password, firstname) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SaaS Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to the Team - Your Login Credentials",
    html: `
      <h1>Hello, ${firstname}!</h1>
      <p>An admin has created an account for you on our platform.</p>
      <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/login">Click here to login</a></p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <br>
      <p>Please change your password after your first login for security purposes.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};