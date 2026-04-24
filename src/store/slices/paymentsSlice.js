import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsAPI, mpesaAPI, invoicesAPI, receiptsAPI } from "../../api/api";

// ─── Invoices
export const fetchInvoices = createAsyncThunk(
  "payments/fetchInvoices",
  async (params, { rejectWithValue }) => {
    try {
      const res = await invoicesAPI.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const downloadInvoice = createAsyncThunk(
  "payments/downloadInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const res = await invoicesAPI.download(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendInvoice = createAsyncThunk(
  "payments/sendInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const res = await invoicesAPI.send(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── Payments

export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await paymentsAPI.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  "payments/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await paymentsAPI.getStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//   Admin-only: record a manual cash/card payment.
//   all three lists immediately without extra fetches.
 
export const recordPayment = createAsyncThunk(
  "payments/record",
  async (data, { rejectWithValue }) => {
    try {
      const res = await paymentsAPI.record(data);
      return res.data; // { payment, receipt, invoice }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── M-Pesa 

export const stkPushPayment = createAsyncThunk(
  "payments/stkPush",
  async (data, { rejectWithValue }) => {
    try {
      const res = await mpesaAPI.stkPush(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── Receipts

export const fetchReceipts = createAsyncThunk(
  "payments/fetchReceipts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await receiptsAPI.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const downloadReceipt = createAsyncThunk(
  "payments/downloadReceipt",
  async (id, { rejectWithValue }) => {
    try {
      const res = await receiptsAPI.download(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── Initial State 

const initialState = {
  invoices: [],
  payments: [],
  receipts: [],
  stats: {},
  mpesaResponse: null,
  loading: false,
  receiptsLoading: false,
  error: null,
};

// ─── Slice 
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPayment: (state) => { state.error = null; },
    clearPayments: (state) => { state.payments = []; state.error = null; },
    clearMpesaResponse: (state) => { state.mpesaResponse = null; },

    applyInvoiceUpdate: (state, action) => {
      const { invoice_id, status, amount_paid, balance_due } = action.payload;
      const idx = state.invoices.findIndex((i) => i.id === invoice_id);
      if (idx !== -1) {
        state.invoices[idx] = {
          ...state.invoices[idx],
          status,
          amount_paid,
          balance_due,
        };
      }
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Payments 
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Stats 
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false; state.stats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Record Payment 
    builder
      .addCase(recordPayment.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        state.loading = false;
        const { payment, receipt, invoice } = action.payload;

        if (payment) state.payments.unshift(payment);
        if (receipt) state.receipts.unshift(receipt);
        if (invoice) {
          const idx = state.invoices.findIndex((i) => i.id === invoice.id);
          if (idx !== -1) state.invoices[idx] = invoice;
        }
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── STK Push 
    builder
      .addCase(stkPushPayment.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(stkPushPayment.fulfilled, (state, action) => {
        state.loading = false; state.mpesaResponse = action.payload;
      })
      .addCase(stkPushPayment.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Receipts 
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.receiptsLoading = true; state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receipts = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.receiptsLoading = false; state.error = action.payload;
      })
      .addCase(downloadReceipt.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const initiateMpesaPayment = stkPushPayment;

export const {clearPayment,clearPayments,clearMpesaResponse,applyInvoiceUpdate,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;