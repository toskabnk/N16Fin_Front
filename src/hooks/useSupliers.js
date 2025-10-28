import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import SupplierService from "../services/supplierService";

export function useSuppliers(autoLoad = true) {
    const { errorSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(autoLoad);

    const getSuppliers = async (selectedCompany = null) => {
        try {
            setLoadingSuppliers(true);
            const response = await SupplierService.getAll(token, selectedCompany ? { company_id: selectedCompany } : {});
            setSuppliers(response.data);
            setLoadingSuppliers(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los proveedores");
            setLoadingSuppliers(false);
        }
    }

    useEffect(() => {
        if (token && autoLoad) {
            getSuppliers();
        }
    }, [token, autoLoad]);

    return { suppliers, loadingSuppliers, setLoadingSuppliers, getSuppliers };
}