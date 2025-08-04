import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: localStorage.getItem("profile") ? true : false,
  profile: localStorage.getItem("profile")
    ? JSON.parse(localStorage.getItem("profile"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.isAuthenticated = true;
      state.profile = action.payload.profile;

      localStorage.setItem("profile", JSON.stringify(action.payload.profile));
    },
    clearUser(state) {
      state.isAuthenticated = false;
      state.profile = null;
      localStorage.removeItem("profile");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
