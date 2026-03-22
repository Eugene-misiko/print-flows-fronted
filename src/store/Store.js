import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authslice'
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";
import profileReducer from "./slices/profileSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
    profile: profileReducer
   
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;