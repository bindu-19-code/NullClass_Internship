import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();

  const [token, setToken] = useState<string | null>(null);
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [autoPassword, setAutoPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Extract token from URL and verify
  useEffect(() => {
    const currentToken = window.location.pathname.split("/").pop() || null;
    setToken(currentToken);

    const verifyToken = async () => {
      if (!currentToken) return;
      try {
        await axios.get(`http://localhost:5000/api/auth/reset-password/${currentToken}`);
        setValidToken(true);
      } catch {
        toast.error(t("resetPassword.invalidToken"));
        window.location.href = "/forgot-password";
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [t]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          password: autoPassword ? undefined : password, // send password only if not auto
          autoGenerate: autoPassword,
        }
      );

      toast.success(res.data.message || t("resetPassword.success"));

      // Show generated password if backend sends it
      if (res.data.password) {
        setGeneratedPassword(res.data.password);
        toast.info(`${t("resetPassword.generatedPassword")}: ${res.data.password}`);
      }

      // Redirect to login after short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 10000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || t("resetPassword.somethingWentWrong"));
      } else {
        toast.error(t("resetPassword.unexpectedError"));
      }
    }
  };

  if (loading) return <p className="text-center mt-20">{t("resetPassword.loading")}</p>;
  if (!validToken) return null;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center">{t("resetPassword.title")}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={autoPassword}
            onChange={() => setAutoPassword(!autoPassword)}
          />
          {t("resetPassword.useGenerated")}
        </label>

        {!autoPassword && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("resetPassword.enterNew")}
            required
            className="w-full p-2 border rounded"
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          {t("resetPassword.resetButton")}
        </button>
      </form>

      {generatedPassword && (
        <div className="mt-4 text-center bg-gray-100 p-3 rounded text-sm">
          <strong>{t("resetPassword.generatedPassword")}:</strong> {generatedPassword}
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
