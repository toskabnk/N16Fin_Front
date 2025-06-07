import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice.js"

//Configuracion del store
export const store = configureStore({
    reducer: {
        user: userReducer,
    },
})