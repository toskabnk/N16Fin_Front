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
import { useCenters } from "../../hooks/useCenters";
import { useSuppliers } from "../../hooks/useSupliers";
import OdooCompaniesFilter from "../../components/FilterComponents/OdooCompaniesFilter";
import { useOdooCompanies } from "../../hooks/useOdooCompanies";
import { Chip } from "@mui/material";

function Suppliers() {
    //Hooks
    const { centers } = useCenters();
    const { suppliers, loadingSuppliers,setLoadingSuppliers, getSuppliers } = useSuppliers(false);
    const { odooCompanies, loadingOdooCompanies } = useOdooCompanies();
    const [selectedCompany, setSelectedCompany] = useState('');
    const navigate = useNavigate();
    //API ref
    const apiRef = useGridApiRef();
    
    //Row data for the table
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
        { field: 'new', headerName: 'Nuevo', flex: 1, renderCell: (params) => {
            return params.row.new ? (
                <Chip label="Nuevo" color="success" size="small" />
            ) : (
                <></>
            );
        }},
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

    useEffect(() => {
        console.log("Selected company changed:", selectedCompany);
        if(selectedCompany) {
            setLoadingSuppliers(true);
            getSuppliers(selectedCompany);
        }
    }, [selectedCompany]);

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
    rows={suppliers}
    columns={columns}
    name="Proveedores"
    subname="Lista"
    url="/suppliers"
    buttonName="Nuevo Proveedor"
    loading={loadingSuppliers}
    filterComponent={<OdooCompaniesFilter selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} companies={odooCompanies} />}

    noClick={true}

/>
  );
}

export default Suppliers;