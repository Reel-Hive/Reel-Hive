import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  // 1] Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2]Define the email options
  const mailOptions = {
    form: 'devanshijodhani45@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actual sending mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
