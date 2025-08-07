import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ConceptService from "../../services/conceptService";
import Swal from "sweetalert2";
import FormGrid from "../../components/FormGrid";
import FormikTextField from "../../components/FormikTextField";
import { Grid } from "@mui/system";

function ConceptForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //estado para saber si se está editando o creando un nuevo concepto
    const [isEdit, setIsEdit] = useState(false);
    const conceptID = location.state?.objectID?.id;
    const { id } = useParams();

    //Esquema de validación de Yup
    function getValidationSchema() {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
        });
    }

    const formik = useFormik({
        initialValues: {
            id: null,
            name: "",
        },
        validationSchema: getValidationSchema(),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = isEdit 
                    ? await ConceptService.update(token, conceptID, values)
                    : await ConceptService.create(token, values);
                successSnackbar("Operación exitosa");
                navigate("/concepts");
            } catch (error) {
                console.error(error);
                errorSnackbar(error.message);
            }
            finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if(id && location.state?.objectID) {
            setIsEdit(true);
            console.log(location.state.objectID);
            formik.setFieldValue("id", location.state.objectID.id);
            formik.setFieldValue("name", location.state.objectID.name);
        } else {
            setIsEdit(false);
        }
    }, [id, conceptID]);

    const handleDelete = async () => {
        setDeleteLoading(true);
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await ConceptService.delete(token, conceptID);
                    successSnackbar("Concepto eliminado correctamente");
                    navigate("/concepts");
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
    }

    return (
        <FormGrid
            formik={formik}
            isEdit={isEdit}
            name="Concepto"
            url="/concepts"
            loading={loading}
            onSubmit={formik.handleSubmit}
            loadingDelete={deleteLoading}
            handleDelete={handleDelete}>
                <Grid size={12}>
                    <FormikTextField
                        id="name"
                        type="text"
                        label="Concepto"
                        formik={formik}
                        required={true}
                        fullWidth={true}
                    />
                </Grid>
            </FormGrid>
    );
}

export default ConceptForm;