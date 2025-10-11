export default (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email];
    res.status(200).json({ message: 'Verified' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
};
