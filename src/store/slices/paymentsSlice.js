import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsAPI, mpesaAPI, invoicesAPI} from "../../api/api";

// ===================== ASYNC THUNKS =====================

// ----- Invoices -----
export const fetchInvoices = createAsyncThunk(
  "payments/fetchInvoices",
  async (params, { rejectWithValue }) => {
    try {
      const response = await invoicesAPI.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
//download invoice
export const downloadInvoice = createAsyncThunk(
  "payments/downloadInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoicesAPI.download(id);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
// send invoice
export const sendInvoice = createAsyncThunk(
  "payments/sendInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoicesAPI.send(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
// ----- Payments -----
export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  "payments/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getStats();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const recordPayment = createAsyncThunk(
  "payments/record",
  async (data, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.record(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ----- MPesa -----
export const stkPushPayment = createAsyncThunk(
  "payments/stkPush",
  async (data, { rejectWithValue }) => {
    try {
      const response = await mpesaAPI.stkPush(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ====== INITIAL STATE ====
const initialState = {
  invoices: [],
  payments: [],
  stats: {},
  mpesaResponse: null,
  loading: false,
  error: null,
};

// = SLICE ==
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
  clearPayment: (state) => {
    state.error = null;
  },
    clearPayments: (state) => {
      state.payments = [];
      state.error = null;
    },
    clearMpesaResponse: (state) => {
      state.mpesaResponse = null;
    },
  },
  extraReducers: (builder) => {
    // ----- Invoices -----
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInvoices.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload.results || action.payload || []; })
      .addCase(fetchInvoices.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // ----- Payments -----
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPayments.fulfilled, (state, action) => { state.loading = false; state.payments = action.payload.results || action.payload || []; })
      .addCase(fetchPayments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchPaymentStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchPaymentStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(recordPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(recordPayment.fulfilled, (state, action) => { state.loading = false; state.payments.unshift(action.payload.payment); })
      .addCase(recordPayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // ----- MPesa -----
    builder
      .addCase(stkPushPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(stkPushPayment.fulfilled, (state, action) => { state.loading = false; state.mpesaResponse = action.payload; })
      .addCase(stkPushPayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const initiateMpesaPayment = stkPushPayment;
export const { clearPayment, clearPayments, clearMpesaResponse } = paymentsSlice.actions;
export default paymentsSlice.reducer;