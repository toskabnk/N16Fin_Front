// Configuración de meses y períodos
export const meses = ["sep", "oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago"];

export const cuatrimestres = [
    { key: "q1", label: "1Q (Sep-Dic)", meses: ["sep", "oct", "nov", "dic"] },
    { key: "q2", label: "2Q (Ene-Abr)", meses: ["ene", "feb", "mar", "abr"] },
    { key: "q3", label: "3Q (May-Ago)", meses: ["may", "jun", "jul", "ago"] },
];

export const months = [
    { value: "01", label: "Enero", key: "ene" },
    { value: "02", label: "Febrero", key: "feb" },
    { value: "03", label: "Marzo", key: "mar" },
    { value: "04", label: "Abril", key: "abr" },
    { value: "05", label: "Mayo", key: "may" },
    { value: "06", label: "Junio", key: "jun" },
    { value: "07", label: "Julio", key: "jul" },
    { value: "08", label: "Agosto", key: "ago" },
    { value: "09", label: "Septiembre", key: "sep" },
    { value: "10", label: "Octubre", key: "oct" },
    { value: "11", label: "Noviembre", key: "nov" },
    { value: "12", label: "Diciembre", key: "dic" },
];

export const anual = { key: "anual", label: "Anual", meses };
export const campos = ["presup", "real", "desv"];

// Conceptos de costos
export const CONCEPTS = [
    { id: "no-academicos", nombre: "No Académicos", tipo: "editable" },
    { id: "comercial-online", nombre: "Comercial Online", tipo: "editable" },
    { id: "teachers", nombre: "Teachers", tipo: "editable" },
];

// Configuración del DataGrid
export const DATAGRID_CONFIG = {
    DEFAULT_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [50, 100, 200],
    HEIGHT: '600px',
    AUTOSIZE_DELAY: 100,
    MIN_COLUMN_WIDTH: 120,
    GROUPING_COLUMN_FLEX: 1.5,
    GROUPING_COLUMN_MIN_WIDTH: 200,
};

// Estilos CSS para el DataGrid
export const DATAGRID_STYLES = {
    flex: 1,
    minWidth: 0,
    width: '100%',
    height: DATAGRID_CONFIG.HEIGHT,
    '& .MuiDataGrid-main': {
        '& .MuiDataGrid-columnHeaders': {
            borderBottom: '2px solid #e0e0e0'
        }
    },
    '& .desviacion-row': {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        '& .MuiDataGrid-cell': { fontWeight: 'bold' }
    },
    '& .desviacion-positiva': {
        color: '#2e7d32 !important', // Verde oscuro
        '& .MuiDataGrid-cell': { 
            fontWeight: 'bold',
            color: '#2e7d32 !important'
        }
    },
    '& .desviacion-negativa': {
        color: '#c62828 !important', // Rojo oscuro
        '& .MuiDataGrid-cell': { 
            fontWeight: 'bold',
            color: '#c62828 !important'
        }
    },
    '& .resumen-row': {
        backgroundColor: '#e3f2fd',
        borderTop: '2px solid #1976d2',
        '& .MuiDataGrid-cell': { fontWeight: 600 }
    },
    '& .MuiDataGrid-row--borderBottom': { borderBottom: '1px solid #e0e0e0' }
};