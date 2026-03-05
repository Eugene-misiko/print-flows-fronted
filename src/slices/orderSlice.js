import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (formData, thunkAPI) => {
    try {
      const response = await api.post("/api/orders/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to create order"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/api/orders/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to fetch orders"
      );
    }
  }
);

// Complete Design
export const designComplete = createAsyncThunk(
  "orders/designComplete",
  async (orderId, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/design_complete/`);
      return orderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to complete design"
      );
    }
  }
);

// Reject Design
export const designReject = createAsyncThunk(
  "orders/designReject",
  async ({ orderId, reason }, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/design_reject/`, { reason });
      return { orderId, reason };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to reject design"
      );
    }
  }
);
// Approve For Printing
export const printApprove = createAsyncThunk(
  "orders/printApprove",
  async (orderId, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/approve/`);
      return orderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to approve printing"
      );
    }
  }
);

// Reject Printing
export const printReject = createAsyncThunk(
  "orders/printReject",
  async ({ orderId, reason }, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/print_reject/`, { reason });
      return { orderId, reason };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to reject printing"
      );
    }
  }
);
export const startPrinting = createAsyncThunk(
  "orders/startPrinting",
  async (orderId, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/start_printing/`);
      return orderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// COMPLETE PRINT
export const completePrint = createAsyncThunk(
  "orders/completePrint",
  async (orderId, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/complete_print/`);
      return orderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    actionLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      //FETCH 
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //CREATE
      .addCase(createOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      //DESIGN COMPLETE 
      .addCase(designComplete.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startPrinting.fulfilled, (state, action) => {
      const order = state.orders.find(o => o.id === action.payload);
      if (order) order.status = "printing";
      })

      .addCase(completePrint.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload);
        if (order) order.status = "completed";
      })
      .addCase(designComplete.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = state.orders.find(
          (o) => o.id === action.payload
        );
        if (order) {
          order.status = "design_completed";
          order.rejection_reason = "";
        }
      })

      //DESIGN REJECT 
      .addCase(designReject.fulfilled, (state, action) => {
        const order = state.orders.find(
          (o) => o.id === action.payload.orderId
        );
        if (order) {
          order.status = "design_rejected";
          order.rejection_reason = action.payload.reason;
        }
      })

      //PRINT APPROVE 
      .addCase(printApprove.fulfilled, (state, action) => {
        const order = state.orders.find(
          (o) => o.id === action.payload
        );
        if (order) {
          order.status = "approved";
          order.rejection_reason = "";
        }
      })

      //PRINT REJECT 
      .addCase(printReject.fulfilled, (state, action) => {
        const order = state.orders.find(
          (o) => o.id === action.payload.orderId
        );
        if (order) {
          order.status = "print_rejected";
          order.rejection_reason = action.payload.reason;
        }
      });
  },
});

export default orderSlice.reducer;