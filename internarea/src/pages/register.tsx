import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation"; // ✅ Add this

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter(); // ✅ Initialize router

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email: normalizedEmail,
        password,
        phone,
      });
      toast.success(t("registerpage.registration_successful"));
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");

      // ✅ Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
      <h2 className="text-2xl font-bold mb-4">{t("registerpage.register")}</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-3 w-80">
        <input
          placeholder={t("registerpage.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          placeholder={t("registerpage.phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="email"
          placeholder={t("registerpage.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder={t("registerpage.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {t("registerpage.register")}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
