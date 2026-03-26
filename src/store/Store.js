import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/slices/authSlice.js";
import usersReducer from "./slices/usersSlice.js";
import productsReducer from "./slices/productsSlice.js";
import ordersReducer from "./slices/ordersSlice.js";
import paymentsReducer from "./slices/paymentsSlice.js";
import notificationsReducer from "./slices/notificationsSlice.js";
import messagingReducer from "./slices/messagingSlice.js";
import companyReducer from "./slices/companySlice.js";
import uiReducer from "./slices/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
    notifications: notificationsReducer,
    messaging: messagingReducer,
    company: companyReducer,
    ui: uiReducer,
  },
});

export default store;
