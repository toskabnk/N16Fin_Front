import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import CenterService from "../services/centerService";

export function useCenters() {
    const { errorSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [centers, setCenters] = useState([]);
    const [loadingCenters, setLoadingCenters] = useState(true);

    const getCenters = async () => {
        try {
            const response = await CenterService.getAll(token);
            setCenters(response.data);
            setLoadingCenters(false);
        } catch (error) {
            console.error(error);
            setLoadingCenters(false);
            errorSnackbar(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            getCenters();
        }
    }, [token]);

    return { centers, loadingCenters, getCenters };
}
