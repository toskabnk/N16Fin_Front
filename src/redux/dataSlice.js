import { createSlice } from "@reduxjs/toolkit";

// Initial state for the data slice
const initialState = {
    year: null,
    years: [],
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
        setYears: (state, action) => {
            state.years = action.payload;
        },
        setNumberCheckInvoices: (state, action) => {
            state.numberCheckInvoices = action.payload;
        },
        clearNumberCheckInvoices: (state) => {
            state.numberCheckInvoices = 50;
        },
    },
});

export const { setYear, clearYear, setYears, setNumberCheckInvoices, clearNumberCheckInvoices } = dataSlice.actions;
export default dataSlice.reducer;