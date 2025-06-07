import { API_URL } from '../config/constants.js';
import axios from 'axios';
import { deleteUser } from '../redux/userSlice.js';
import { store } from '../redux/store';

//Configuracion de la API con axios
const n16FinApi = axios.create({
    baseURL: API_URL,
});

//Interceptor para agregar el token de autenticacion a las peticiones de la API si es necesario
n16FinApi.interceptors.request.use(config => {
    // Get token from Redux store or localStorage instead of config
    const token = store.getState().user?.token;
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

//Interceptor para manejar respuestas
n16FinApi.interceptors.response.use(
    response => response, // Si la respuesta es exitosa, simplemente retórnala
    error => {
        const { response, config } = error;

        if (response && response.status === 401) {
            //Verificamos si el error es al hacer login para no redirigir al usuario
            //if (config.url !== '/login') {
            //    // Despacha la acción de eliminar usuario
            //   store.dispatch(deleteUser());

                // Redirige al usuario a la página de inicio de sesión
            //    window.location.href = '/login';
            //}
        }

        //Rechaza la promesa con el error original para que pueda ser manejado por el código que hizo la solicitud
        return Promise.reject(error);
    }
);

export default n16FinApi;