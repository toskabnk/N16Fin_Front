import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

export class UserService extends AbstractApiService {
    getUrl() {
        return "/users";
    }

    /**
     * Actualiza la contraseña de un usuario.
     * Corresponde a updatePassword en UserController.
     * @param {*} access_token Token de acceso
     * @param {*} id Id del usuario a actualizar
     * @param {*} values Contraseña nueva
     * @returns 
     */
    async updateUserPassword(access_token, id, values) {
        try {
            const response = await  n16FinApi.put(`/users/${id}/update-password`, values, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during updateUserPassword:", error);
            throw error;
        }
    }

    async getUserProfile(access_token) {
        try {
            const response = await n16FinApi.get("/users/me", { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during getUserProfile:", error);
            throw error;
        }
    }
}
export default new UserService();