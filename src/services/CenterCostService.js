import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class CenterCostService extends AbstractApiService {
    /**
     * Devuelve la URL base para las operaciones de costos de centros.
     * @returns {string} La URL base.
     */
    getUrl() {
        return "/center-costs";
    }

    async getByCenterAndYear(centerId, year, access_token) {
        try {
            console.log("Fetching costs for center:", centerId, "and year:", year);
            const response = await n16FinApi.get(`${this.getUrl()}/byCenterAndYear?center_id=${centerId}&year=${encodeURIComponent(year)}`, { bearerToken: access_token });
            console.log("Response data:", response.data);
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                return null;
            }
            throw err;
        }
    }


}
    


export default new CenterCostService();