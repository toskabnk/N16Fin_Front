import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";
import ListDataGrid from "../../components/ListDataGrid";
import ConceptService from "../../services/conceptService";

function Concepts() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);
    //API ref
    const apiRef = useGridApiRef();

    //Al cargar la pagina cargamos los conceptos
    useEffect(() => {
        if(token) {
            getConcepts();
        }
    }, [token]);
    
    const getConcepts = async () => {
        try {
            setLoading(true);
            const response = await ConceptService.getAll(token);
            setRows(response.data);
            setLoading(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los conceptos");
            setLoading(false);
        }
    }

    return (
        <ListDataGrid
            rows={rows}
            columns={columns}
            name="Conceptos"
            subname="Lista"
            url="/concepts"
            buttonName="Nuevo concepto"
            loading={loading}/>
    );
}

export default Concepts;