import { useSelector } from "react-redux";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import InvoiceService from "../../services/invoiceService";
import React, { useEffect } from "react";


function OperationCosts() {

    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Token
    const token = useSelector((state) => state.user.token);
    const year = useSelector((state) => state.data.year);


    //Al cargar la pagina carga las companias
    useEffect(() => {
        if(token && year){
            getInvoices();
        }
    }, [token, year]);

        //Obtiene las facturas de la BD
    const getInvoices = async () => {
        try {
            const body = {
                year: year
            };
            const response = await InvoiceService.getOperationCosts(token, body);
            console.log(response);

        } catch (error) {
            console.error(error);
            errorSnackbar(error.message);
        }
    };

    return (
        <div>
            <h1>Operation Costs</h1>
            <p>Details about operation costs will be displayed here.</p>
            <div>
                {/* Button to trigger fetching operation costs */}
                <button onClick={getInvoices}>Fetch Operation Costs</button>
            </div>
        </div>

    );


}

export default OperationCosts;
