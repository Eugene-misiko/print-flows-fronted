import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

export const fetchPayments = createAsyncThunk(
    "payments/fetchPayments",
    async(_, thunKAPI) => {
        try {
            const response = await api.get("/api/^stk-push/?$")
        } catch (error) {
            return thunKAPI.rejectWithValue(
                error.response?.data || "Failed to fetch payments"
            )
        }
    }
)

const paymentsSlice = createSlice({
    name: "payments",
    initialState :{
        fields: [],
        loading: false,
        error: null,
    },
    reducers:{},
    extraReducers: (builder)=> {
        builder
        addCase(fetchPayments.pending, (state)=>{
            state.loading = true;
        })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload;
      })        

    }


})

