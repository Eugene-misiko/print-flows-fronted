import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersAPI, printJobsAPI, transportationAPI } from "../../api/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
// Backend returns { message, order } for workflow actions, or just the order.
// This unwraps both shapes cleanly.
const unwrapOrder = (data) => data?.order ?? data;

// ==================== ORDERS ====================

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch orders");
    }
  }
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch order");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create order");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update order");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await ordersAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete order");
    }
  }
);

// ==================== WORKFLOW ====================

export const assignDesigner = createAsyncThunk(
  "orders/assignDesigner",
  async ({ id, designer_id }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.assignDesigner(id, designer_id);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to assign designer");
    }
  }
);

export const assignPrinter = createAsyncThunk(
  "orders/assignPrinter",
  async ({ id, printer_id }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.assignPrinter(id, printer_id);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to assign printer");
    }
  }
);

export const startDesign = createAsyncThunk(
  "orders/startDesign",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.startDesign(orderId);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to start design");
    }
  }
);

export const submitDesign = createAsyncThunk(
  "orders/submitDesign",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.submitDesign(orderId, data);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to submit design");
    }
  }
);

export const approveDesign = createAsyncThunk(
  "orders/approveDesign",
  async ({ id, approved, rejectionReason = "" }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.approveDesign(id, approved, rejectionReason);
      return response.data; // { message } or { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to process design");
    }
  }
);

// rejectDesign is just approveDesign with approved=false, re-exported for clarity
export const rejectDesign = createAsyncThunk(
  "orders/rejectDesign",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      // Uses the same approveDesign endpoint — no separate rejectDesign API call
      const response = await ordersAPI.approveDesign(id, false, reason);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to reject design");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancel(orderId, reason);
      return response.data; // { message, order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to cancel order");
    }
  }
);

// ==================== DASHBOARD ====================

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getMyOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch orders");
    }
  }
);

export const fetchMyAssignments = createAsyncThunk(
  "orders/fetchMyAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getMyAssignments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch assignments");
    }
  }
);

export const fetchMyPrintJobs = createAsyncThunk(
  "orders/fetchMyPrintJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getMyPrintJobs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch print jobs");
    }
  }
);

export const fetchUnassigned = createAsyncThunk(
  "orders/fetchUnassigned",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getUnassigned();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch unassigned");
    }
  }
);

// ==================== PRINT JOBS ====================

export const fetchPrintJobs = createAsyncThunk(
  "orders/fetchPrintJobs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch print jobs");
    }
  }
);

export const startPrintJob = createAsyncThunk(
  "orders/startPrintJob",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.start(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to start print job");
    }
  }
);

export const moveToPolishing = createAsyncThunk(
  "orders/moveToPolishing",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.moveToPolishing(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to move to polishing");
    }
  }
);

export const completePrintJob = createAsyncThunk(
  "orders/completePrintJob",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.complete(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to complete print job");
    }
  }
);

// ==================== TRANSPORTATION ====================

export const fetchTransportation = createAsyncThunk(
  "orders/fetchTransportation",
  async (params, { rejectWithValue }) => {
    try {
      const response = await transportationAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch transportation");
    }
  }
);

export const createTransportation = createAsyncThunk(
  "orders/createTransportation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await transportationAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to create transportation"
      );
    }
  }
);

export const markOutForDelivery = createAsyncThunk(
  "orders/markOutForDelivery",
  async (transportId, { rejectWithValue }) => {
    try {
      const response = await transportationAPI.outForDelivery(transportId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error  || 
        error.response?.data?.detail ||
        "Failed to mark out for delivery");
    }
  }
);

export const markDelivered = createAsyncThunk(
  "orders/markDelivered",
  async (transportId, { rejectWithValue }) => {
    try {
      const response = await transportationAPI.delivered(transportId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error ||
         error.response?.data?.detail ||
         "Failed to mark delivered");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  orders: [],
  currentOrder: null,
  myOrders: [],
  myAssignments: [],
  myPrintJobs: [],
  unassigned: [],
  printJobs: [],
  transportation: [],
  isLoading: false,
  actionLoading: false, // for workflow buttons — separate from list loading
  error: null,
  successMessage: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearCurrentOrder: (state) => { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch list ──
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.results || action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Fetch single ──
      .addCase(fetchOrder.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Create ──
      .addCase(createOrder.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        state.successMessage = "Order created! Invoice generated.";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Update / Delete ──
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
        state.currentOrder = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
      })

      // ── Workflow — all use actionLoading, all unwrap { message, order } ──
      .addCase(assignDesigner.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(assignDesigner.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Designer assigned ✓";
      })
      .addCase(assignDesigner.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(assignPrinter.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(assignPrinter.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Printer assigned ✓";
      })
      .addCase(assignPrinter.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(startDesign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(startDesign.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Design started ✓";
      })
      .addCase(startDesign.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(submitDesign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(submitDesign.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Design submitted for review ✓";
      })
      .addCase(submitDesign.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(approveDesign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(approveDesign.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.order) state.currentOrder = action.payload.order;
        state.successMessage = "Design approved ✓";
      })
      .addCase(approveDesign.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(rejectDesign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(rejectDesign.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Design rejected — designer notified";
      })
      .addCase(rejectDesign.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(cancelOrder.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = unwrapOrder(action.payload);
        state.successMessage = "Order cancelled";
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      // ── Dashboard feeds ──
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload.results || action.payload;
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.myAssignments = action.payload.results || action.payload;
      })
      .addCase(fetchMyPrintJobs.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyPrintJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myPrintJobs = action.payload.results || action.payload;
      })
      .addCase(fetchMyPrintJobs.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchUnassigned.fulfilled, (state, action) => {
        state.unassigned = action.payload.results || action.payload;
      })

      // ── Print Jobs ──
      .addCase(fetchPrintJobs.fulfilled, (state, action) => {
        state.printJobs = action.payload.results || action.payload;
      })
      .addCase(startPrintJob.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(startPrintJob.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Printing started ✓";
      })
      .addCase(startPrintJob.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(moveToPolishing.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(moveToPolishing.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Moved to polishing ✓";
      })
      .addCase(moveToPolishing.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(completePrintJob.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(completePrintJob.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Print job complete — order is ready! ✓";
      })
      .addCase(completePrintJob.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      // ── Transportation ──
      .addCase(fetchTransportation.fulfilled, (state, action) => {
        state.transportation = action.payload.results || action.payload;
      })
      .addCase(createTransportation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createTransportation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Delivery setup complete ✓";
      })
      .addCase(createTransportation.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(markOutForDelivery.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(markOutForDelivery.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Order is out for delivery ✓";
      })
      .addCase(markOutForDelivery.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      })

      .addCase(markDelivered.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(markDelivered.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Order delivered successfully ✓";
      })
      .addCase(markDelivered.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;