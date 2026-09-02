import Misc from "@/constrants/Misc";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your password",
    text: `Reset your password: ${resetUrl}\nThis link expires in ${Misc.PASSWORD_RESET_EXPIRY_MINUTES} minutes`,
    html: `<p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in ${Misc.PASSWORD_RESET_EXPIRY_MINUTES} minutes.</p>`,
  });
}
