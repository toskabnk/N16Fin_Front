import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import OdooCompaniesService from "../services/odooCompaniesService";

export function useOdooCompanies() {
    const {errorSnackbar} = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [odooCompanies, setOdooCompanies] = useState([]);
    const [loadingOdooCompanies, setLoadingOdooCompanies] = useState(true);

    const getOdooCompanies = async () => {
        try {
            const response = await OdooCompaniesService.getAll(token);
            setOdooCompanies(response.data);
            setLoadingOdooCompanies(false);
        } catch (error) {
            errorSnackbar("Error al obtener los proveedores de Odoo");
            setLoadingOdooCompanies(false);
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) {
            getOdooCompanies();
        }
    }, [token]);

    return { odooCompanies, loadingOdooCompanies, getOdooCompanies };

}
