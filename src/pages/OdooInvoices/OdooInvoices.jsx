import ListDataGrid from "../../components/ListDataGrid";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import React, { Fragment, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InvoiceService from "../../services/invoiceService";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { months } from "../../js/constants";
import { GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function OdooInvoices() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const navigate = useNavigate();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'id', headerName: 'ID', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'invoice_date', headerName: 'Fecha', type:'date', flex: 1, resizable: true, overflow: 'hidden',
            valueGetter: (value) =>
                value ? dayjs(value).toDate() : null,
        },
        { field: 'amount_total', headerName: 'Total', type:'number', flex: 1, editable: true, resizable: true, overflow: 'hidden',
            valueFormatter: (value) => {
                if (value == null) {
                  return '';
                }
                return `${value.toLocaleString()}€`;
            },
        },
        { field: 'partner_id', headerName: 'Cliente', flex: 1, resizable: true, overflow: 'hidden',
            valueGetter: (value) => {
                if (!value) {
                  return value;
                }
                return value[1];
            },
        },
        { field: 'state', headerName: 'Estado', flex: 1, resizable: true, overflow: 'hidden'},
        { field: 'not_added', type: 'boolean', headerName: 'En Sistema', flex: 1, resizable: true, overflow: 'hidden',
            valueGetter: (value) => {
                if (value == null) {
                  return true;
                }
                return !value;
            },
         },
        { field: 'actions', headerName: 'Acciones', type: 'actions', flex: 1, resizable: true, overflow: 'hidden',
            getActions: (params) => [
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label= 'Borrar'
                        onClick ={deleteInvoice(params.id)}
                    />,
                    <GridActionsCellItem
                        icon={<RestoreIcon />}
                        label= 'Añadir'
                        onClick ={resetInvoice(params.id)}
                    />,

            ],
        },
    ]);
    //Loading state
    const [loading, setLoading] = useState(true);
    //API ref
    const apiRef = useGridApiRef();

    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token){
            getInvoices();
        }
    }, [token]);

    //Obtiene las facturas de la BD
    const getInvoices = async () => {
        try {
            const response = await InvoiceService.viewOdooIncoices(token);

            setRows(response.data);
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            errorSnackbar(error.message);
        }
    };

    //Funcion para eliminar la factura
    const deleteInvoice = React.useCallback(
        (id) => () => {
            //Muestra un snackbar de confirmacion
            Swal.fire({
                title: "¿Estás seguro?",
                showDenyButton: true,
                confirmButtonText: "Si!",
                denyButtonText: `No`,
                icon: "warning",
            }).then((result) => {
                if (result.isConfirmed) {
                    //Si el usuario confirma, se elimina la factura
                    InvoiceService.delete(token, id)
                        .then(() => {
                            //Actualiza la tabla
                            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
                            successSnackbar("Factura eliminada correctamente");
                        })
                        .catch((error) => {
                            console.error(error);
                            errorSnackbar(error.message)
                        });
                }
            });
        },
        [],
    );

    //Funcion para añadir todas las facturas de Odoo al sistema
    const addAllInvoices = async () => {
        //Muestra un snackbar de confirmacion
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se añadirán todas las facturas de Odoo al sistema.",
            showDenyButton: true,
            confirmButtonText: "Si!",
            denyButtonText: `No`,
            icon: "warning",
        }).then((result) => {
            if (result.isConfirmed) {
                //Si el usuario confirma, se añaden las facturas
                Swal.fire({
                    title: 'Añadiendo facturas...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                    })
                InvoiceService.addOdooIncoices(token, "")
                    .then((data) => {
                        successSnackbar("Facturas añadidas correctamente");
                        Swal.close();
                    })
                    .catch((error) => {
                        console.error(error);
                        errorSnackbar(error.message)
                        Swal.close();

                    });
            }
        });
    }

    const resetInvoice = React.useCallback(
        (id) => () => {
            //Muestra un snackbar de confirmacion
            Swal.fire({
                title: "¿Estás seguro?",
                text: "La factura se restaurará a su estado original y se eliminarán los cambios realizados.",
                showDenyButton: true,
                confirmButtonText: "Si!",
                denyButtonText: `No`,
                icon: "warning",
            }).then((result) => {
                if (result.isConfirmed) {
                    //Si el usuario confirma, se elimina la factura
                    InvoiceService.resetOdooInvoice(token, id)
                        .then((data) => {
                            //Actualiza la tabla con la nueva factura
                            setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, ...data.data } : row)));

                            successSnackbar("Factura restaurada correctamente");
                        })
                        .catch((error) => {
                            console.error(error);
                            errorSnackbar(error.message)
                        });
                }
            });
        },
        [],
    );


    return (
        <ListDataGrid
        rows={rows}
        columns={columns}
        name="Facturas"
        subname="Lista"
        url="/invoices"
        buttonName="Añadir Facturas"
        loading={loading}
        noClick={true}
        apiRef={apiRef}
        buttonFunction={addAllInvoices}
    />
    );
}

export default OdooInvoices;