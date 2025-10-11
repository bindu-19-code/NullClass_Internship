import React, { useState } from "react";
import Link from "next/link";
import { Search, Globe } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout as logoutAction } from "@/Feature/Userslice";
import { useTranslation } from "react-i18next";
import OtpModal from "@/Components/OtpModel"; // Make sure filename matches exactly

const Navbar: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleLogout = () => {
    try {
      localStorage.removeItem("user"); // Clear local storage
      dispatch(logoutAction()); // Clear redux
    } catch (err: any) {
      console.error("Logout error:", err.message);
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "fr", name: "Français (French)" },
    { code: "es", name: "Español (Spanish)" },
    { code: "pt", name: "Português (Portuguese)" },
    { code: "zh", name: "中文 (Chinese)" },
  ];

  const changeLanguage = async (code: string) => {
    if (code === "fr") {
      const email = prompt("Enter your email to verify before switching to French:");
      if (!email) return alert("Email is required!");

      setOtpEmail(email);
      setLoading(true);
      try {
        const sendRes = await fetch("http://localhost:5000/api/resume/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const sendData = await sendRes.json();
        if (!sendRes.ok) return alert(sendData.message || "Failed to send OTP");

        // Show OTP modal for verification
        setOtpModalVisible(true);
      } catch (err) {
        console.error("Language verification error:", err);
        alert("Something went wrong while sending OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      i18n.changeLanguage(code);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-blue-600">
                <img src="/logo.png" alt="logo" className="h-16" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/internship" className="hover:text-blue-600 text-gray-700">
                {t("navbar.internships")}
              </Link>
              <Link href="/job" className="hover:text-blue-600 text-gray-700">
                {t("navbar.jobs")}
              </Link>
              <Link href="/feed" className="hover:text-blue-600 text-gray-700">
                {t("navbar.publicSpace")}
              </Link>
              <Link href="/create-resume" className="hover:text-blue-600 text-gray-700">
                {t("navbar.createResume")}
              </Link>

              {/* Search Bar */}
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t("navbar.searchPlaceholder")}
                  className="ml-2 bg-transparent focus:outline-none text-sm w-48"
                />
              </div>

              {/* 🌐 Language Selector */}
              <div className="relative text-black gap-4 mr-6">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  <Globe className="w-5 h-5" />
                  <span>{t("navbar.language")}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg w-48 z-10">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        disabled={loading}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile">
                    <img
                      src={user.photo || "/default-avatar.png"}
                      alt="profile"
                      className="w-8 h-8 rounded-full"
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 rounded-md border hover:bg-gray-100 text-gray-700"
                  >
                    {t("auth.logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    {t("navbar.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    {t("navbar.register")}
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {t("navbar.forgotPassword")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* OTP Modal */}
      {otpModalVisible && (
        <OtpModal
          email={otpEmail}
          onVerified={() => {
            i18n.changeLanguage("fr");
            setOtpModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default Navbar;
