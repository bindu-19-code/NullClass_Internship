import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppDispatch } from "../store/store";
import { login as loginAction } from "@/Feature/Userslice";
import { isMobile, browserName, osName } from "react-device-detect";
import { useRouter } from "next/navigation"; // ✅ Added for navigation

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const router = useRouter(); // ✅ Initialize router

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        browser: browserName,
        os: osName,
        deviceType: isMobile ? "Mobile" : "Desktop",
      });

      const { user, message, loginHistory: history } = res.data;
      dispatch(loginAction(user));
      localStorage.setItem("user", JSON.stringify(user));
      setLoginHistory(history || []);
      toast.success(message || "Login successful");
      setEmail("");
      setPassword("");

      // ✅ Redirect to home page after successful login
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

      {/* Display login history */}
      {loginHistory.length > 0 && (
        <div className="mt-6 w-80 bg-white p-4 border rounded shadow">
          <h3 className="font-semibold mb-2">Login History:</h3>
          <ul className="text-sm">
            {loginHistory.map((entry, index) => (
              <li key={index} className="border-b py-1">
                IP: {entry.ip} | Browser: {entry.browser} | OS: {entry.os} | Device: {entry.device} | Time:{" "}
                {new Date(entry.time).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
