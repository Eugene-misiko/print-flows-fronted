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