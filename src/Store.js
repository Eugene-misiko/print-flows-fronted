import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"

export const Store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default Store;