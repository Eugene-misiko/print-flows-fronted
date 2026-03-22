import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authslice'
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
   
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;