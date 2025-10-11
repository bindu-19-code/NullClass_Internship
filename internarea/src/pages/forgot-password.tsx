"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("https://nullclass-internship-1gk4.onrender.com/api/auth/forgot-password", { email });
      alert(t("forgotPassword.linkSent"));

      // Redirect to a "link sent" page
      router.push("/reset-link-sent");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t("forgotPassword.somethingWentWrong"));
      } else {
        alert(t("forgotPassword.unexpectedError"));
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-20 text-black">
      <h2 className="text-2xl font-bold mb-4">{t("forgotPassword.title")}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("forgotPassword.emailPlaceholder")}
          required
          className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {t("forgotPassword.sendLink")}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
