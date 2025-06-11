import { createSlice } from "@reduxjs/toolkit";

// Initial state for the data slice
const initialState = {
    year: null,
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
    },
});

export const { setYear, clearYear } = dataSlice.actions;
export default dataSlice.reducer;