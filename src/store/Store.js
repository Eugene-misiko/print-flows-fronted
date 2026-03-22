import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import profileReducer from "./slices/profileSlice"
import usersReducer from "./slices/usersSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import paymentsReducer from "./slices/paymentsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import messagingReducer from "./slices/messagingSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: usersReducer,
    orders: ordersReducer,
    products: productsReducer,
    payments: paymentsReducer,
    notifications: notificationsReducer,
    messaging: messagingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;