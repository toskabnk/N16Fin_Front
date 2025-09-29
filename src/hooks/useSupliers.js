import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import SupplierService from "../services/supplierService";

export function useSuppliers() {
    const { errorSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);

    const getSuppliers = async () => {
        try {
            setLoadingSuppliers(true);
            const response = await SupplierService.getAll(token);
            setSuppliers(response.data);
            setLoadingSuppliers(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los proveedores");
            setLoadingSuppliers(false);
        }
    }

    useEffect(() => {
        if (token) {
            getSuppliers();
        }
    }, [token]);

    return { suppliers, loadingSuppliers, getSuppliers };
}