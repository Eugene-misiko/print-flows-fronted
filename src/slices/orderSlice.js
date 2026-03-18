import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

// CREATE ORDER
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (formData, thunkAPI) => {
    try {
      const response = await api.post("/api/orders/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // IMPORTANT: refresh list after create
      thunkAPI.dispatch(fetchOrders());

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create order"
      );
    }
  }
);

// FETCH ALL
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/api/orders/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch orders"
      );
    }
  }
);

// FETCH ONE
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/api/orders/${id}/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch order"
      );
    }
  }
);

// DESIGN COMPLETE
export const designComplete = createAsyncThunk(
  "orders/designComplete",
  async (orderId, thunkAPI) => {
    await api.put(`/api/orders/${orderId}/design_complete/`);
    return orderId;
  }
);

// DESIGN REJECT
export const designReject = createAsyncThunk(
  "orders/designReject",
  async ({ orderId, reason }, thunkAPI) => {
    await api.put(`/api/orders/${orderId}/design_reject/`, { reason });
    return { orderId, reason };
  }
);

// PRINT APPROVE
export const printApprove = createAsyncThunk(
  "orders/printApprove",
  async (orderId, thunkAPI) => {
    await api.put(`/api/orders/${orderId}/approve/`);
    return orderId;
  }
);

// PRINT REJECT
export const printReject = createAsyncThunk(
  "orders/printReject",
  async ({ orderId, reason }, thunkAPI) => {
    await api.put(`/api/orders/${orderId}/print_reject/`, { reason });
    return { orderId, reason };
  }
);

// START PRINTING
export const startPrinting = createAsyncThunk(
  "orders/startPrinting",
  async (orderId) => {
    await api.put(`/api/orders/${orderId}/start_printing/`);
    return orderId;
  }
);

// COMPLETE PRINT
export const completePrint = createAsyncThunk(
  "orders/completePrint",
  async (orderId) => {
    await api.put(`/api/orders/${orderId}/complete_print/`);
    return orderId;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    order: null,
    invoice: null,
    loading: false,
    actionLoading: false,
    error: null,
    createdInvoiceId: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH ALL
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ONE
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.order = action.payload;
      })

      // CREATE
      .addCase(createOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.createdInvoiceId = action.payload.invoice_id;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // STATUS UPDATES (safe update)
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.payload &&
          typeof action.payload === "number",
        (state, action) => {
          const order = state.orders.find(
            (o) => o.id === action.payload
          );
          if (!order) return;

          if (action.type.includes("designComplete"))
            order.status = "design_completed";

          if (action.type.includes("printApprove"))
            order.status = "approved";

          if (action.type.includes("startPrinting"))
            order.status = "printing";

          if (action.type.includes("completePrint"))
            order.status = "completed";
        }
      );
  },
});

export default orderSlice.reducer;