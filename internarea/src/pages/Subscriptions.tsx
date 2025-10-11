import React from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useTranslation } from "react-i18next";

const plans = [
  { name: "Free", price: 0, limit: 1 },
  { name: "Bronze", price: 100, limit: 3 },
  { name: "Silver", price: 300, limit: 5 },
  { name: "Gold", price: 1000, limit: -1 },
];

function Subscriptions() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user.user);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      alert(t("please_login_first"));
      return;
    }

    // ⏰ Time restriction: 12–5 PM IST
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const hour = ist.getHours();

    if (hour < 12 || hour >= 17) {
      alert(t("payments_allowed_time"));
      return;
    }

    if (plan.price === 0) {
      // Free plan activation
      try {
        await axios.post("http://localhost:5000/api/subscription/free", {
          userId: user._id,
        });
        alert(t("free_plan_activated", { limit: plan.limit }));
      } catch (err) {
        console.error(err);
        alert(t("failed_activate_free_plan"));
      }
      return;
    }

    // Paid plan: create Stripe Checkout session
    try {
      const res = await axios.post("http://localhost:5000/api/subscribe", {
        userId: user._id,
        plan: plan.name.toLowerCase(),
      });

      window.location.href = res.data.url; // redirect to Stripe hosted page
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("payment_failed"));
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold mb-6">{t("choose_subscription")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <div key={idx} className="border p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold">{t(plan.name.toLowerCase())}</h3>
            <p className="my-2">₹{plan.price}/month</p>
            <p className="mb-4">
              {plan.limit === -1 ? t("unlimited") : plan.limit} {t("applications")}
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => handleSubscribe(plan)}
            >
              {plan.price === 0 ? t("activate") : t("subscribe")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscriptions;
