import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import BusinessLineService from "../services/businessLineService";

export const useBusinessLines = () => {
    const [businessLines, setBusinessLines] = useState([]);
    const [loadingBusinessLines, setLoadingBusinessLines] = useState(true);
    const token = useSelector((state) => state.user.token);
    const { errorSnackbar } = useSnackbarContext();

    useEffect(() => {
        if (token) {
            getBusinessLines();
        }
    }, [token]);

    const getBusinessLines = async () => {
        try {
            const response = await BusinessLineService.getAll(token);
            setBusinessLines(response.data);
            setLoadingBusinessLines(false);
        } catch (error) {
            console.error(error);
            setLoadingBusinessLines(false);
            errorSnackbar(error.message);
        }
    };

    return { businessLines, loadingBusinessLines, getBusinessLines };
};
