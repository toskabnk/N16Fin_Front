import React, { useEffect, useState } from 'react';
import { Box, Container, FormGroup, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import FormikTextField from '../../components/FormikTextField';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../../redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, IconButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { login } from '../../services/authService';
import backgroundImage from '../../assets/background.jpg';

/**
 * Pagina de login
 * @returns {JSX.Element} Pagina de login
 */
function Login() {
  //Variables
  const [isLoading, setIsLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  //Obtener datos del store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const role = useSelector((state) => state.user.role)

  //Dispatch para ejecutar acciones y navigate para redireccionar
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Validacion de formulario
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
validationSchema: Yup.object().shape({
      email: Yup.string().email('Formato de email inválido').required('Requerido'),
      password: Yup.string().min(4, 'Debe ser de 4 caracteres o más').required('Requerido'),
    }),
    onSubmit: async (values) => {
      await handleLogin(values);
    }
  })

  //Funcion para iniciar sesion
  const handleLogin = async (values) => {
    //Cambia el estado del boton de submit
    setIsLoading(true);

    try {
      //Ejecuta login y obtiene los datos si se ejecuta correctamente
      const loginData = await login(values);
      console.log(loginData);
      setIsLoading(false);

      //Guarda los datos del usuario en el store
      let userData = {
        id: loginData.user.id,
        name: loginData.user.name,
        role: loginData.user.user_role,
        token: loginData.authorisation.token,
        isAuthenticated: true,
      }
      dispatch(addUser(userData));

      //Si hay un error, muestra una alerta y cambia el estado del boton de submit
    } catch (error) {
      console.error('Failed to login:', error);
      setOpenAlert(true);
      setIsLoading(false);
    }
  };

  //Redireccionar a la pagina correspondiente segun el rol del usuario
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <form onSubmit={formik.handleSubmit}
      style={{
        display: "flex", justifyContent: "center", alignItems: "center", width: "100%",
      }}
    >
      <Container
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
          flexDirection: "row",

        }}
      >
        <Box sx={{
          bgcolor: "white",
          p: 0,
          borderRadius: "5px",
          boxShadow: "2px 2px 10px gray",
          maxWidth: "sm",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 0,
        }}>

          <img src={backgroundImage} alt="logo"
            style={{
              width: "30%", height: "auto", objectFit: 'cover', flexGrow: '1',
              objectPosition: '0% 50%'

            }}
          />

          <Box sx={{ flexGrow: '1', p: 3 }}>

            <a href="/login" target="_blank" rel="noreferrer"
              style={{
                fontWeight: "700",
                fontSize: "25px",
                color: "#000865",
                fontFamily: "sans-serif",
                textDecoration: "none", 
              }}>
              N
              <span style={{
                fontWeight: "300",
                color: "#6571ff"
              }}
              >16Fin
              </span>

            </a>

            <Typography variant="h6" color="text.text" align="left">
              ¡Bienvenido de nuevo! Ingresa tus credenciales para continuar.
            </Typography>


            <Collapse in={openAlert} sx={{ width: "100%" }}>
              <Alert
                variant="outlined"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpenAlert(false);
                    }}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                severity="error">
                Credenciales incorrectas
              </Alert>
            </Collapse>
            <Box sx={{ width: "100%", mt: 3 }}>
              <FormGroup>
                <FormikTextField
                  label="Email"
                  type="username"
                  id="email"
                  name="email"
                  required
                  formik={formik}
                  sx={{
                    width: "100%",
                    mt: 0.5,
                    border: "1px solid gray.300",
                    borderRadius: "5px",
                  }}
                />
              </FormGroup>
              <FormGroup>
                <FormikTextField
                  label="Contraseña"
                  type="password"
                  id="password"
                  name="password"
                  required
                  formik={formik}
                  sx={{
                    width: "100%",
                    mt: 0.5,
                    border: "1px solid gray.300",
                    borderRadius: "5px",
                  }}
                />
              </FormGroup>
              <LoadingButton
                loading={isLoading}
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Login
              </LoadingButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </form >
  );
}

export default Login;