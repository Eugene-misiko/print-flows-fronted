import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import profileReducer from "./slices/profileSlice"
import userListReducer from "./slices/userListSlice"
import orderReducer from "@/slices/orderSlice";
import productReducer from "@/slices/productSlice";
export const Store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: userListReducer,
    orders: orderReducer,
    products: productReducer,

  },
});

export default Store;