import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import HeaderPage from "../../components/PagesComponents/HeaderPage";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import { useSelector } from "react-redux";
import { use, useEffect, useState } from "react";
import SaveIcon from '@mui/icons-material/Save';
import UserService from "../../services/userService";
import FormikTextField from "../../components/FormikTextField";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";

function Profile() {
    //Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    //Loading para el LoadingButton
    const [loading, setLoading] = useState(true);
    const [loadingPassword, setLoadingPassword] = useState(false);
    //Estados para el usuario
    const [user, setUser] = useState(null);
    //Configuracion del usuario
    const [numberCheckInvoices, setNumberCheckInvoices] = useState(useSelector((state) => state.data.numberCheckInvoices));
    //Formik para el formulario
    const formik = useFormik ({
        initialValues: {
            id: null,
            name: "",
            email: "",
            user_role: "",
        },
        validationSchema: getValidationSchema, // Aquí podrías definir un esquema de validación si es necesario
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Aquí podrías implementar la lógica para actualizar el perfil del usuario
                // Por ejemplo, llamar a un servicio de actualización de usuario
                console.log("Perfil actualizado:", values);
                successSnackbar("Perfil actualizado correctamente");
            } catch (error) {
                errorSnackbar("Error al actualizar el perfil");
            } finally {
                setLoading(false);
            }
        }
    });

    const formikPassword = useFormik ({
        initialValues: {
            current_password: "",
            password: "",
            confirm_password: "",
        },
        validationSchema: Yup.object({
            current_password: Yup.string().required("Campo requerido"),
            password: Yup.string().required("Campo requerido"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .required("Campo requerido"),
        }),
        onSubmit: async (values) => {
            setLoadingPassword(true);
            try {                
                const response = await UserService.updateUserPassword(token, user.id, {
                    current_password: values.current_password,
                    password: values.password,
                });
                console.log("Contraseña cambiada:", values);
                successSnackbar("Contraseña cambiada correctamente");
            } catch (error) {
                if(error.response && error.response.status === 401) {
                    errorSnackbar("Contraseña actual incorrecta");
                    formikPassword.setFieldError("current_password", "Contraseña actual incorrecta");
                } else {
                    console.error("Error al cambiar la contraseña:", error);
                }
            } finally {
                setLoadingPassword(false);
            }
        }
    });

    const formikConfig = useFormik ({
        initialValues: {
            numberCheckInvoices: 50,
        },
        validationSchema: Yup.object({
            numberCheckInvoices: Yup.number().required("Campo requerido").min(1, "Debe ser al menos 1"),
        }),
        onSubmit: async (values) => {
        }
    });

    //Esquema de validación de Yup
    function getValidationSchema(isEdit) {
        return Yup.object({
            name: Yup.string().required("Campo requerido"),
            email: Yup.string().email("Email no válido").required("Campo requerido"),
        });
    }


    //Carga la informacion del usuario al cargar el componente
    useEffect(() => {
        //Carga la informacion del usuario actual
        if (token) {
            loadMe();
        }
    }, [token]);

    useEffect(() => {
        console.log("User data changed:", numberCheckInvoices);
    }, [numberCheckInvoices]);

    const loadMe = async () => {
        try {
            const response = await UserService.getUserProfile(token);
            // Aquí podrías manejar la respuesta, por ejemplo, actualizar el estado del formulario
            console.log(response);
            setUser(response.data);
            //carga los valores en el formulario
            formik.setValues({
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                user_role: response.data.user_role,
            });
            // Desactiva el loading
            setLoading(false);
        } catch (error) {
            errorSnackbar("Error al cargar el perfil de usuario");
        }
    };

    return (
        <HeaderPage name="Profile" url="/profile" subname="User Information and Settings">
            <Grid container spacing={2} sx={{padding: 2}}>
                <Grid size={{xs: 12, md: 6}}>
                    <Box       
                    gap={4}>
                        <Paper>
                            <Grid container paddingLeft={2} paddingRight={2} spacing={2}>
                                <Grid size={12}>
                                    <Typography variant="h6" component="div" paddingTop={2}>
                                        Información del Usuario
                                    </Typography>
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
                                        id="email"
                                        type="email"
                                        label="Email"
                                        formik={formik}
                                        required={true}
                                        fullWidth={true}/>
                                </Grid>
                                <Grid size={12}>
                                    <FormikTextField
                                        id="user_role"
                                        type="text"
                                        label="Rol"
                                        formik={formik}
                                        required={true}
                                        fullWidth={true}
                                        disabled={true}/>
                                </Grid>
                                <Grid size={12}>
                                    <Box
                                    sx={{display: 'flex', paddingBottom: 2}}>
                                        <Button
                                            onClick={formik.handleSubmit}
                                            variant="contained"
                                            color="success"
                                            sx={{marginRight: 2}}
                                            loading={loading}
                                            disabled={loading}
                                            loadingPosition="start"
                                            startIcon={<SaveIcon />}
                                        >Guardar
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Box gap={4}>
                        <Paper>
                            <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                                <Grid size={12}>
                                    <Typography variant="h6" component="div" paddingTop={2}>
                                        Configuracion
                                    </Typography>
                                </Grid>
                                <Grid size={12}>
                                    <FormikTextField
                                        id="numberCheckInvoices"
                                        type="number"
                                        label="Numero de facturas a comprobar por defecto"   
                                        formik={formikConfig}
                                        required={true}
                                        fullWidth={true}/>
                                </Grid>
                                <Grid size={12}>
                                    <Box
                                    sx={{display: 'flex', paddingBottom: 2}}>
                                        <Button
                                            onClick={formikConfig.handleSubmit}
                                            variant="contained"
                                            color="success"
                                            sx={{marginRight: 2}}
                                            loading={loading}
                                            disabled={loading}
                                            loadingPosition="start"
                                            startIcon={<SaveIcon />}
                                        >Guardar Configuracion
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Grid>
                <Grid size={{xs: 12, md: 6}} >
                    <Box gap={4}>
                        <Paper>
                        <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                            <Grid size={12}>
                                <Typography variant="h6" component="div" paddingTop={2}>
                                    Cambiar Contraseña
                                </Typography>
                            </Grid>
                            <Grid size={12}>
                                <FormikTextField
                                    id="current_password"
                                    type="password"
                                    label="Contraseña Actual"
                                    formik={formikPassword}
                                    required={true}
                                    fullWidth={true}/>
                            </Grid>
                            <Grid size={12}>
                                <FormikTextField
                                    id="password"
                                    type="password"
                                    label="Contraseña Nueva"
                                    formik={formikPassword}
                                    required={true}
                                    fullWidth={true}/>
                            </Grid>
                            <Grid size={12}>
                                <FormikTextField
                                    id="confirm_password"
                                    type="password"
                                    label="Confirmar Contraseña"
                                    formik={formikPassword}
                                    required={true}
                                    fullWidth={true}/>
                            </Grid>
                            <Grid size={12}>
                                <Box
                                sx={{display: 'flex', paddingBottom: 2}}>
                                    <Button
                                        onClick={formikPassword.handleSubmit}
                                        variant="contained"
                                        color="success"
                                        sx={{marginRight: 2}}
                                        loading={loadingPassword}
                                        disabled={loading}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon />}
                                    >Actualizar Contraseña
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </HeaderPage>
    );
}

export default Profile;