import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice"
import profileReducer from "./slices/profileSlice"
import userListReducer from "./slices/userListSlice"
export const Store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: userListReducer,

  },
});

export default Store;