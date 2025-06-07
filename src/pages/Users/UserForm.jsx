import { useFormik } from "formik";
import FormGrid from "../../components/FormGrid";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormikTextField from "../../components/FormikTextField";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { Grid } from "@mui/system";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import UserService from "../../services/userService";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import Swal from "sweetalert2";


function UserForm() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Roles disponibles
    const [roles, setRoles] = useState([]);
    //Estado para saber si se está editando o creando un nuevo
    const [isEdit, setIsEdit] = useState(false);
    const userID = location.state?.objectID?.id;
    const { id } = useParams();

    //Esquema de validación de Yup
    function getValidationSchema(isEdit) {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
            email: Yup.string().email("Email no válido").required("Campo requerido"),
            password: isEdit
                ? Yup.string() // No requerido en edición
                : Yup.string().required("Campo requerido"),
            user_role: Yup.string().required("Campo requerido"),
        });
    }

    const formik = useFormik({
        initialValues: {
            id: null,
            name: "",
            email: "",
            password: "",
            user_role: "",
        },
        validationSchema: getValidationSchema(isEdit),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Si es edición, no se envía el campo password
                if(isEdit) {
                    delete values.password;
                }

                const response = isEdit ? await UserService.update(token, userID, values) : await UserService.create(token, values);
                successSnackbar(isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');

                isEdit ? null : formik.resetForm();
            } catch (error) {
                errorSnackbar(error.message, isEdit ? 'Error al actualizar el usuario' : 'Error al crear el usuario');
            } finally {
                setLoading(false);
            }
        },
    });

    //Si hay un usuario en la ubicación, se carga el nombre en el formulario
    useEffect(() => {
        if (id && location.state?.objectID) {
            setIsEdit(true);
            console.log(location.state.objectID);
            const { name, email, user_role } = location.state.objectID;
            formik.setFieldValue("id", id);
            formik.setFieldValue("name", name);
            formik.setFieldValue("email", email);
            formik.setFieldValue("user_role", user_role);
        }
    }, [id, userID]);

    //Roles disponibles
    useEffect(() => {
        if (token) {
            //hardcoded roles, ready to be changed to retrieved ones if needed.
            setRoles(['super_admin', 'admin', 'finance', 'hr', 'sales', 'manager']);
        }
    }, [token]);

    //Funcion para eliminar el usuario
    const handleDelete = async () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setDeleteLoading(true);
                try {
                    await UserService.delete(token, userID);
                    successSnackbar("Usuario eliminado correctamente");
                    navigate('/users');
                } catch (error) {
                    errorSnackbar(error.message, "Error al eliminar el usuario");
                } finally {
                    setDeleteLoading(false);
                }
            }
        });
    };


  return (
    <FormGrid
        formik={formik}
        isEdit={isEdit}
        name="Usuarios"
        url='/users'
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
                id="email"
                type="email"
                label="Email"
                formik={formik}
                required={true}
                fullWidth={true}/>
        </Grid>
        { isEdit ? null : 
        <Grid size={12}>
            <FormikTextField
                id="password"
                type="password"
                label="Contraseña"
                formik={formik}
                required={true}
                fullWidth={true}/>
        </Grid>}
        <Grid size={12}>
            <FormControl 
            margin="normal"
            fullWidth
            error={formik.touched.user_role && Boolean(formik.errors.user_role)}>
                <InputLabel id="userRole-select-label">User Role *</InputLabel>
                <Select
                    labelId="userRole-select-label"
                    label="User Role"
                    name="user_role"
                    value={formik.values.user_role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.user_role && Boolean(formik.errors.user_role)}
                    required
                    variant="outlined"
                >
                    <MenuItem value="" disabled>Select a role</MenuItem>
                    {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{formik.touched.user_role && formik.errors.user_role}</FormHelperText>
            </FormControl>
        </Grid>

    </FormGrid>
  );
}

export default UserForm;