import { Grid, Paper, Skeleton, Typography,  Checkbox, FormControlLabel } from "@mui/material";
import FormGrid from "../../components/FormGrid";
import TransferList from "../../components/TransferListComponent";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import SupplierService from "../../services/supplierService";
import FormikTextField from "../../components/FormikTextField";
import CenterService from "../../services/centerService";
import Swal from "sweetalert2";
import Autocomplete from "../../components/Forms/Autocomplete";
import CreatableAutocomplete from "../../components/Forms/CreatableAutocomplete";
import ShareTypesService from "../../services/shareTypesService";
import BusinessLineService from "../../services/businessLineService";
import ConceptService from "../../services/conceptService";


function SupplierForm(){
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
    const supplierID = location.state?.objectID?.id;
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Estados para los centros
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [centers, setCenters] = useState([]);
    //Estados para la transfer list
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    //Estados para las lineas de negocio
    const [loadingBusinessLines, setLoadingBusinessLines] = useState(true);
    const [businessLines, setBusinessLines] = useState([]);
    const [businessLineValue, setBusinessLineValue] = useState('');
    const [selectedBusinessLine, setSelectedBusinessLine] = useState(null);
    //Estados para los tipos de reparto
    const [loadingShareTypes, setLoadingShareTypes] = useState(true);
    const [shareTypes, setShareTypes] = useState([]);
    const [shareTypeValue, setShareTypeValue] = useState('');
    const [selectedShareType, setSelectedShareType] = useState(null);
    //Estados para los conceptos
    const [loadingConcepts, setLoadingConcepts] = useState(true);
    const [concepts, setConcepts] = useState([]);
    const [conceptValue, setConceptValue] = useState('');
    const [selectedConcept, setSelectedConcept] = useState(null);

    //Formik para el formulario
    const formik = useFormik({
        initialValues: {
            name: '',
            type: '',
            centers: [],
            only_add_vat: false,
        },
        validationSchema: Yup.object({
            name: Yup.string().required('El nombre es obligatorio'),
            type: Yup.string().required('El tipo es obligatorio'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            //Copia de los valores del formulario
            let formValues = { ...values };
            
            //Guardar en centers los ids de los centros seleccionados en la transfer list
            formValues.centers = right.map(center => center.id);
            try {
                if (isEdit) {
                    //Si es edición, actualiza el proveedor
                    await SupplierService.update(token, id, formValues);
                    successSnackbar('Proveedor actualizado correctamente');
                } else {
                    //Si es creación, crea un nuevo proveedor
                    await SupplierService.create(token, formValues);
                    successSnackbar('Proveedor creado correctamente');
                }
                navigate('/suppliers');
            } catch (error) {
                console.error(error);
                errorSnackbar(error.message);
            } finally {
                setLoading(false);
            }
        }
    });

    //Al cargar la pagina, si hay un ID en la URL, carga el proveedor
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log(location.state.objectID);
            formik.setValues({
                name: location.state.objectID.name,
                type: location.state.objectID.type,
                centers: location.state.objectID.centers || [],
                concept: location.state.objectID.concept || '',
                business_line_id: location.state.objectID.business_line?.id,
                only_add_vat: location.state.objectID.only_add_vat || false,
            });
            if(location.state.objectID.business_line) {
                setSelectedBusinessLine(location.state.objectID.business_line);
                setBusinessLineValue(location.state.objectID.business_line.name);
                formik.setFieldValue("business_line_id", location.state.objectID.business_line.id);
            }
            if(location.state.objectID.concept) {
                setSelectedConcept(location.state.objectID.concept);
                setConceptValue(location.state.objectID.concept);
                formik.setFieldValue("concept", location.state.objectID.concept);
            }
            if(location.state.objectID.share_type) {
                setSelectedShareType(location.state.objectID.share_type);
                setShareTypeValue(location.state.objectID.share_type.name);
                formik.setFieldValue("share_type_id", location.state.objectID.share_type.id);
            }
        }
    }, [supplierID, id]);

    //Al cargar el componente, obtiene los centros
    useEffect(() => {
        getCenters();
        getShareTypes();
        getBusinessLines();
        getConcepts();
    }, [token]);

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

    const getBusinessLines = async () => {
        try {
            setLoadingBusinessLines(true);
            const response = await BusinessLineService.getAll(token);
            setBusinessLines(response.data);
            setLoadingBusinessLines(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar las líneas de negocio");
            setLoadingBusinessLines(false);
        }
    }

    const getConcepts = async () => {
        try {
            setLoadingConcepts(true);
            const response = await ConceptService.getAll(token);
            setConcepts(response.data);
            setLoadingConcepts(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los conceptos");
            setLoadingConcepts(false);
        }
    }

    const handleDelete = async () => {
        setLoadingDelete(true);
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await SupplierService.delete(token, id);
                    successSnackbar("Proveedor eliminado correctamente", "success");
                    navigate("/suppliers");
                } catch (error) {
                    errorSnackbar(error.message, "Error al eliminar el proveedor");
                } finally {
                    setLoadingDelete(false);
                }
            } else {
                setLoadingDelete(false);
            }
        })
    }


    return (
        <FormGrid
            formik={formik}
            name={isEdit ? "Editar Proveedor" : "Crear Proveedor"}
            isEdit={isEdit}
            url='/suppliers'
            loading={loading}
            loadingDelete={loadingDelete}
            handleDelete={handleDelete}
            largeSize={12}>
                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                    <Paper sx={{ padding: 2, marginTop: 2 }} elevation={3}>
                        <Typography variant="h6" gutterBottom>
                            Datos del Proveedor
                        </Typography>
                        <FormikTextField
                            id="name"
                            type="text"
                            label="Nombre"
                            formik={formik}
                            required={true}
                            fullWidth={true}/>
                        <FormikTextField
                            id="type"
                            type="text"
                            label="Tipo"
                            formik={formik}
                            required={true}
                            fullWidth={true}/>
                        <Grid
                            container
                            spacing={2}
                            sx={{ justifyContent: 'center', alignItems: 'center' }}>
                            {loadingCenters ? 
                                <Skeleton variant="rectangular" width={410} height={230} /> : 
                                <TransferList left={left} right={right} setLeft={setLeft} setRight={setRight}/>}
                        </Grid>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                    <Paper sx={{ padding: 2, marginTop: 2 }} elevation={3}>
                        <Typography variant="h6" gutterBottom>
                            Facturacion
                        </Typography>
                        <Autocomplete
                            loading={loadingShareTypes}
                            id="share_type_id"
                            label="Reparto*"
                            options={shareTypes}
                            value={shareTypeValue}
                            setValue={setShareTypeValue}
                            selected={selectedShareType}
                            setSelected={setSelectedShareType}
                            required={true}
                            formik={formik}/>
                        <Autocomplete
                            loading={loadingBusinessLines}
                            id="business_line_id"
                            label="Linea de Negocio"
                            options={businessLines}
                            value={businessLineValue}
                            setValue={setBusinessLineValue}
                            selected={selectedBusinessLine}
                            setSelected={setSelectedBusinessLine}
                            required={true}
                            formik={formik}/>
                        <CreatableAutocomplete
                            id="concept"
                            value={conceptValue}
                            setValue={setConceptValue}
                            options={concepts}
                            label="Concepto*"
                            formik={formik}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id="only_add_vat"
                                    name="only_add_vat"
                                    checked={formik.values.only_add_vat}
                                    onChange={formik.handleChange}
                                    color="primary"
                                />
                            }
                            label="Sólo añadir IVA"
                            sx={{ mt: 1 }} 
                        />
                        
                    </Paper>
                </Grid>
        </FormGrid>
    )
}

export default SupplierForm;