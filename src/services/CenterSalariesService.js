import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class CenterSalariesService extends AbstractApiService {
    /**
     * Devuelve la URL base para las operaciones de salarios de centros.
     * @returns {string} La URL base.
     */
    getUrl() {
        return "/center-salaries";
    }

    async getByCenterAndYear(centerId, year, access_token) {
        try {
            console.log("Fetching salaries for center:", centerId, "and year:", year);
            const response = await n16FinApi.get(`${this.getUrl()}/byCenterAndYear?center_id=${centerId}&year=${encodeURIComponent(year)}`, { bearerToken: access_token });
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                return null;
            }
            throw err;
        }
    }
}

export default new CenterSalariesService();