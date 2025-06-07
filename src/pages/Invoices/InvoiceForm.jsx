import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormGrid from "../../components/FormGrid";
import { Grid } from "@mui/system";
import Autocomplete from "../../components/Forms/Autocomplete";
import SupplierService from "../../services/supplierService";
import ShareTypesService from "../../services/shareTypesService";
import FormikTextField from "../../components/FormikTextField";
import { Button, Card, CardHeader, Checkbox, Divider, FormControl, FormControlLabel, FormHelperText, InputAdornment, InputLabel, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Radio, RadioGroup, Select } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import CenterService from "../../services/centerService";
import TransferList from "../../components/TransferListComponent";
import InvoiceService from "../../services/invoiceService";

function InvoiceForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Loading para el botón de borrar
    const [loadingDelete, setLoadingDelete] = useState(false);
    //Estado para saber si se está editando o creando un nuevo
    const [isEdit, setIsEdit] = useState(false);
    //ID del eventType que se encuentra en la ruta
    const { id } = useParams();
    //ID del eventType que se encuentra en la ubicación
    const invoiceID = location.state?.objectID?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Estados para los proveedores
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierValue, setSupplierValue] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    //Estados para las lineas de negocio
    const [businessLines, setBusinessLines] = useState([]);
    //Estados para los tipos de reparto
    const [loadingShareTypes, setLoadingShareTypes] = useState(true);
    const [shareTypes, setShareTypes] = useState([]);
    const [shareTypeValue, setShareTypeValue] = useState('');
    const [selectedShareType, setSelectedShareType] = useState(null);
    //Estados para los centros
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [centers, setCenters] = useState([]);
    //Estado para el mes seleccionado
    const [selectedMonth, setMonthSelected] = useState(null);
    const [selectedMonthValue, setSelectedMonthValue] = useState('');
    //Estados para la transfer list    
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);

    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    //#region Formik
    const formik = useFormik({
        initialValues: {
            id: null,
            odoo_invoice_id: null,
            reference: "",
            month: "",
            invoice_date: null,
            amount_total: 0,
            supplier_id: null,
            manual: false,
            centers: [],
            business_line_id: null,
            share_type_id: null,
            type: "in",
        },
        validationSchema: Yup.object({
            reference: Yup.string().required("Campo requerido"),
            month: Yup.string().required("Campo requerido"),
            invoice_date: Yup.date(),
            amount_total: Yup.number().required("Campo requerido"),
            supplier_id: Yup.string().required("Campo requerido"),
            business_line_id: Yup.string(),
            share_type_id: Yup.string().required("Campo requerido"),
            type: Yup.string().oneOf(["in", "out"], "Tipo de factura inválido").required("Campo requerido"),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                //Copia de los valores del formulario
                let formValues = { ...values };
                //Convertir la fecha a formato 2025-06-01T00:00:00.000+00:00
                if (formValues.invoice_date) {
                    formValues.invoice_date = new Date(formValues.invoice_date).toISOString();
                }
                console.log("Valores del formulario", formValues);
                //Guardar en centers los ids de los centros seleccionados en la transfer list
                formValues.centers = right.map(center => center.id);
                if (isEdit) {
                    await InvoiceService.update(token, id, formValues);
                    console.log("Actualizando factura", formValues);
                    successSnackbar("Factura actualizada correctamente", "success");
                } else {
                    await InvoiceService.create(token, formValues);
                    console.log("Creando factura", formValues);
                    successSnackbar("Factura creada correctamente", "success");
                }
                navigate("/invoices");
            } catch (error) {
                errorSnackbar(error, "Error al guardar la factura");
            } finally {
                setLoading(false);
            }
        },
    });
    //#endregion

    //#region useEffects
    //Carga los proveedores al cargar el componente
    useEffect(() => {
        getSuppliers();
        getShareTypes();
        getCenters();
    }, [token]);

        //Si hay un company en la ubicación, se carga el nombre en el formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log(location.state.objectID);
            const { reference, month, invoice_date, amount_total, type, supplier, manual, centers, business_line, share_type} = location.state.objectID;
            formik.setValues({
                reference: reference,
                amount_total: amount_total,
                manual: manual,
                centers: centers,
                business_line_id: business_line?.id,
                type: type || "in",
            });
            if(supplier) {
                setSelectedSupplier(supplier);
                setSupplierValue(supplier.name);
                formik.setFieldValue("supplier_id", supplier.id);
            }
            if(share_type) {
                setSelectedShareType(share_type);
                setShareTypeValue(share_type.name);
                formik.setFieldValue("share_type_id", share_type.id);
            }
            if(month) {
                console.log(month);
                setMonthSelected(month);
                setSelectedMonthValue(months.find(m => m.value === month)?.label || '');
                formik.setFieldValue("month", month);
            }
            if(invoice_date){
                // Formatear la fecha al formato YYYY-MM-DD
                const formattedDate = new Date(invoice_date).toISOString().split('T')[0];
                formik.setFieldValue("invoice_date", formattedDate);
            }
        }
    }, [id, invoiceID]);

    //Al cargar los centros, los mete en la lista de centros izquierda o derecha segun los centros seleccionados de la factura
    useEffect(() => {
        if (centers.length > 0) {
            const leftCenters = [];
            const rightCenters = [];
            centers.forEach(center => {
                if (formik.values.centers?.includes(center.id)) {
                    rightCenters.push(center);
                }
                else {
                    leftCenters.push(center);
                }
            });
            setLeft(leftCenters);
            setRight(rightCenters);
        }
    }, [centers, formik.values.centers]);

    //#endregion

    //#region Functions
    const getSuppliers = async () => {
        try {
            setLoadingSuppliers(true);
            const response = await SupplierService.getAll(token);
            setSuppliers(response.data);
            setLoadingSuppliers(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los proveedores");
            setLoadingSuppliers(false);
        }
    }

     const getShareTypes = async () => {
        try {
            setLoadingShareTypes(true);
            const response = await ShareTypesService.getAll(token);
            setShareTypes(response.data);
            setLoadingShareTypes(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los tipos de reparticiones");
            setLoadingShareTypes(false);
        }
    }

    const getCenters = async () => {
        try {
            setLoadingCenters(true);
            const response = await CenterService.getAll(token);
            setCenters(response.data);
            setLoadingCenters(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los centros");
            setLoadingCenters(false);
        }
    }

    //#endregion

    return (
        <FormGrid
            formik={formik}
            name={isEdit ? "Editar Factura" : "Crear Factura"}
            isEdit={isEdit}
            url='/invoices'
            loading={loading}
            onSubmit={formik.handleSubmit}>
                    <Grid size={12}>
                        <Autocomplete
                            loading={loadingSuppliers}
                            id="supplier_id"
                            label="Proveedor"
                            options={suppliers}
                            value={supplierValue}
                            setValue={setSupplierValue}
                            selected={selectedSupplier}
                            setSelected={setSelectedSupplier}
                            formik={formik}/>
                        <Autocomplete
                            loading={loadingShareTypes}
                            id="share_type_id"
                            label="Reparto"
                            options={shareTypes}
                            value={shareTypeValue}
                            setValue={setShareTypeValue}
                            selected={selectedShareType}
                            setSelected={setSelectedShareType}
                            formik={formik}/>
                        <FormikTextField
                            id="reference"
                            type="text"
                            label="Referencia"
                            formik={formik}
                            required={true}
                            fullWidth={true}/>
                        <FormControl 
                            fullWidth
                            error={formik.touched.month && Boolean(formik.errors.month)}
                            margin="normal">
                            <InputLabel id="demo-simple-select-helper-label">Mes</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="month"
                                name="month"
                                label="Mes"
                                value={formik.values.month}
                                onChange={(event) => {
                                    if(event.target.value){
                                        console.log(event.target.value);
                                        setMonthSelected(event.target.value);
                                        formik.setFieldValue("month", event.target.value);
                                    }
                                    else {
                                        console.log(event.target.value);
                                        setMonthSelected(null);
                                        formik.setFieldValue("month", '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                fullWidth
                                required
                                error={formik.touched.month && Boolean(formik.errors.month)}
                            >
                                {months.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{formik.touched.month && formik.errors.month}</FormHelperText>
                        </FormControl>
                        <FormikTextField
                            id="invoice_date"
                            type="date"
                            label="Fecha"
                            formik={formik}
                            required={true}
                            fullWidth={true}
                            />
                        <FormikTextField
                            id="amount_total"
                            type="number"
                            label="Cantidad"
                            formik={formik}
                            required={true}
                            fullWidth={true}
                            adorment="€"
                            />
                        <FormControl>
                            <FormLabel id="type-label">Tipo de factura</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="label"
                                name="type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                            >
                                <FormControlLabel value="in" control={<Radio />} label="In" />
                                <FormControlLabel value="out" control={<Radio />} label="Out" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <TransferList left={left} right={right} setLeft={setLeft} setRight={setRight}/>
                </Grid>
            </FormGrid>
    );
}

export default InvoiceForm;