import { Routes as ReactRoutes, Route } from 'react-router-dom'
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper.jsx';
import NotFound from '../pages/NotFound.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Auth/Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Invoices from '../pages/Invoices/Invoices.jsx';
import InvoiceForm from '../pages/Invoices/InvoiceForm.jsx';
import Suppliers from '../pages/Suppliers/Suppliers.jsx';
import Users from '../pages/Users/Users.jsx';
import UserForm from '../pages/Users/UserForm.jsx';
import OdooInvoices from '../pages/OdooInvoices/OdooInvoices.jsx';
import Centers from '../pages/Centers/Centers.jsx';
import CenterForm from '../pages/Centers/CenterForm.jsx';
import BusinessLines from '../pages/BusinessLines/BusinessLines.jsx';
import BusinessLineForm from '../pages/BusinessLines/BusinessLineForm.jsx';
import ObjectivesAndResults from '../pages/Objectives/ObjectivesAndResults.jsx';
import SupplierForm from '../pages/Suppliers/SupplierForm.jsx';
import Profile from '../pages/Profile/Profile.jsx';

/**
 * Rutas de la aplicacion
 * @returns {JSX.Element} Rutas de la aplicacion
 */
const Routes = () => {
    return (
        <ErrorBoundaryWrapper>
            <ReactRoutes>
                {/* Rutas publicas */}
                <Route path="/login" element={<Login />} />
                <Route  element={<ProtectedRoute/>} >
                    {/* Rutas protegidas */}
                        <Route path="/dashboard" element={<Home/>} />
                        <Route path="/invoices" element={<Invoices/>} />
                        {/* <Route path="/OdooInvoices" element={<OdooInvoices/>} /> */}
                        <Route path="/invoices/:id" element={<InvoiceForm/>} />
                        <Route path="/suppliers" element={<Suppliers/>} />
                        <Route path="/suppliers/:id" element={<SupplierForm/>} />
                        <Route path="/users" element={<Users/>} />
                        <Route path="/users/:id" element={<UserForm/>} />
                        <Route path="/centers" element={<Centers/>} />
                        <Route path="/centers/:id" element={<CenterForm/>} />
                        <Route path="/business-lines" element={<BusinessLines/>} />
                        <Route path="/business-lines/:id" element={<BusinessLineForm/>} />
                        <Route path="/objectives" element={<ObjectivesAndResults/>} />
                        <Route path="/" element={<Home/>} />
                        <Route path="/profile" element={<Profile/>} />
                    <Route path="*" element={<NotFound/>} />
                </Route>
            </ReactRoutes>
        </ErrorBoundaryWrapper>
    )
}

export default Routes;