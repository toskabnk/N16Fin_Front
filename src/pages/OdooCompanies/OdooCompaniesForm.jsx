import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import FormGrid from "../../components/FormGrid";
import FormikTextField from "../../components/FormikTextField";
import { useFormik } from "formik";
import { Grid } from "@mui/system";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import OdooCompaniesService from "../../services/odooCompaniesService";


function OdooCompaniesForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Roles disponibles
    const [roles, setRoles] = useState([]);
    //Estado para saber si se está editando o creando un nuevo
    const [isEdit, setIsEdit] = useState(false);
    const companyID = location.state?.objectID?.id;
    const { id } = useParams();

    //Esquema de validación de Yup
    function getValidationSchema(isEdit) {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
            description: Yup.string(),
            add_invoices: Yup.boolean(),
        });
    }

    const formik = useFormik({
        initialValues: {
            id: null,
            odoo_id: "",
            name: "",
            description: "",
            add_invoices: false,
        },
        validationSchema: getValidationSchema(isEdit),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await OdooCompaniesService.update(token, companyID, values);
                successSnackbar("Compañía de Odoo guardada correctamente");
                navigate("/odoo-companies");
            } catch (error) {
                console.error(error);
                errorSnackbar("Error al guardar la compañía de Odoo");
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if(id && location.state?.objectID){
            setIsEdit(true);
            console.log(location.state.objectID);
            formik.setValues({
                id: location.state.objectID.id,
                odoo_id: location.state.objectID.odoo_id,
                name: location.state.objectID.name,
                description: location.state.objectID.description,
                add_invoices: location.state.objectID.add_invoices,
            });
        }
    }, [id, companyID]);

    useEffect(() => {
        if(token){
            //getRoles();
        }
    }, [token]);

    return (
        <FormGrid
            formik={formik}
            isEdit={isEdit}
            name="Compañía de Odoo"
            url="/odoo-companies"
            loading={loading}
            setLoading={setLoading}
            onSubmit={formik.handleSubmit}
            noDelete={true}>
            <Grid size={12}>
                <FormikTextField
                    id="odoo_id"
                    type="text"
                    label="ID de Odoo"
                    formik={formik}
                    disabled={true}
                    fullWidth={true}/>
            </Grid>
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
                    id="description"
                    type="text"
                    label="Descripción"
                    formik={formik}
                    fullWidth={true}/>
            </Grid>
            <Grid size={12}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={formik.values.add_invoices} onChange={formik.handleChange} name="add_invoices" />} label="Agregar facturas" />
                </FormGroup>
            </Grid>            
          </FormGrid>
    )
}

export default OdooCompaniesForm;