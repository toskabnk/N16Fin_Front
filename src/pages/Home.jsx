import { useNavigate } from "react-router-dom";
import { useSnackbarContext } from "../providers/SnackbarWrapperProvider";
import { useSelector } from "react-redux";
import InvoiceService from "../services/invoiceService";
import { useEffect, useState } from "react";
import { Box, Grid } from "@mui/system";
import KpiComponent from "../components/KpiComponent";
import HeaderPage from "../components/PagesComponents/HeaderPage";


function Home() {
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const navigate = useNavigate();
    //Token
    const token = useSelector((state) => state.user.token);
    //Estados
    const [total, setTotal] = useState(0);
    const [numFacturas, setNumFacturas] = useState(0);
    const [loadingTotal, setLoadingTotal] = useState(true);
    const [loadingNumFacturas, setLoadingNumFacturas] = useState(true);

    //Carga los dashboards
    useEffect(() => {
        if (token) { 
            getTotalMonth();
            getInvoicesToAdd();
        }
    }, [token]);

    const getTotalMonth = async () => {
        try {
            const response = await InvoiceService.getTotalMonth(token, []);
            setTotal(response.data.data.total);
            setLoadingTotal(false);
        } catch (error) {
            errorSnackbar("Error al obtener el total de facturas");
        }
    };

    const getInvoicesToAdd = async () => {
        try {
            const response = await InvoiceService.getInvoicesToAdd(token, []);
            setNumFacturas(response.data.data.num_not_added_invoices);
            setLoadingNumFacturas(false);
        }
        catch (error) {
            errorSnackbar("Error al obtener el número de facturas por añadir");
        }
    }

    return (
        <HeaderPage name="Dashboard" url="/dashboard" subname="Kpis">
            <Box sx={{flexGrow: 1}}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <KpiComponent display="Total del mes" data={total} loading={loadingTotal} unit='€'/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <KpiComponent display="Facturas por añadir" data={numFacturas} loading={loadingNumFacturas} />
                    </Grid>
                </Grid>
            </Box>
        </HeaderPage>
    )
}

export default Home;