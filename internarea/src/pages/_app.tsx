// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { login as loginAction } from "@/Feature/Userslice";

import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";

// i18n
import "../i18n"; // make sure this path points to src/i18n.ts
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

// Stripe
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51SEAfZB2kfzFrpOHNulZxEgzhkvLFu6m20IYvFqM6en42QHgvT34RZA1D63LQgEVatCH0RL37JO18k8A4jDn8zBK00BseWiXhL");

function AppWrapper({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Restore user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      store.dispatch(loginAction(JSON.parse(storedUser)));
    }

    // AFTER hydration, set language from localStorage (if present)
    // This will re-render client only — no hydration mismatch because
    // server+initial client used fallbackLng (en).
    const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (saved && i18n.language !== saved) {
      i18n.changeLanguage(saved).catch(() => {});
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Elements stripe={stripePromise}>
        <div className="bg-white min-h-screen">
          <ToastContainer />
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </div>
      </Elements>
    </I18nextProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <AppWrapper {...props} />
    </Provider>
  );
}
