import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchInvoice = createAsyncThunk(
  "invoice/fetchInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/invoice/${invoiceId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const downloadInvoice = createAsyncThunk(
  "invoice/downloadInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/invoice/${invoiceId}/download/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceId}.pdf`);

      document.body.appendChild(link);
      link.click();

      return true;

    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",

  initialState: {
    invoice: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchInvoice.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoice = action.payload;
      })

      .addCase(fetchInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default invoiceSlice.reducer;