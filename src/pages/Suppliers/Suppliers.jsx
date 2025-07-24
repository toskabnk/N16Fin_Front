import { useNavigate } from "react-router-dom";
import ListDataGrid from "../../components/ListDataGrid";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useState } from "react";
import SupplierService from "../../services/supplierService";
import { useSelector } from "react-redux";
import RestoreIcon from '@mui/icons-material/Restore';
import EditIcon from '@mui/icons-material/Edit';
import Swal from "sweetalert2";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CenterService from "../../services/centerService";


function Suppliers() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const navigate = useNavigate();
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Centers states
    const [centers, setCenters] = useState([]);

    const columns = useMemo(() =>[
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'type', headerName: 'Tipo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'centers', headerName: 'Centros', type:'string', flex: 1, resizable: true, overflow: 'hidden',
            valueGetter: (value) => {
                    const centerIds = value;
                    if (!Array.isArray(centerIds)) return '';

                    return centerIds
                    .map(id => {
                        const center = centers.find(c => c.id === id);
                        return center?.acronym || id;
                    })
                    .join(', ');
                },
         },
        { field: 'actions', headerName: 'Acciones', type: 'actions', flex: 1, resizable: true, overflow: 'hidden',
            getActions: (params) => [
                    <GridActionsCellItem
                        icon={<RestoreIcon />}
                        label= 'Actualizar Facturas'
                        onClick ={updateInvoices(params.id)}
                    />,
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label= 'Editar'
                        onClick ={editSupplier(params)}
                    />,
                    <GridActionsCellItem
                        icon={<VisibilityIcon />}
                        label= 'Ver facturas'
                        onClick ={viewInvoices(params.id)}
                    />,
            ],
        },
    ], [centers]);

    //Loading state
    const [loading, setLoading] = useState(true);
    //API ref
    const apiRef = useGridApiRef();

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getCenters();
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

        //Obtiene los centros de la BD
        const getCenters = async () => {
            try {
                const response = await CenterService.getAll(token);
    
                setCenters(response.data);
                console.log("Centers loaded:", response.data);
            } catch (error) {
                console.error(error);
                errorSnackbar(error.message);
            }
        };

    const updateInvoices = React.useCallback(
        (id) => async () => {
            Swal.fire({
                title: "Estas seguro?",
                text: "Esta accion actualizara las facturas de este proveedor con los centros actuales.",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Si, salvo las editadas manualmente",
                denyButtonText: `Si, todas`,
                icon: "warning",
                }).then((result) => {
                
                //Informacion a enviar al backend
                let data = {
                    supplier_id: id,
                    manual: false
                };
                if (result.isConfirmed) {
                    SupplierService.updateCentersOnInvoices(token, data)
                    .then(() => {
                        successSnackbar("Centros actualizados correctamente en las facturas", "success");
                    })
                    .catch((error) => {
                        errorSnackbar(error.message, "Error al actualizar los centros");
                    });
                } else if (result.isDenied) {
                    let data = {
                        supplier_id: id,
                        manual: true
                    };
                    SupplierService.updateCentersOnInvoices(token, data)
                    .then(() => {
                        successSnackbar("Centros actualizados correctamente en las facturas", "success");
                    })
                    .catch((error) => {
                        errorSnackbar(error.message, "Error al actualizar los centros");
                    });
                }
            });
        }
    , []);

    const editSupplier = React.useCallback(
        (params) => () => {
            navigate(`/suppliers/${params.id}`, {state: { objectID: params.row }});
        }
    , []);

    const viewInvoices = React.useCallback(
        (id) => () => {
            navigate(`/invoices?supplierID=${id}`,);
        }
    , []);

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