import { useMemo } from 'react';
import { meses, CONCEPTS, DATAGRID_CONFIG } from './constants';

/**
 * Hook para manejar las columnas del DataGrid
 */
export const useDataGridColumns = () => {
    
    const transposedColumns = useMemo(() => [
        { field: 'mes', headerName: 'Período', hide: true },
        { field: 'campo', headerName: 'Tipo', hide: true },
        ...CONCEPTS.map(concept => ({
            field: concept.id,
            headerName: concept.nombre,
            flex: 1,
            minWidth: DATAGRID_CONFIG.MIN_COLUMN_WIDTH,
            editable: (params) => {
                // Solo permitir edición en filas de meses (no resúmenes) y solo presup/real
                return concept.tipo === 'editable' && 
                       meses.includes(params.row.mesKey) && 
                       (params.row.campo === 'presup' || params.row.campo === 'real');
            },
            type: 'number',
            valueFormatter: (value) => {
                if (value == null || value === '') return '';
                return Number(value).toLocaleString('es-ES', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 2 
                });
            },
            cellClassName: (params) => {
                // Aplicar estilos de color solo a las filas de desviación
                if (params.row.campo === 'desv') {
                    const value = Number(params.value);
                    if (isNaN(value) || value === 0) return 'desviacion-row';
                    return value > 0 ? 'desviacion-row desviacion-positiva' : 'desviacion-row desviacion-negativa';
                }
                return '';
            }
        }))
    ], []);

    const columnGroupingModel = useMemo(() => {
        // Sin agrupación de columnas
        return [];
    }, []);

    return {
        transposedColumns,
        columnGroupingModel
    };
};