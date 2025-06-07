import AbstractApiService from "./abstractApiService";

class ShareTypesService extends AbstractApiService {
    getUrl() {
        return "/share-types";
    }
}

export default new ShareTypesService();