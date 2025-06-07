import AbstractApiService from "./abstractApiService";

class SupplierService extends AbstractApiService {
    getUrl() {
        return "/suppliers";
    }
}

export default new SupplierService();