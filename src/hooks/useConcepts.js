import { useSelector } from "react-redux";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import ConceptService from "../services/conceptService";

export function useConcepts() {
    const { errorSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    const [concepts, setConcepts] = useState([]);
    const [loadingConcepts, setLoadingConcepts] = useState(true);

    const getConcepts = async () => {
        try {
            setLoadingConcepts(true);
            const response = await ConceptService.getAll(token);
            setConcepts(response.data);
            setLoadingConcepts(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los conceptos");
            setLoadingConcepts(false);
        }
    }

    useEffect(() => {
        if (token) {
            getConcepts();
        }
    }, [token]);

    return { concepts, loadingConcepts, getConcepts };
}