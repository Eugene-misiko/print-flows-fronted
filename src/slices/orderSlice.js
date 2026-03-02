import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";


//client creating an order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (formData, thunkAPI) => {
    try {
      const response = await api.post("/api/orders/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create order"
      );
    }
  }
);

// Get all orders (admin gets all automatically from backend)
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

// Approve order
export const approveOrder = createAsyncThunk(
  "orders/approveOrder",
  async (orderId, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;

    const response = await axios.put(
      `/api/orders/${orderId}/approve/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { orderId };
  }
);

//Print rejecting order
export const printReject = createAsyncThunk(
  "orders/printReject",
  async ({ orderId, reason }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;

    await axios.put(
      `/api/orders/${orderId}/print_reject/`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { orderId };
  }
);

// Reject order
export const rejectOrder = createAsyncThunk(
  "orders/rejectOrder",
  async ({ orderId, reason }, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/reject/`, { reason });
      return { orderId, reason };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to reject"
      );
    }
  }
);

// Assign designer
export const assignDesigner = createAsyncThunk(
  "orders/assignDesigner",
  async ({ orderId, designerId }, thunkAPI) => {
    try {
      await api.put(`/api/orders/${orderId}/assign/`, {
        designer_id: designerId,
      });
      return orderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to assign designer"
      );
    }
  }
);
//fetching the designers
export const fetchDesigners = createAsyncThunk(
  "orders/fetchDesigners",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/api/users/?role=designer/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    designers:[],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchDesigners.fulfilled, (state, action)=>{
          state.designers = action.payload;
        })
        .addCase(createOrder.fulfilled, (state, action)=>{
          state.orders.push(action.payload)
        })
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
      .addCase(approveOrder.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload);
        if (order) order.status = "approved";
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload.orderId);
        if (order) {
          order.status = "rejected";
          order.rejection_reason = action.payload.reason;
        }
      })
      .addCase(assignDesigner.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload);
        if (order) order.status = "in_design";
      });
  },
});

export default orderSlice.reducer;