import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesAPI, productsAPI } from "../../api/api";

// ==================== CATEGORIES ====================

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch categories");
    }
  }
);
// Fetch public category by ID
export const fetchPublicCategory = createAsyncThunk(
  "products/fetchPublicCategory",
  async ({ id, companySlug }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getPublicCategoryById(id, { company: companySlug });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch public category");
    }
  }
);
export const fetchCategory = createAsyncThunk(
  "products/fetchCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch category");
    }
  }
);

export const createCategory = createAsyncThunk(
  "products/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "products/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "products/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoriesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete category");
    }
  }
);

// ==================== PRODUCTS ====================

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch products");
    }
  }
);
// Fetch public product by ID
export const fetchPublicProduct = createAsyncThunk(
  "products/fetchPublicProduct",
  async ({ id, companySlug }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getPublicById(id, { company: companySlug });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch public product");
    }
  }
);
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getFeatured();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch featured products");
    }
  }
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch product");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await productsAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete product");
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  products: [],
  featuredProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.results || action.payload;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.successMessage = "Category created";
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.categories[idx] = action.payload;
        state.successMessage = "Category updated";
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
        state.successMessage = "Category deleted";
      })
      // Products
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.results || action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.results || action.payload;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })
      .addCase(createProduct.pending, (state) => { state.isLoading = true; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
        state.successMessage = "Product created";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
        state.currentProduct = action.payload;
        state.successMessage = "Product updated";
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.successMessage = "Product deleted";
      })
      // Public product
      .addCase(fetchPublicProduct.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPublicProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchPublicProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Public category
      .addCase(fetchPublicCategory.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPublicCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchPublicCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })      
  },
});

export const { clearError, clearSuccess, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
