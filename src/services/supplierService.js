import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class SupplierService extends AbstractApiService {
    getUrl() {
        return "/suppliers";
    }

    async updateCentersOnInvoices(access_token, values) {
        try {
            const response = await n16FinApi.post(`${this.getUrl()}/updateCentersOnInvoices`, values, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during updateCentersOnInvoices:", error);
            throw error;
        }
    }
}

export default new SupplierService();