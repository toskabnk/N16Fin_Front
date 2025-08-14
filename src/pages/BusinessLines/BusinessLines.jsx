import { useEffect, useState } from "react";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useSelector } from "react-redux";
import BusinessLineService from "../../services/businessLineService";
import ListDataGrid from "../../components/ListDataGrid";


function BusinessLines() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);

    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'acronym', headerName: 'Acrónimo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'description', headerName: 'Descripcion', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

     //Loading state
    const [loading, setLoading] = useState(true);
    
    //Al cargar la pagina carga los centros
    useEffect(() => {
        if(token){
            getBusinessLines();
        }
    }, [token]);

    //Obtiene las lineas de negocio
    const getBusinessLines = async () => {
        try {
            const response = await BusinessLineService.getAll(token);
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
            name="Líneas de Negocio"
            subname="Lista"
            url="/business-lines"
            buttonName="Nueva Línea de Negocio"
            loading={loading}
        />
    );
}

export default BusinessLines;
