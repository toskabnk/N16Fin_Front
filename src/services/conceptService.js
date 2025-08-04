import AbstractApiService from "./abstractApiService";

class ConceptService extends AbstractApiService {
    getUrl() {
        return "/concepts";
    }
}

export default new ConceptService();
