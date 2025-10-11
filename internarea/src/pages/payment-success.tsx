import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { login as loginAction, User } from "@/Feature/Userslice";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const PaymentSuccess: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { plan, userId, sessionId } = router.query;

  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.user);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>(t("payment_processing"));
  const processedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || !userState || processedRef.current) return;

    const confirmPayment = async () => {
      try {
        if (!plan || !userId || !sessionId) {
          setMessage(t("payment_invalid_data"));
          return;
        }

        const planStr = Array.isArray(plan) ? plan[0] : plan;
        const sessionStr = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        // Fetch Stripe session info
        const { data: sessionData } = await axios.get(
          `http://localhost:5000/api/stripe-session/${sessionStr}`
        );

        const paymentInfo = {
          amount: sessionData.amount_total,
          currency: sessionData.currency,
          paymentId: sessionData.payment_intent,
        };

        // Update backend
        await axios.post("http://localhost:5000/api/payment-success", {
          userId,
          plan: planStr,
          paymentInfo,
        });

        // Update Redux & localStorage
        const updatedUser: User = { ...userState, plan: planStr };
        dispatch(loginAction(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(t("subscription_updated", { plan: planStr }));
        setMessage(t("payment_successful_plan", { plan: planStr }));
      } catch (err) {
        console.error("Payment confirmation error:", err);
        toast.error(t("payment_confirmation_failed"));
        setMessage(t("payment_confirmation_failed"));
      } finally {
        processedRef.current = true;
        setLoading(false);
      }
    };

    confirmPayment();
  }, [router.isReady, plan, userId, sessionId, userState, dispatch, t]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        {t("loading")}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-black">{t("payment_status")}</h1>
      <p className="text-lg text-black">{message}</p>
    </div>
  );
};

export default PaymentSuccess;
