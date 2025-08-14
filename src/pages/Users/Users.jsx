import ListDataGrid from "../../components/ListDataGrid";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import UserService from "../../services/userService";
import { useSelector } from "react-redux";


function Users() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);

    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'email', headerName: 'Email', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'user_role', headerName: 'Rol', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    //Loading state
    const [loading, setLoading] = useState(true);
    //API ref
    const apiRef = useGridApiRef();

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getUsers();
        }
    }, [token]);

    //Obtiene los proveedores de la BD
    const getUsers = async () => {
        try {
            const response = await UserService.getAll(token);

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
    name="Usuarios"
    subname="Lista"
    url="/users"
    buttonName="Nuevo Usuario"
    loading={loading}
/>
  );
}

export default Users;