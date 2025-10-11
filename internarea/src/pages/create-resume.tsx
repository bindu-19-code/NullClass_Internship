"use client";
import { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";

// Replace with your Stripe publishable key
const stripePromise = loadStripe("pk_test_51SEAfZB2kfzFrpOHNulZxEgzhkvLFu6m20IYvFqM6en42QHgvT34RZA1D63LQgEVatCH0RL37JO18k8A4jDn8zBK00BseWiXhL");

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#fa755a" },
  },
};

function PaymentSection({ onPaymentSuccess }: { onPaymentSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return alert(t("payment.enterCardDetails"));

    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/resume/create-payment-intent",
        { amount: 50 * 100 } // ₹50
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        alert(t("payment.failed") + ": " + result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        alert(t("payment.success"));
        onPaymentSuccess();
      }
    } catch (err: any) {
      console.error(err);
      alert(t("payment.requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <CardElement options={CARD_ELEMENT_OPTIONS} />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
      >
        {loading ? t("payment.processing") : t("payment.button")}
      </button>
    </div>
  );
}

export default function CreateResume() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    qualification: "",
    experience: "",
    email: "",
    phone: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!formData.email) return alert(t("resume.enterEmail"));
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/resume/send-otp", { email: formData.email });
      alert(t("resume.otpSent"));
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert(t("resume.otpFailed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert(t("resume.enterOtp"));
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/resume/verify-otp", {
        email: formData.email,
        otp,
      });
      setOtpVerified(true);
      alert(t("resume.otpVerified"));
    } catch (err) {
      console.error(err);
      alert(t("resume.otpInvalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!photo) return alert(t("resume.photoRequired"));

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = storedUser?._id;

    if (!studentId) return alert(t("resume.userNotLoggedIn"));

    const form = new FormData();
    form.append("studentId", studentId);
    form.append("name", formData.name);
    form.append("qualification", formData.qualification);
    form.append("experience", formData.experience);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("photo", photo);

    try {
      await axios.post("http://localhost:5000/api/resume/save-resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t("resume.uploadSuccess"));
      setResumeUploaded(true);
    } catch (err) {
      console.error(err);
      alert(t("resume.uploadFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 text-black">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">{t("resume.title")}</h1>

        <div className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("resume.name")}
            className="w-full border p-2 rounded-md"
          />
          <input
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder={t("resume.qualification")}
            className="w-full border p-2 rounded-md"
          />
          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder={t("resume.experience")}
            className="w-full border p-2 rounded-md"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("resume.email")}
            className="w-full border p-2 rounded-md"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("resume.phone")}
            className="w-full border p-2 rounded-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded-md"
          />

          {!otpSent && (
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {loading ? t("resume.sending") : t("resume.sendOtp")}
            </button>
          )}

          {otpSent && !otpVerified && (
            <div className="space-y-3">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("resume.otpPlaceholder")}
                className="w-full border p-2 rounded-md"
              />
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                {loading ? t("resume.verifying") : t("resume.verifyOtp")}
              </button>
            </div>
          )}

          {otpVerified && !resumeUploaded && (
            <Elements stripe={stripePromise}>
              <PaymentSection onPaymentSuccess={handleResumeUpload} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
