import { createSlice } from "@reduxjs/toolkit";

// Initial state for the data slice
const initialState = {
    year: null,
    numberCheckInvoices: 50,
};

export const dataSlice = createSlice({
    name: "data",
    initialState,
    reducers: {
        setYear: (state, action) => {
            state.year = action.payload;
        },
        clearYear: (state) => {
            state.year = null;
        },
        setNumberCheckInvoices: (state, action) => {
            state.numberCheckInvoices = action.payload;
        },
        clearNumberCheckInvoices: (state) => {
            state.numberCheckInvoices = 50;
        },
    },
});

export const { setYear, clearYear, setNumberCheckInvoices, clearNumberCheckInvoices } = dataSlice.actions;
export default dataSlice.reducer;