import { useEffect, useState } from 'react';
import { StyledFlexFull, StyledFlexFullRow } from './styles/StyledContainers'
import SidebarComponent from './components/Sidebar';
import Routes from './routes/Routes';
import HeaderBar from './components/HeaderBar';
import { useDispatch, useSelector } from 'react-redux';
import YearService from './services/yearService';
import { setYear, setYears } from './redux/dataSlice';

function App() {
  //Variables
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();


  //Obtener datos del store para saber si el usuario esta autenticado
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  //Token
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    // Si el usuario no esta autenticado, colapsa la barra lateral
    if (isAuthenticated) {
      getCurrentYear();
      getYears();
    }
  }, [isAuthenticated]);

  // Funcion para obtener el año actual
  const getCurrentYear = async () => {
    try {
      const currentYear = await YearService.getCurrentYear(token);
      dispatch(setYear(currentYear.data.year));
    } catch (error) {
      console.error('Error fetching current year:', error);
    }
  };

  const getYears = async () => {
    try {
      const years = await YearService.getAll(token);
      dispatch(setYears(years.data));
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  return (
    <StyledFlexFull height='100%'>
      {isAuthenticated ?
      <HeaderBar
        isAuthenticated={isAuthenticated}
        collapsed={collapsed}
        setCollapsed={setCollapsed} />
        : null}
      <StyledFlexFullRow height='100%'>
        {/* Muestra la barra lateral si esta logueado*/}
        {isAuthenticated ?
          <SidebarComponent
            openSidebar={collapsed}
            setOpenSidebar={setCollapsed} />
          : null}
        <Routes />
      </StyledFlexFullRow>
    </StyledFlexFull>
  )
}

export default App