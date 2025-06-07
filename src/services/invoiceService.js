import AbstractApiService from "./abstractApiService";
import n16FinApi from "./apiServices";

class InvoiceService extends AbstractApiService {
    getUrl() {
        return "/invoices";
    }

    /**
     * Obtiene todas las facturas de Odoo.
     * Corresponde a viewOdooInvoices en InvoiceController.
     * @param {*} access_token Token de acceso
     * @returns 
     */
    async viewOdooIncoices(access_token) {
        try {
            const response = await n16FinApi.get(`${this.getUrl()}/odoo`, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during viewOdooIncoices:", error);
            throw error;
        }
    }


    /**
     * Agrega nuevas factuas de Odoo a la base de datos.
     * Corresponde a addAllNewOdooInvoices en InvoiceController.
     * @param {*} access_token Token de acceso
     * @param {*} values Limite de facturas a agregar
     * @returns 
     */
    async addOdooIncoices(access_token, values) {
        try {
            const response = await n16FinApi.post(`${this.getUrl()}/allNewOdoo`, values, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during resetOdooInvoice:", error);
            throw error;
        }
    }

    /**
     * Devuelve la factura a su estado original si proviene de Odoo.
     * Corresponde a resetInvoice en InvoiceController.
     * @param {*} access_token Token de acceso
     * @returns 
     */
        async resetOdooInvoice(access_token, id) {
            try {
                const response = await n16FinApi.post(`${this.getUrl()}/resetInvoice/${id}`, {}, { bearerToken: access_token });
                return response.data;
            } catch (error) {
                console.error("Error during resetOdooInvoice:", error);
                throw error;
            }
        }
}

export default new InvoiceService();