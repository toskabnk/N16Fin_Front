import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser } from '../redux/userSlice';
import { logout } from '../services/authService';

/**
 * Crea la barra de navegacion superior
 * @param {*} setCollapsed Para cambiar el estado de la barra lateral
 * @param {*} collapsed Estado de la barra lateral
 * @param {*} isAuthenticated Si el usuario esta autenticado
 * @returns {JSX.Element} Barra de navegacion superior
 */
function HeaderBar({ setCollapsed, collapsed, isAuthenticated }) {
  const theme = useTheme();

  //Variable que controla el menu de usuario
  const [anchorEl, setAnchorEl] = useState(null);

  //Obtener token de usuario logueado
  const token = useSelector((state) => state.user.token)
  const name = useSelector((state) => state.user.name)
  const year = useSelector((state) => state.data.year);

  //Dispatch para ejecutar acciones y navigate para redireccionar
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Funcion para abrir el menu de usuario
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  //Funcion para cerrar el menu de usuario
  const handleCloseUserMenu = (url) => {
    if (url === 'logout') {
      logoutF();
    } else {
      navigate(url);
    }
    setAnchorEl(null);
  };

  //Funcion axuliar para cerrar sesion
  function logoutF() {
    //Mostrar alerta de confirmacion, si confirma se ejecuta logoutUser
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.success.main,
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser();
      }
    })
  }

  //Funcion para cerrar sesion
  async function logoutUser() {
    //Muestra alerta de cargando y ejecuta logout, borrar usuario del store si se ejecuta correctamente
    try {
      Swal.fire({
        title: 'Logging out...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      })
      await logout(token);
      Swal.close();
      dispatch(deleteUser());
      //Si hay un error muestra alerta de error
    } catch (error) {
      Swal.close();
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
        confirmButtonText: 'Ok',
      })
    }
  }

  //Opciones del menu de usuario
  const userOptiones = [
    {
      'name': 'Profile',
      'url': '/profile',
      'icon': <PersonIcon />,
    },
    {
      'name': 'Logout',
      'url': 'logout',
      'icon': <LogoutIcon />,
    }
  ]

  return (
    <AppBar position="static">
      <Toolbar>
        {//Si esta autenticado muestra el boton de menu
          isAuthenticated ?
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => { setCollapsed(!collapsed); }}
            >
              <MenuIcon />
            </IconButton>
            : null}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          N16
        </Typography>
        <Typography variant="h6" sx={{px: 2}}>
          {year ? `Año: ${year}` : 'Cargando año...'}
        </Typography>
        {//Si esta autenticado muestra el menu de usuario
          isAuthenticated ?
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Typography variant="h6" sx={{px: 2}} >
                  {name || ''}
                </Typography>
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={() => handleCloseUserMenu(null)}
              >
                {userOptiones.map((option) => (
                  <MenuItem key={option.name} onClick={() => handleCloseUserMenu(option.url)}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      {option.icon}
                      <Typography textAlign="center">{option.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Menu>
            </div>
            : null}
      </Toolbar>
    </AppBar>
  );
}

export default HeaderBar;