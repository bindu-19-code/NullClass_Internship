// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../Feature/Userslice";

// Configure store
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools only in development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // optional, avoids errors with non-serializable data
    }),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Typed hooks for easier TS usage in components
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Use instead of plain useDispatch & useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
