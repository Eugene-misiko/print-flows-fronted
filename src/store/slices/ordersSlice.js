import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersAPI, printJobsAPI, transportationAPI } from "../../api/api";

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
      return rejectWithValue(error.response?.data?.error || "Failed to create order");
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

// ==================== ORDER WORKFLOW ====================

export const assignDesigner = createAsyncThunk(
  "orders/assignDesigner",
  async ({ orderId, designerId }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.assignDesigner(orderId, designerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to assign designer");
    }
  }
);

export const assignPrinter = createAsyncThunk(
  "orders/assignPrinter",
  async ({ orderId, printerId }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.assignPrinter(orderId, printerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to assign printer");
    }
  }
);
//Rejct design
export const rejectDesign = createAsyncThunk(
  "orders/rejectDesign",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.rejectDesign(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to reject design"
      );
    }
  }
);
export const startDesign = createAsyncThunk(
  "orders/startDesign",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.startDesign(orderId);
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to submit design");
    }
  }
);

export const approveDesign = createAsyncThunk(
  "orders/approveDesign",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.approveDesign(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to approve design");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancel(orderId, reason);
      return response.data;
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
  async (id, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.start(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to start print job");
    }
  }
);

export const moveToPolishing = createAsyncThunk(
  "orders/moveToPolishing",
  async (id, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.moveToPolishing(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to move to polishing");
    }
  }
);

export const completePrintJob = createAsyncThunk(
  "orders/completePrintJob",
  async (id, { rejectWithValue }) => {
    try {
      const response = await printJobsAPI.complete(id);
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
      // Orders
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.results || action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(rejectDesign.fulfilled, (state, action) => {
      state.currentOrder = action.payload;
      state.successMessage = "Design rejected";
    })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.pending, (state) => { state.isLoading = true; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        state.successMessage = "Order created successfully";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
        state.currentOrder = action.payload;
        state.successMessage = "Order updated";
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.successMessage = "Order deleted";
      })
      // Workflow
      .addCase(assignDesigner.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Designer assigned";
      })
      .addCase(assignPrinter.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Printer assigned";
      })
      .addCase(startDesign.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Design started";
      })
      .addCase(submitDesign.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Design submitted";
      })
      .addCase(approveDesign.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Design approved";
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.successMessage = "Order cancelled";
      })
      // Dashboard
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload.results || action.payload;
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.myAssignments = action.payload.results || action.payload;
      })
      .addCase(fetchMyPrintJobs.fulfilled, (state, action) => {
        state.myPrintJobs = action.payload.results || action.payload;
      })
      .addCase(fetchUnassigned.fulfilled, (state, action) => {
        state.unassigned = action.payload.results || action.payload;
      })
      // Print Jobs
      .addCase(fetchPrintJobs.fulfilled, (state, action) => {
        state.printJobs = action.payload.results || action.payload;
      })
      .addCase(startPrintJob.fulfilled, (state, action) => {
        state.successMessage = "Print job started";
      })
      .addCase(moveToPolishing.fulfilled, (state, action) => {
        state.successMessage = "Moved to polishing";
      })
      .addCase(completePrintJob.fulfilled, (state, action) => {
        state.successMessage = "Print job completed";
      })
      // Transportation
      .addCase(fetchTransportation.fulfilled, (state, action) => {
        state.transportation = action.payload.results || action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
