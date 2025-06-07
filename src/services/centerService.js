import AbstractApiService from "./abstractApiService";


class CenterService extends AbstractApiService{
    getUrl() {
        return "/centers";
    }
}

export default new CenterService();