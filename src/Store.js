import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import profileReducer from "./slices/profileSlice"
export const Store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,

  },
});

export default Store;