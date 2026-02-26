import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import itemReducer from "./slices/authslice"

export const Store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemReducer,
  },
});

export default Store;