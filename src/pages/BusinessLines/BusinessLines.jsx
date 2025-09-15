import { useState } from "react";
import ListDataGrid from "../../components/ListDataGrid";
import { useBusinessLines } from "../../hooks/useBusinessLines";

function BusinessLines() {
    //Hooks
    const { businessLines, loadingBusinessLines } = useBusinessLines();

    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'acronym', headerName: 'Acrónimo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'description', headerName: 'Descripcion', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    return (
        <ListDataGrid
            rows={businessLines}
            columns={columns}
            name="Líneas de Negocio"
            subname="Lista"
            url="/business-lines"
            buttonName="Nueva Línea de Negocio"
            loading={loadingBusinessLines}
        />
    );
}

export default BusinessLines;