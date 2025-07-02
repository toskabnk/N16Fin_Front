import { Grid, Skeleton } from "@mui/material";
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

    //Formik para el formulario
    const formik = useFormik({
        initialValues: {
            name: '',
            type: '',
            centers: []
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
                centers: location.state.objectID.centers || []
            });
        }
    }, [supplierID, id]);

    //Al cargar el componente, obtiene los centros
    useEffect(() => {
        getCenters();
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
            onSubmit={formik.handleSubmit}>
                <Grid size={12}>
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
                </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        {loadingCenters ? 
                            <Skeleton variant="rectangular" width={410} height={230} /> : 
                            <TransferList left={left} right={right} setLeft={setLeft} setRight={setRight}/>}
                </Grid>
        </FormGrid>
    )
}

export default SupplierForm;