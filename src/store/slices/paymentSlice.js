import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async (paymentData, { rejectWithValue }) => {
    try {

      const response = await api.post(
        "/api/stk-push/",
        paymentData
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const paymentSlice = createSlice({

  name: "payment",

  initialState: {
    loading: false,
    success: false,
    error: null,
  },

  reducers: {
    resetPayment: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {

    builder

      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
      })

      .addCase(initiatePayment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const { resetPayment } = paymentSlice.actions;

export default paymentSlice.reducer;