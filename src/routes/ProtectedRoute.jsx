import {useSelector} from "react-redux"
import {Navigate, Outlet, useLocation} from "react-router-dom"

/**
 * Se encarga de proteger las rutas de la aplicacion y redirigir al usuario a la pagina de login si no esta autenticado
 * @param {Object} children Componentes hijos
 * @returns {JSX.Element} Ruta protegida
 */
const ProtectedRoute = ({children}) => {
    //Obtener datos del store
    const user = useSelector((state) => state.user);
    let location = useLocation();

    //Si el usuario no esta autenticado redirige a la pagina de login
    if(!user.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location}} replace />
    }
    return children ? children : <Outlet />;
};

export default ProtectedRoute;