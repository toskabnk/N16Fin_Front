import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import BusinessLineService from "../../services/businessLineService";
import FormGrid from "../../components/FormGrid";
import FormikTextField from "../../components/FormikTextField";
import { Grid } from "@mui/system";
import { useFormik } from "formik";
import Swal from "sweetalert2";


function BusinessLineForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Estado para saber si se está editando o creando un nuevo
    const [isEdit, setIsEdit] = useState(false);
    const businessLineID = location.state?.objectID?.id;
    const { id } = useParams();

        //Esquema de validación de Yup
    function getValidationSchema(isEdit) {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
            acronym: Yup.string().required("Campo requerido"),
            description: Yup.string().required("Campo requerido"),
        });
    }

    const formik = useFormik({
        initialValues: {
            id: null,
            name: "",
            acronym: "",
            description: "",
        },
        validationSchema: getValidationSchema(isEdit),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = isEdit
                    ? await BusinessLineService.update(token, businessLineID, values)
                    : await BusinessLineService.create(token, values);
                successSnackbar("Operación exitosa");
                navigate("/business-lines");
            } catch (error) {
                console.error(error);
                errorSnackbar(error.message);
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log(location.state?.objectID);
            const { name, acronym, description } = location.state.objectID;
            formik.setFieldValue("id", id);
            formik.setFieldValue("name", name);
            formik.setFieldValue("acronym", acronym);
            formik.setFieldValue("description", description);
        } else {
            setIsEdit(false);
        }
    }, [id, businessLineID]);

    const handleDelete = async () => {
        setDeleteLoading(true);
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await BusinessLineService.delete(token, businessLineID);
                    successSnackbar("Línea de negocio eliminada correctamente");
                    navigate("/business-lines");
                } catch (error) {
                    console.error(error);
                    errorSnackbar(error.message);
                } finally {
                    setDeleteLoading(false);
                }
            } else {
                setDeleteLoading(false);
            }
        })
    }

    return (
        <FormGrid
            formik={formik}
            isEdit={isEdit}
            name="Línea de Negocio"
            url="/business-lines"
            loading={loading}
            onSubmit={formik.handleSubmit}
            loadingDelete={deleteLoading}
            handleDelete={handleDelete}>
                <Grid size={12}>
                    <FormikTextField
                        id="name"
                        label="Nombre"
                        type="text"
                        formik={formik}
                        required={true}
                        fullWidth={true} />
                </Grid>
                <Grid size={12}>
                    <FormikTextField
                        id="acronym"
                        type="text"
                        label="Acrónimo"
                        formik={formik}
                        required={true}
                        fullWidth={true}/>
                </Grid>
                <Grid size={12}>
                    <FormikTextField
                        id="description"
                        label="Descripción"
                        type="text"
                        formik={formik}
                        required={true}
                        fullWidth={true} />
                </Grid>
        </FormGrid>
    )
}

export default BusinessLineForm;