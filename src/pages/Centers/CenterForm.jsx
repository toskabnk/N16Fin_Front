import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import Swal from "sweetalert2";
import FormGrid from "../../components/FormGrid";
import { Grid } from "@mui/system";
import { useFormik } from "formik";
import FormikTextField from "../../components/FormikTextField";
import CenterService from "../../services/centerService";


function CenterForm() {
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
    const centerID = location.state?.objectID?.id;
    const { id } = useParams();

    //Esquema de validación de Yup
    function getValidationSchema(isEdit) {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
            acronym: Yup.string().required("Campo requerido"),
            city: Yup.string().required("Campo requerido"),
        });
    }

    const formik = useFormik({
        initialValues: {
            id: null,
            name: "",
            acronym: "",
            city: "",
        },
        validationSchema: getValidationSchema(isEdit),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = isEdit
                    ? await CenterService.update(token, centerID, values)
                    : await CenterService.create(token, values);
                successSnackbar("Operación exitosa");
                navigate("/centers");
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
            const {name, acronym, city} = location.state.objectID;
            formik.setFieldValue("id", id);
            formik.setFieldValue("name", name);
            formik.setFieldValue("acronym", acronym);
            formik.setFieldValue("city", city);
        } else {
            setIsEdit(false);
        }
    } , [id, centerID]);

    const handleDelete = async () => {
        setDeleteLoading(true);
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
                    await CenterService.delete(token, centerID);
                    successSnackbar("Centro eliminado correctamente");
                    navigate("/centers");
                } catch (error) {
                    console.error(error);
                    errorSnackbar(error.message);
                } finally {
                    setDeleteLoading(false);
                }
            } else {
                setDeleteLoading(false);
            }
        });
    };


  return (
    <FormGrid
        formik={formik}
        isEdit={isEdit}
        name="Centros"
        url="/centers"
        loading={loading}
        onSubmit={formik.handleSubmit}
        handleDelete={handleDelete}
        loadingDelete={deleteLoading}>
        <Grid size={12}>
            <FormikTextField
                id="name"
                type="text"
                label="Nombre"
                formik={formik}
                required={true}
                fullWidth={true}/>
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
                id="city"
                type="text"
                label="Ciudad"
                formik={formik}
                required={true}
                fullWidth={true}/>
        </Grid>
    </FormGrid>
  );
}

export default CenterForm;