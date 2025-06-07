import n16FinApi from "./apiServices";

class AbstractApiService {
    constructor() {
      if (this.constructor === AbstractApiService) {
        throw new Error("Cannot instantiate abstract class AbstractApiService");
      }
    }
  
    // Método abstracto que debe ser implementado en clases derivadas
    getUrl() {
      throw new Error("Method 'getUrl()' must be implemented.");
    }
  
    async getAll(access_token) {
      try {
        const response = await n16FinApi.get(this.getUrl(), { bearerToken: access_token });
        return response.data;
      } catch (error) {
        console.error("Error during getAll:", error);
        throw error;
      }
    }
  
    async find(id, access_token) {
      try {
        const response = await n16FinApi.get(`${this.getUrl()}/${id}`, { bearerToken: access_token });
        return response.data;
      } catch (error) {
        console.error("Error during find:", error);
        throw error;
      }
    }

    async create(access_token, values) {
      try {
        const response = await n16FinApi.post(this.getUrl(), values, { bearerToken: access_token });
        return response.data;
      } catch (error) {
        console.error("Error during create:", error);
        throw error;
      }
    }

    async update(access_token, id, values) {
      try {
        const response = await n16FinApi.put(`${this.getUrl()}/${id}`, values, { bearerToken: access_token });
        return response.data;
      } catch (error) {
        console.error("Error during update:", error);
        throw error;
      }
    }

    async delete(access_token, id) {
      try {
        const response = await n16FinApi.delete(`${this.getUrl()}/${id}`, { bearerToken: access_token });
        return response.data;
      } catch (error) {
        console.error("Error during delete:", error);
        throw error;
      }
    }
  }
  
  export default AbstractApiService;