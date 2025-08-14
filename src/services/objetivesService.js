import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class ObjetivesService  extends AbstractApiService{
    getUrl() {
        return "/objetives";
    }

    getObjetives(access_token, body) {
        return n16FinApi.get(`${this.getUrl()}`, {params: body, bearerToken: access_token});
    }
}

export default new ObjetivesService();