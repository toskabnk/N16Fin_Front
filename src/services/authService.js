import n16FinApi from './apiServices';

/**
 * Funcion para realizar el login de un usuario en la aplicacion y obtener los datos del usuario
 * @param {*} values Valores del formulario de login
 * @returns {Promise} Datos del usuario
 */
export const login = async (values) => {
    try {
        const response = await n16FinApi.post('/login', values);
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

/**
 * Funcion para realizar el logout de un usuario en la aplicacion y cerrar la sesion
 * @param {*} access_token Token de acceso del usuario autenticado
 * @returns {Promise} Respuesta del servidor
 */
export const logout = async (access_token) => {
    try {
        const response = await n16FinApi.post('/logout', '', { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};