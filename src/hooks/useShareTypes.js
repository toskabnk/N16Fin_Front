import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import ShareTypesService from "../services/shareTypesService";

export function useShareTypes() {
    const { errorSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [shareTypes, setShareTypes] = useState([]);
    const [loadingShareTypes, setLoadingShareTypes] = useState(true);
    
    const getShareTypes = async () => {
        try {
            setLoadingShareTypes(true);
            const response = await ShareTypesService.getAll(token);
            setShareTypes(response.data);
            setLoadingShareTypes(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los tipos de reparticiones");
            setLoadingShareTypes(false);
        }
    }

    useEffect(() => {
        if (token) {
            getShareTypes();
        }
    }, [token]);

    return { shareTypes, loadingShareTypes, getShareTypes };
}