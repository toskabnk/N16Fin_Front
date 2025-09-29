import { useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";
import ListDataGrid from "../../components/ListDataGrid";
import { useConcepts } from "../../hooks/useConcepts";

function Concepts() {
    //Hooks
    const { concepts, loadingConcepts } = useConcepts();
    //Row data for the table
    const [columns, setColumns] = useState([
        { field: 'name', headerName: 'Nombre', type:'string', flex: 1, resizable: true, overflow: 'hidden' },
    ]);
    //API ref
    const apiRef = useGridApiRef();

    return (
        <ListDataGrid
            rows={concepts}
            columns={columns}
            name="Conceptos"
            subname="Lista"
            url="/concepts"
            buttonName="Nuevo concepto"
            loading={loadingConcepts}/>
    );
}

export default Concepts;