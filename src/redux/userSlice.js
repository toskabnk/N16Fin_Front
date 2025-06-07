import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

//Configuracion del estado inicial del usuario con los datos guardados en las cookies
const initialState = JSON.parse(Cookies.get('user') || 'null') || {
    isAuthenticated: false,
    token: null,
    name: null,
    role: null,
    id: null,
};

//Slice para el usuario con las acciones de agregar y eliminar usuario
export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action) => {
            const {name, id, token, role} = action.payload;
            state.name = name;
            state.id = id;
            state.token = token;
            state.role = role;
            state.isAuthenticated = true;

            Cookies.set('user', JSON.stringify(state), { expires: 7, sameSite: 'strict' });
        },

        deleteUser: (state) => {
            state.name = null;
            state.id = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            Cookies.remove('user');
        }
    }
})

export const { addUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;