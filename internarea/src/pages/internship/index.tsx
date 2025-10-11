import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";

interface Internship {
  _id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  stipend: number;
  workFromHome: boolean;
  partTime: boolean;
}

interface User {
  _id: string;
  email: string;
  name: string;
  plan: "free" | "bronze" | "silver" | "gold";
}

const planLimits: Record<User["plan"], number> = {
  free: 1,
  bronze: 3,
  silver: 5,
  gold: Infinity,
};

const InternshipPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user.user) as User | null;
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filtered, setFiltered] = useState<Internship[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/internship")
      .then((res) => {
        setInternships(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.log(t("internshipPage.fetchError"), err));
  }, [t]);

  const handleApply = async (internship: Internship) => {
    if (!user) return alert(t("internshipPage.loginToApply"));

    try {
      const res = await axios.get(
        `http://localhost:5000/api/application/user/${user._id}`
      );

      if (res.data.length >= planLimits[user.plan]) {
        return alert(t("internshipPage.maxApplicationsReached", { plan: user.plan }));
      }

      await axios.post("http://localhost:5000/api/application", {
        userId: user._id,
        internshipId: internship._id,
        coverLetter: t("internshipPage.defaultCoverLetter"),
        category: internship.category,
      });

      alert(t("internshipPage.appliedSuccess"));
    } catch (err) {
      console.error(err);
      alert(t("internshipPage.applyFailed"));
    }
  };

  const handleSubscribe = async (plan: "bronze" | "silver" | "gold") => {
    if (!user) return;

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);

    if (ist.getHours() < 12 || ist.getHours() >= 17)
      return alert(t("internshipPage.paymentTimeLimit"));

    try {
      const res = await axios.post(
        "http://localhost:5000/api/subscribe",
        { userId: user._id, plan },
        { withCredentials: true }
      );
      window.location.href = res.data.url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("internshipPage.subscriptionFailed"));
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4 text-black">{t("internshipPage.title")}</h2>

      {/* Subscription buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleSubscribe("bronze")}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          {t("internshipPage.bronze")} ₹100
        </button>
        <button
          onClick={() => handleSubscribe("silver")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {t("internshipPage.silver")} ₹300
        </button>
        <button
          onClick={() => handleSubscribe("gold")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {t("internshipPage.gold")} ₹1000
        </button>
      </div>

      {/* Internship list */}
      <div className="grid gap-4">
        {filtered.map((i) => (
          <div
            key={i._id}
            className="border p-4 rounded shadow-sm flex justify-between items-center text-black"
          >
            <div>
              <h3 className="font-semibold">{i.title}</h3>
              <p>{i.company}</p>
              <p className="text-sm text-black">{i.category}</p>
            </div>
            <button
              onClick={() => handleApply(i)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {t("internshipPage.apply")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternshipPage;
