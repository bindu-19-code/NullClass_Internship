import { ExternalLink, Mail, User as UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";

// Login history entry type
interface LoginHistoryEntry {
  ip: string;
  browser: string;
  os: string;
  device: string;
  time: string | Date;
}

// User type (matches Redux slice)
interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  plan: string;
  friends?: string[];
  createdAt?: string;
  updatedAt?: string;
  loginHistory?: LoginHistoryEntry[];
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user.photo || "/default-avatar.png"}
                  alt={user.name || ""}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">0</span>
                  <p className="text-blue-600 text-sm mt-1">{t("profile.activeApplications")}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">0</span>
                  <p className="text-green-600 text-sm mt-1">{t("profile.acceptedApplications")}</p>
                </div>
              </div>

              {/* Login History */}
              {user?.loginHistory && user.loginHistory.length > 0 && (
                <div className="mt-6 w-full bg-gray-50 p-4 border rounded shadow">
                  <h3 className="font-semibold mb-2">Login History:</h3>
                  <ul className="text-sm max-h-64 overflow-y-auto">
                    {user.loginHistory.map((entry: LoginHistoryEntry, index: number) => (
                      <li key={index} className="border-b py-1">
                        IP: {entry.ip} | Browser: {entry.browser} | OS: {entry.os} | Device: {entry.device} | Time:{" "}
                        {new Date(entry.time).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t("profile.viewApplications")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
