import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import profileReducer from "./slices/profileSlice"
import userListReducer from "./slices/userListSlice"
import orderReducer from "./slices/orderSlice";
import productsReducer from "./slices/productSlice";
import paymentReducer from "./slices/paymentSlice";
import invoiceReducer from "./slices/invoiceSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: userListReducer,
    orders: orderReducer,
    products: productsReducer,
    payments : paymentReducer,
    invoices : invoiceReducer,
  },
});

export default store;