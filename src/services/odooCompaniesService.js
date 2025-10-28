import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

 class OdooCompaniesService extends AbstractApiService{
    getUrl() {
        return "/odoo-companies";
    }

    async sinchroniceOdooCompanies(access_token) {
        try {
            const response = await n16FinApi.post(`${this.getUrl()}/sinchronice`, {}, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error synchronizing Odoo companies:", error);
            throw error;
        }
    }
}

export default new OdooCompaniesService();