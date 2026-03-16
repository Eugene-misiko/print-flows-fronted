import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

// CREATE ORDER POST /api/orders/

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

//FETCH ALL ORDERS GET /api/orders/

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

//FETCH SINGLE ORDER GET /api/orders/{id}
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/api/orders/${id}/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to fetch order"
      );
    }
  }
);

//DESIGN COMPLETE
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

//DESIGN REJECT
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

//APPROVE PRINT
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

//PRINT REJECT

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

//START PRINTING

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

//COMPLETE PRINT

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
    order: null,
    loading: false,
    actionLoading: false,
    error: null,
    createdInvoiceId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      //FETCH ORDERS
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

      // FETCH ORDER BY ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })

      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //CREATE ORDER
      .addCase(createOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders.unshift(action.payload);
        state.createdInvoiceId = action.payload.invoice_id;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      //DESIGN COMPLETE
      .addCase(designComplete.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload);
        if (order) {
          order.status = "design_completed";
          order.rejection_reason = "";
        }
      })

      //DESIGN REJECT
      .addCase(designReject.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload.orderId);
        if (order) {
          order.status = "design_rejected";
          order.rejection_reason = action.payload.reason;
        }
      })

      //PRINT APPROVE
      .addCase(printApprove.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload);
        if (order) {
          order.status = "approved";
          order.rejection_reason = "";
        }
      })
      //PRINT REJECT
      .addCase(printReject.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload.orderId);
        if (order) {
          order.status = "print_rejected";
          order.rejection_reason = action.payload.reason;
        }
      })
      //START PRINTING
      .addCase(startPrinting.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload);
        if (order) order.status = "printing";
      })
      //COMPLETE PRINT
      .addCase(completePrint.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload);
        if (order) order.status = "completed";
      });
  },
});

export default orderSlice.reducer;