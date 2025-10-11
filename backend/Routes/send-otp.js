import nodemailer from 'nodemailer';
import crypto from 'crypto';

let otpStore = {}; // simple memory store, can use DB for production

export default async (req, res) => {
  const { email } = req.body;

  // generate OTP
  const otp = crypto.randomInt(100000, 999999);
  otpStore[email] = otp;

  // send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: "bindukreddy1111@gmail.com", pass: "sqhq eabf uquo wnec" },
  });

  const mailOptions = {
    from: `"Support" <bindukreddy1111@gmail.com>`,
    to: email,
    subject: 'OTP for French Language Access',
    text: `Your OTP is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};
