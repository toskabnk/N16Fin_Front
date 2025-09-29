import { useState } from "react";
import ListDataGrid from "../../components/ListDataGrid";
import { useCenters } from "../../hooks/useCenters";


function Centers() {
    //Hooks
    const { centers, loadingCenters} = useCenters();
    
    //Row data for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'acronym', headerName: 'Acrónimo', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
        { field: 'city', headerName: 'Ciudad', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);

    return (
        <ListDataGrid
        rows={centers}
        columns={columns}
        name="Centros"
        subname="Lista"
        url="/centers"
        buttonName="Nuevo Centro"
        loading={loadingCenters}
        />
    );
}

export default Centers;
