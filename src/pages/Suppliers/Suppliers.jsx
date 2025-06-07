import { useNavigate } from "react-router-dom";
import ListDataGrid from "../../components/ListDataGrid";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useGridApiRef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import SupplierService from "../../services/supplierService";
import { useSelector } from "react-redux";


function Suppliers() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const navigate = useNavigate();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);

    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'type', headerName: 'Tipo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'center', headerName: 'Centro', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    //Loading state
    const [loading, setLoading] = useState(true);
    //API ref
    const apiRef = useGridApiRef();

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getSuppliers();
        }
    }, [token]);

    //Obtiene los proveedores de la BD
    const getSuppliers = async () => {
        try {
            const response = await SupplierService.getAll(token);

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
    name="Proveedores"
    subname="Lista"
    url="/suppliers"
    buttonName="Nuevo Proveedor"
    loading={loading}
    noClick={true}
/>
  );
}

export default Suppliers;