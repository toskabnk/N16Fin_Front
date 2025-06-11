import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class YearService extends AbstractApiService {
    getUrl() {
        return "/years";
    }
    /**
     * Obtiene el año actual.
     * @returns
     */
    async getCurrentYear(access_token) {
        try {
            const response = await  n16FinApi.get(`/years/currentYear`, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during getCurrentYear:", error);
            throw error;
        }
    }
}

export default new YearService();