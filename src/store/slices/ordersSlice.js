import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersAPI } from "../../api/api";

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.createOrder(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.updateOrder(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await ordersAPI.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Design actions
export const submitDesign = createAsyncThunk(
  "orders/submitDesign",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.submitDesign(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit design");
    }
  }
);

export const approveDesign = createAsyncThunk(
  "orders/approveDesign",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.approveDesign(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve design");
    }
  }
);

export const rejectDesign = createAsyncThunk(
  "orders/rejectDesign",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.rejectDesign(id, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject design");
    }
  }
);

// Printing actions
export const startPrinting = createAsyncThunk(
  "orders/startPrinting",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.startPrinting(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start printing");
    }
  }
);

export const completePrinting = createAsyncThunk(
  "orders/completePrinting",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.completePrinting(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete printing");
    }
  }
);

export const startPolishing = createAsyncThunk(
  "orders/startPolishing",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.startPolishing(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start polishing");
    }
  }
);

export const completeOrder = createAsyncThunk(
  "orders/completeOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.completeOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete order");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancelOrder(id, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel order");
    }
  }
);

// Print Jobs
export const fetchPrintJobs = createAsyncThunk(
  "orders/fetchPrintJobs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getPrintJobs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch print jobs");
    }
  }
);

export const assignPrinter = createAsyncThunk(
  "orders/assignPrinter",
  async ({ jobId, printerId }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.assignPrinter(jobId, printerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign printer");
    }
  }
);

// Transportation
export const updateTransportation = createAsyncThunk(
  "orders/updateTransportation",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.updateTransportation(orderId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update transportation");
    }
  }
);

// Dashboard data
export const fetchDesignerDashboard = createAsyncThunk(
  "orders/fetchDesignerDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getDesignerDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

export const fetchPrinterDashboard = createAsyncThunk(
  "orders/fetchPrinterDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getPrinterDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

export const fetchClientDashboard = createAsyncThunk(
  "orders/fetchClientDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getClientDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  printJobs: [],
  designerDashboard: null,
  printerDashboard: null,
  clientDashboard: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    page: 1,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
            page: action.meta.arg?.page || 1,
            totalPages: Math.ceil(action.payload.count / 10),
          };
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Single Order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.successMessage = "Order created successfully";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.currentOrder = action.payload;
        state.successMessage = "Order updated successfully";
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.successMessage = "Order deleted successfully";
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // Submit Design
    builder
      .addCase(submitDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.successMessage = "Design submitted successfully";
      })
      .addCase(submitDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Approve Design
    builder
      .addCase(approveDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.successMessage = "Design approved successfully";
      })
      .addCase(approveDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Reject Design
    builder
      .addCase(rejectDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.successMessage = "Design rejected";
      })
      .addCase(rejectDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });    

   // Start Printing
    builder
      .addCase(startPrinting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startPrinting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.successMessage = "Printing started";
      })
      .addCase(startPrinting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Complete Printing
    builder
      .addCase(completePrinting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completePrinting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.successMessage = "Printing completed";
      })
      .addCase(completePrinting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Start Polishing
    builder
      .addCase(startPolishing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startPolishing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.successMessage = "Polishing started";
      })
      .addCase(startPolishing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Complete Order
    builder
      .addCase(completeOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.successMessage = "Order completed successfully";
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.successMessage = "Order cancelled";
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Print Jobs
    builder
      .addCase(fetchPrintJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrintJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.printJobs = action.payload.results || action.payload;
      })
      .addCase(fetchPrintJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Assign Printer
    builder
      .addCase(assignPrinter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignPrinter.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.printJobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.printJobs[index] = action.payload;
        }
        state.successMessage = "Printer assigned successfully";
      })
      .addCase(assignPrinter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Transportation
    builder
      .addCase(updateTransportation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransportation.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentOrder) {
          state.currentOrder.transportation = action.payload;
        }
        state.successMessage = "Transportation updated successfully";
      })
      .addCase(updateTransportation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Dashboards
    builder
      .addCase(fetchDesignerDashboard.fulfilled, (state, action) => {
        state.designerDashboard = action.payload;
      })
      .addCase(fetchPrinterDashboard.fulfilled, (state, action) => {
        state.printerDashboard = action.payload;
      })
      .addCase(fetchClientDashboard.fulfilled, (state, action) => {
        state.clientDashboard = action.payload;
      });
  },
});

export const { 
  clearOrdersError, 
  clearOrderSuccess, 
  setCurrentOrder, 
  clearCurrentOrder 
} = ordersSlice.actions;
export default ordersSlice.reducer;    
