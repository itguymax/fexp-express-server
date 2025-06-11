// src/utils/emailSender.ts
import { config } from "../config";

export const EmailSender = {
  sendPasswordResetEmail: async (
    toEmail: string,
    resetToken: string
  ): Promise<void> => {
    // In a real app, this would use a service like SendGrid, Mailgun, or Nodemailer.
    // For now, we'll just log the email content.

    const resetLink = `${
      config.frontendUrl
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    console.log(`--- Sending Password Reset Email ---`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: FexP Password Reset Request`);
    console.log(`Body:`);
    console.log(`Hello,`);
    console.log(`You have requested a password reset for your FexP account.`);
    console.log(`Please click on the following link to reset your password:`);
    console.log(`${resetLink}`);
    console.log(`This link is valid for ${config.resetTokenExpiration}.`);
    console.log(`If you did not request this, please ignore this email.`);
    console.log(`------------------------------------`);

    // Example with Nodemailer (requires installation: npm install nodemailer @types/nodemailer)
    /*
    import nodemailer from 'nodemailer';
    const transporter = nodemailer.createTransport({
      // Configure your SMTP server details here
      service: 'gmail', // Example: for Gmail
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password_or_app_specific_password',
      },
    });

    await transporter.sendMail({
      from: '"FexP Support" <support@fexp.com>',
      to: toEmail,
      subject: 'FexP Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>You have requested a password reset for your FexP account.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link is valid for ${config.resetTokenExpiration}.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    */
  },
};
