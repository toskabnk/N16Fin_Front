import { useEffect, useState } from "react";
import ListDataGrid from "../../components/ListDataGrid";
import { useSelector } from "react-redux";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import OdooCompaniesService from "../../services/odooCompaniesService";



function OdooCompanies() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);

    const [columns, setColumns] = useState([
        { field: 'odoo_id', headerName: 'Odoo ID', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'description', headerName: 'Descripcion', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    //Loading state
    const [loading, setLoading] = useState(true);
    const [synchronizing, setSynchronizing] = useState(false);

    useEffect(() => {
        if(token){
            getOdooCompanies();
        }
    }, [token]);

    //Obtiene los proveedores de la BD
    const getOdooCompanies = async () => {
        try {
            const response = await OdooCompaniesService.getAll(token);
            setRows(response.data);
        } catch (error) {
            errorSnackbar("Error al obtener los proveedores de Odoo");
        } finally {
            setLoading(false);
        }
    };

    const synchronizeOdooCompanies = async () => {
        setSynchronizing(true);
        try {
            await OdooCompaniesService.sinchroniceOdooCompanies(token);
            successSnackbar("Sincronización completada");
            getOdooCompanies();
        } catch (error) {
            errorSnackbar("Error al sincronizar los proveedores de Odoo");
        } finally {
            setSynchronizing(false);
        }
    };

    return (
        <ListDataGrid 
            rows={rows}
            columns={columns}
            loading={loading}
            name="Compañías de Odoo"
            subname="Lista"
            url="/odoo-companies"
            buttonName="Sincronizar Compañías"
            loadingButton={synchronizing}
            buttonFunction={synchronizeOdooCompanies}

        />
    );
}

export default OdooCompanies;