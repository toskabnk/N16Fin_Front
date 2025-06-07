import { useEffect, useState } from "react";
import ListDataGrid from "../../components/ListDataGrid";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import CenterService from "../../services/centerService";
import { useSelector } from "react-redux";


function Centers() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);

    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'acronym', headerName: 'Acrónimo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'city', headerName: 'Ciudad', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    //Loading state
    const [loading, setLoading] = useState(true);

    //Al cargar la pagina carga los centros
    useEffect(() => {
        if(token){
            getCenters();
        }
    }, [token]);

    //Obtiene los centros
    const getCenters = async () => {
        try {
            const response = await CenterService.getAll(token);
            setRows(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            errorSnackbar(error.message);
        }
    };


    return (
        <ListDataGrid
        rows={rows}
        columns={columns}
        name="Centros"
        subname="Lista"
        url="/centers"
        buttonName="Nuevo Centro"
        loading={loading}
        />
    );
}

export default Centers;
