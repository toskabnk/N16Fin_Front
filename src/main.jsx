import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import Providers from './providers/Providers'
import './index.css'
import App from './App.jsx'
import { LicenseInfo } from '@mui/x-license';

const licenseKey = import.meta.env.VITE_MUI_LICENSE;
if (licenseKey) {
  LicenseInfo.setLicenseKey(licenseKey);
} else {
  console.warn('MUI license key not found. Premium features may not work correctly.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <App/>
      </Providers>
    </BrowserRouter>
  </StrictMode>
)
