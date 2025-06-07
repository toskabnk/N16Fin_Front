import React, { useEffect, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import styled from 'styled-components';

//Iconos
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import WarehouseIcon from '@mui/icons-material/Warehouse';


import { useSelector } from 'react-redux';
import { version } from '../js/version';

const CustomMenuItem = styled(MenuItem)`
  position: relative;
  
  &.ps-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background-color: #1976d2;
  }

  &.ps-active {
    color: #1976d2;
    .pro-icon-wrapper {
      color: #1976d2;
    }
  }

  &:hover {
    color: #1976d2;
    .pro-icon-wrapper {
      color: #1976d2;

    }
    .ps-menu-label {
      transform: translateX(10px);
    }
  }

  .ps-menu-label {
    transition: transform 0.3s ease, color 0.3s ease;
  }
`;

const StyledSidebarFooter = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 20px;
border-radius: 8px;
color: #9c9c9c;
`;

/**
 * Sidebar de la aplicacion
 * @param {*} openSidebar Variable que controla si el sidebar esta abierto o cerrado 
 * @returns {JSX.Element} Sidebar
 */
function SidebarComponent({ openSidebar, setOpenSidebar }) {
  const [responsive, setResponsive] = useState(true);
  const [collapse, setCollapse] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [lastState, setLastState] = useState(false);

  useEffect(() => {
    if (responsive) {
      setCollapse(false);
      setToggled(false);
      setOpenSidebar(false);
    } else {
      setCollapse(lastState);
      setOpenSidebar(lastState);
    }
    console.log('changeResponsive', responsive);
  }, [responsive]);

  useEffect(() => {
    if (responsive) {
      setCollapse(false);
      setToggled(openSidebar);
    }
    else {
      setToggled(false);
      setCollapse(openSidebar);
      setLastState(openSidebar);
    }
    console.log('openSidebar', openSidebar);
    console.log('responsive', responsive);
  }, [openSidebar]);

  const handleBackdropClick = () => {
    setToggled(!toggled);
    setOpenSidebar(!openSidebar);
  }

  const location = useLocation();
  const role = useSelector((state) => state.user.role);

  return (
    <Sidebar backgroundColor="#FAFAFA" collapsed={collapse} toggled={toggled} onBackdropClick={() => handleBackdropClick()} onBreakPoint={(broken) => setResponsive(broken)} breakPoint='sm'>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, marginBottom: '32px' }}>
          {role ? (
            <Menu>
              <CustomMenuItem active={location.pathname === '/dashboard'} component={<Link to="/dashboard" />} icon={<HomeIcon />}> Dashboard</CustomMenuItem>
              <SubMenu label="Facturación" icon={<InsertDriveFileIcon />}>
                <CustomMenuItem active={location.pathname === '/invoices'} component={<Link to="/invoices" />} icon={<DescriptionIcon/>}> Facturas N16Fin </CustomMenuItem>
                <CustomMenuItem active={location.pathname === '/odooInvoices'} component={<Link to="/odooInvoices" />} icon={<ReceiptIcon />}> Facturas Odoo </CustomMenuItem>
                <CustomMenuItem active={location.pathname === '/suppliers'} component={<Link to="/suppliers" />} icon={<WarehouseIcon />}> Proveedores </CustomMenuItem>
              </SubMenu>
              <SubMenu label="Sistema" icon={<SettingsIcon />}>
                <CustomMenuItem active={location.pathname === '/users'} component={<Link to="/users" />} icon={<DescriptionIcon/>}> Usuarios </CustomMenuItem>
                <CustomMenuItem active={location.pathname === '/centers'} component={<Link to="/centers" />} icon={<DescriptionIcon/>}> Centros </CustomMenuItem>
                <CustomMenuItem active={location.pathname === '/business-lines'} component={<Link to="/business-lines" />} icon={<DescriptionIcon/>}> Líneas Negocio </CustomMenuItem>
              </SubMenu>
            </Menu>
          ) : null}
        </div>
        <StyledSidebarFooter>
          {version}
        </StyledSidebarFooter>
      </div>
    </Sidebar>
  )

}

export default SidebarComponent;