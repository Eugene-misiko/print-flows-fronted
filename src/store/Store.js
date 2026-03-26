import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/slices/authSlice";
import usersReducer from "./slices/usersSlice";
import productsReducer from "./slices/productsSlice";
import ordersReducer from "./slices/ordersSlice";
import paymentsReducer from "./slices/paymentsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import messagingReducer from "./slices/messagingSlice";
import companyReducer from "./slices/companySlice";
import uiReducer from "./slices/uiSlice";

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
