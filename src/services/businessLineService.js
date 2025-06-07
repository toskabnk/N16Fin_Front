import AbstractApiService from "./abstractApiService";


class BusinessLineService  extends AbstractApiService{
    getUrl() {
        return "/business-lines";
    }
}

export default new BusinessLineService();