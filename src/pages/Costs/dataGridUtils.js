import { meses, cuatrimestres, months, CONCEPTS } from './constants';

/**
 * Utilidad para construir el path del tree data
 */
export const getTreeDataPath = (row) => {
    if (meses.includes(row.mesKey)) {
        const mesInfo = months.find(m => m.key === row.mesKey);
        const mesLabel = mesInfo ? mesInfo.label : row.mesKey.toUpperCase();
        return [mesLabel, row.campo.toUpperCase()];
    }
    if (["q1","q2","q3"].includes(row.mesKey)) {
        const cuatri = cuatrimestres.find(c => c.key === row.mesKey);
        return [`Resumen ${cuatri?.label || row.mesKey.toUpperCase()}`, row.campo.toUpperCase()];
    }
    if (row.mesKey === 'anual') {
        return ['Resumen Anual', row.campo.toUpperCase()];
    }
    return [row.mes || 'Sin período', row.campo?.toUpperCase() || ''];
};

/**
 * Verifica si una celda es editable
 */
export const isCellEditable = (params) => {
    const concept = CONCEPTS.find(c => c.id === params.field);
    return concept?.tipo === 'editable' && 
           meses.includes(params.row.mesKey) && 
           (params.row.campo === 'presup' || params.row.campo === 'real');
};

/**
 * Obtiene la clase CSS para una fila
 */
export const getRowClassName = (params) => {
    if (params.row.campo === 'desv') return 'desviacion-row';
    if (params.row.isResumen) return 'resumen-row';
    return '';
};