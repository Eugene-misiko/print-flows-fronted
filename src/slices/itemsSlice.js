import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// CREATE ORDER
export const createItemOrder = createAsyncThunk(
  "items/createItemOrder",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.access;

      const response = await axios.post(
        `${BASE_URL}/orders/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// GET ORDERS
export const fetchItemOrders = createAsyncThunk(
  "items/fetchItemOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.access;

      const response = await axios.get(
        `${BASE_URL}/orders/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createItemOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createItemOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createItemOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH
      .addCase(fetchItemOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItemOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchItemOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default itemSlice.reducer;