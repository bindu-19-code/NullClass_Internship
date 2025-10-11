import React, { useState } from "react";

interface OtpModalProps {
  email: string;
  onVerified: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('');

  const verifyOtp = async () => {
    if (!otp) return alert("Please enter the OTP");

    const res = await fetch('http://localhost:5000/api/resume/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (res.ok) {
      onVerified();
    } else {
      alert(data.message || "OTP verification failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black">
      <div className="bg-white p-6 rounded-md shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">Verify Email</h2>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-3 py-2 border rounded-md mb-4"
        />
        <button
          onClick={verifyOtp}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default OtpModal;
