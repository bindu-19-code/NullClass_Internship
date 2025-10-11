// Userslice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define login history entry
export interface LoginHistoryEntry {
  ip: string;
  browser: string;
  os: string;
  device: string;
  time: string | Date;
}

// Update User interface to include loginHistory
export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  plan: string;
  friends?: string[];
  createdAt?: string;
  updatedAt?: string;
  loginHistory?: LoginHistoryEntry[]; // ✅ Add this
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload; // now includes loginHistory
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
