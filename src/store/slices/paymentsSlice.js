import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsAPI } from "../../api/api";

// Invoices
export const fetchInvoices = createAsyncThunk(
  "payments/fetchInvoices",
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getInvoices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch invoices");
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  "payments/fetchInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getInvoice(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch invoice");
    }
  }
);

export const createInvoice = createAsyncThunk(
  "payments/createInvoice",
  async (data, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.createInvoice(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create invoice");
    }
  }
);

// M-Pesa
export const initiateMpesaPayment = createAsyncThunk(
  "payments/initiateMpesaPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.initiateMpesaPayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to initiate payment");
    }
  }
);

export const checkMpesaStatus = createAsyncThunk(
  "payments/checkMpesaStatus",
  async (checkoutRequestId, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.checkMpesaStatus(checkoutRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to check payment status");
    }
  }
);

// Payments
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
    }
  }
);

export const fetchReceipt = createAsyncThunk(
  "payments/fetchReceipt",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getReceipt(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch receipt");
    }
  }
);

const initialState = {
  invoices: [],
  currentInvoice: null,
  payments: [],
  currentReceipt: null,
  mpesaStatus: null,
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

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentsError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearMpesaStatus: (state) => {
      state.mpesaStatus = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.results || action.payload;
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
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Single Invoice
    builder
      .addCase(fetchInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
        state.currentInvoice = action.payload;
        state.successMessage = "Invoice created successfully";
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // M-Pesa Payment
    builder
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mpesaStatus = action.payload;
        state.successMessage = "Payment initiated. Check your phone for M-Pesa prompt.";
      })
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Check M-Pesa Status
    builder
      .addCase(checkMpesaStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkMpesaStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mpesaStatus = action.payload;
      })
      .addCase(checkMpesaStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.results || action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Receipt
    builder
      .addCase(fetchReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReceipt = action.payload;
      })
      .addCase(fetchReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearPaymentsError, 
  clearPaymentSuccess, 
  setCurrentInvoice, 
  clearCurrentInvoice,
  clearMpesaStatus 
} = paymentsSlice.actions;
export default paymentsSlice.reducer;