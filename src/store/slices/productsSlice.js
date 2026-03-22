import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsAPI } from "@/api/api";

// Categories
export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "products/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await productsAPI.createCategory(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "products/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.updateCategory(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category");
    }
  }
);