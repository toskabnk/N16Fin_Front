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

function Invoices() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const navigate = useNavigate();
    //Token
    const token = useSelector((state) => state.user.token);
    //Row data for the table
    const [rows, setRows] = useState([]);
    //Columns for the table
    const [columns, setColumns] = useState([
        { field: 'odoo_invoice_id', headerName: 'ID', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'reference', headerName: 'Referencia', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'month', headerName: 'Mes', type:'singleSelect', flex: 1, editable: true, resizable: true, overflow: 'hidden',
            valueOptions: months,
            valueGetter: (params) => {
                return parseInt(params, 10)
            },
            valueFormatter: (params) => {
                const found = months.find((m) => m.value === params);
                return found ? found.label : params;
              },
              // Convierte de número a string (o lo que necesites) al guardar
            valueParser: (value) => value.toString(),
        },
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
        { field: 'supplier', headerName: 'Cliente', flex: 1, resizable: true, overflow: 'hidden',
            valueGetter: (value) => {
                if (!value) {
                  return value;
                }
                return value.name;
            },
        },
        { field: 'manual', headerName: 'Manual', type:'boolean', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'centers', headerName: 'Centros', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'actions', headerName: 'Acciones', type: 'actions', flex: 1, resizable: true, overflow: 'hidden',
            getActions: (params) => [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label= 'Editar'
                        onClick ={editInvoice(params)}
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label= 'Borrar'
                        onClick ={deleteInvoice(params.id)}
                    />,
                    <GridActionsCellItem
                        icon={<RestoreIcon />}
                        label= 'Restaurar'
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
            const response = await InvoiceService.getAll(token);

            setRows(response.data);
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            errorSnackbar(error.message);
        }
    };

    //Actualiza la fila de la tabla
    const handleRowUpdate = async (newRow, oldRow) => {
        try {
            //Al actualizar la fila se le añade el campo manual para saber que ha sido editada manualmente
            newRow.manual = true;

            //Si el mes es un string, se convierte a un numero
            if (typeof newRow.month === 'number') {
                newRow.month = newRow.month.toString();
            }

            //Mandamos la peticion a la API para actualizar la fila
            await InvoiceService.update(token, newRow.id, newRow);
            //Actualizamos la fila en la tabla
            setRows((prevRows) =>
                prevRows.map((row) => (row.id === newRow.id ? { ...row, ...newRow } : row))
            );
        } catch (error) {
            console.error(error);
            setRows((prevRows) =>
                prevRows.map((row) => (row.id === oldRow.id ? { ...row, ...oldRow } : row))
            );
            errorSnackbar(error.message);
        }

        //Cierra el modo de edicion de la fila
        apiRef.current.stopRowEditMode({ id: newRow.id });

        //Devuelve la nueva fila para que se actualice en el estado
        return newRow;
    }

    //Maneja el error al guardar la fila
    const handleRowUpdateError = (error) => {
        console.error('Error al guardar fila:', error);
    };

    //Funcion para editar la factura
    const editInvoice = React.useCallback(
        (params) => () => {
            //Redirige a la pagina de editar factura
            navigate(`/invoices/${params.id}`, { state: { objectID: params.row } });
        },
        [],
    );

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
        buttonName="Nueva Factura"
        loading={loading}
        noClick={true}
        editable={true}
        handleRowUpdate={handleRowUpdate}
        handleRowUpdateError={handleRowUpdateError}
        apiRef={apiRef}
    />
    );
}

export default Invoices;