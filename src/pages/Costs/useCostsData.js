import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CenterCostService from '../../services/CenterCostService';
import { useSnackbarContext } from '../../providers/SnackbarWrapperProvider';
import { 
    toNumOrNull, 
    getMesNumFromKey, 
    safePickMens, 
    ensureMonthlyDesv, 
    applySummariesToRow,
    calculatePeriodSum,
    calculateDeviation
} from './businessLogic';
import { meses, cuatrimestres, months, campos, CONCEPTS } from './constants';

/**
 * Hook para manejar la lógica de datos de costos
 */
export const useCostsData = () => {
    const token = useSelector((state) => state.user.token);
    const year = useSelector((state) => state.data.year);
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [costId, setCostId] = useState(null);
    const [originalHash, setOriginalHash] = useState("");
    const [dirty, setDirty] = useState(false);

    // Crear fila vacía para un concepto
    const emptyRowForConcept = useMemo(() => {
        const base = {};
        meses.forEach((m) => {
            campos.forEach((c) => (base[`${m}_${c}`] = null));
        });
        cuatrimestres.forEach((q) => {
            campos.forEach((c) => (base[`${q.key}_${c}`] = null));
        });
        campos.forEach((c) => (base[`anual_${c}`] = null));
        return (concept) => ({
            id: concept.id,
            nombre: concept.nombre,
            tipo: concept.tipo,
            ...base,
        });
    }, []);

    // Hash de filas para detectar cambios
    const hashRows = useCallback((rowsToSerialize) => {
        const conceptos = CONCEPTS.map((concept) => {
            const mensual = {};
            meses.forEach((mes) => {
                const info = months.find((m) => m.key === mes);
                const num = info ? info.value : mes;
                
                const presupRow = rowsToSerialize.find(r => r.mesKey === mes && r.campo === 'presup');
                const realRow = rowsToSerialize.find(r => r.mesKey === mes && r.campo === 'real');
                const desvRow = rowsToSerialize.find(r => r.mesKey === mes && r.campo === 'desv');
                
                mensual[num] = {
                    presup: toNumOrNull(presupRow?.[concept.id]),
                    real: toNumOrNull(realRow?.[concept.id]),
                    desv: toNumOrNull(desvRow?.[concept.id]),
                };
            });
            return { id: concept.id, mensual };
        });
        return JSON.stringify(conceptos);
    }, []);

    // Construir filas transpuestas desde el backend
    const buildTransposedRows = useCallback((backendConceptos, quarterFilter) => {
        const byName = new Map();
        (backendConceptos || []).forEach((c) => {
            const key = (c.nombre || "").toString().trim().toLowerCase();
            byName.set(key, c);
        });

        // Construir datos por concepto
        const conceptData = CONCEPTS.map((concept) => {
            const row = emptyRowForConcept(concept);
            const incoming = byName.get(concept.nombre.toLowerCase());
            if (incoming && incoming.mensual) {
                meses.forEach((mesKey) => {
                    const mesNum = getMesNumFromKey(mesKey);
                    const mens = safePickMens(incoming.mensual, mesNum) || {};
                    row[`${mesKey}_presup`] = mens.presup ?? null;
                    row[`${mesKey}_real`] = mens.real ?? null;
                    row[`${mesKey}_desv`] = mens.desv ?? null;
                });
            }
            ensureMonthlyDesv(row);
            applySummariesToRow(row);
            return row;
        });

        // Transponer: crear filas por período y tipo
        const transposedRows = [];
        let rowId = 1;

        // Función helper para crear una fila transpuesta
        const createTransposedRow = (periodo, campo, displayLabel, groupKey = null, isResumen = false) => {
            const row = {
                id: rowId++,
                mes: displayLabel,
                campo: campo,
                mesKey: periodo,
                tipo: campo,
                groupKey: groupKey,
                isResumen
            };
            
            CONCEPTS.forEach((concept) => {
                const conceptRow = conceptData.find(r => r.id === concept.id);
                row[concept.id] = conceptRow ? conceptRow[`${periodo}_${campo}`] : null;
            });
            
            return row;
        };

        // Agrupar por cuatrimestres
        cuatrimestres.forEach((cuatri) => {
            if (quarterFilter[cuatri.key]) {
                // Añadir meses del cuatrimestre
                cuatri.meses.forEach((mes) => {
                    const mesInfo = months.find(m => m.key === mes);
                    const mesLabel = mesInfo ? mesInfo.label : mes.toUpperCase();
                    
                    // Crear una fila por cada tipo de campo (presup, real, desv)
                    campos.forEach((campo) => {
                        transposedRows.push(createTransposedRow(mes, campo, mesLabel, cuatri.key, false));
                    });
                });

                // Añadir resumen del cuatrimestre
                campos.forEach((campo) => {
                    transposedRows.push(createTransposedRow(cuatri.key, campo, cuatri.label, 'resumen', true));
                });
            }
        });

        // Añadir anual si está seleccionado
        if (quarterFilter.anual) {
            campos.forEach((campo) => {
                transposedRows.push(createTransposedRow('anual', campo, 'Anual', 'resumen', true));
            });
        }

        return transposedRows;
    }, [emptyRowForConcept]);

    // Convertir filas a payload para el backend
    const rowsToPayload = useCallback((rowsToSerialize, selectedCenter) => {
        const conceptos = CONCEPTS.map((concept) => {
            const mensual = {};
            meses.forEach((mes) => {
                const mesInfo = months.find((m) => m.key === mes);
                const mesNum = mesInfo ? mesInfo.value : mes;
                
                const presupRow = rowsToSerialize.find(r => r.mesKey === mes && r.campo === 'presup');
                const realRow = rowsToSerialize.find(r => r.mesKey === mes && r.campo === 'real');
                
                const presupValue = toNumOrNull(presupRow?.[concept.id]);
                const realValue = toNumOrNull(realRow?.[concept.id]);
                const desvValue = calculateDeviation(presupValue, realValue);
                
                mensual[mesNum] = {
                    presup: presupValue,
                    real: realValue,
                    desv: desvValue,
                };
            });

            // Calcular resúmenes
            const resumenes = [];
            cuatrimestres.forEach((q) => {
                const sum = (campo) => {
                    const vals = q.meses.map((m) => {
                        const mesInfo = months.find(mi => mi.key === m);
                        const mesNum = mesInfo ? mesInfo.value : m;
                        return toNumOrNull(mensual[mesNum]?.[campo]) ?? 0;
                    });
                    const allNull = q.meses.every((m) => {
                        const mesInfo = months.find(mi => mi.key === m);
                        const mesNum = mesInfo ? mesInfo.value : m;
                        return mensual[mesNum]?.[campo] == null;
                    });
                    return allNull ? null : vals.reduce((a, b) => a + b, 0);
                };
                const presup = sum("presup");
                const real = sum("real");
                resumenes.push({
                    key: q.key,
                    label: q.label,
                    presup: presup,
                    real: real,
                    desv: calculateDeviation(presup, real),
                });
            });

            // Resumen anual
            const sumAnual = (campo) => {
                const vals = meses.map((m) => {
                    const mesInfo = months.find(mi => mi.key === m);
                    const mesNum = mesInfo ? mesInfo.value : m;
                    return toNumOrNull(mensual[mesNum]?.[campo]) ?? 0;
                });
                const allNull = meses.every((m) => {
                    const mesInfo = months.find(mi => mi.key === m);
                    const mesNum = mesInfo ? mesInfo.value : m;
                    return mensual[mesNum]?.[campo] == null;
                });
                return allNull ? null : vals.reduce((a, b) => a + b, 0);
            };
            const anualPresup = sumAnual("presup");
            const anualReal = sumAnual("real");
            resumenes.push({
                key: "anual",
                label: "Anual",
                presup: anualPresup,
                real: anualReal,
                desv: calculateDeviation(anualPresup, anualReal),
            });

            return {
                id: concept.id,
                nombre: concept.nombre,
                tipo: concept.tipo,
                mensual,
                resumenes,
            };
        });

        return {
            center_id: selectedCenter,
            year: String(year),
            conceptos,
        };
    }, [year]);

    // Cargar datos
    const loadData = useCallback(async (selectedCenter, quarterFilter) => {
        if (!selectedCenter || !year) return;
        setLoading(true);
        try {
            const resp = await CenterCostService.getByCenterAndYear(selectedCenter, year, token);
            const data = resp?.data ?? resp;
            const conceptos = data?.conceptos ?? null;

            const newRows = buildTransposedRows(conceptos, quarterFilter);
            setRows(newRows);
            setOriginalHash(hashRows(newRows));
            setCostId(data?.id ?? null);
            if (!conceptos || conceptos.length === 0) {
                successSnackbar("No hay datos guardados. Puedes crearlos.");
            }
        } catch (err) {
            errorSnackbar(err.message || "Error cargando datos");
            const newRows = buildTransposedRows(null, quarterFilter);
            setRows(newRows);
            setOriginalHash(hashRows(newRows));
            setCostId(null);
        } finally {
            setLoading(false);
        }
    }, [year, token, buildTransposedRows, hashRows, errorSnackbar, successSnackbar]);

    // Guardar datos
    const saveData = useCallback(async (selectedCenter, apiRef) => {
        if (!selectedCenter || !year) {
            errorSnackbar("Selecciona centro y año antes de guardar.");
            return;
        }

        try {
            if (apiRef.current?.stopCellEditMode) apiRef.current.stopCellEditMode();
        } catch { }

        const payload = rowsToPayload(rows, selectedCenter);
        
        try {
            if (costId) {
                await CenterCostService.update(token, costId, payload);
                successSnackbar("Actualizado correctamente");
            } else {
                const resp = await CenterCostService.create(token, payload);
                const created = resp?.data ?? resp;
                setCostId(created?.id ?? null);
                successSnackbar("Creado correctamente");
            }
            setOriginalHash(hashRows(rows));
        } catch (err) {
            if (costId && err?.response?.status === 404) {
                try {
                    const resp = await CenterCostService.create(token, payload);
                    const created = resp?.data ?? resp;
                    setCostId(created?.id ?? null);
                    setOriginalHash(hashRows(rows));
                    successSnackbar("No existía, creado correctamente");
                } catch (e) {
                    errorSnackbar(e.message || "Error guardando datos");
                }
            } else {
                errorSnackbar(err.message || "Error guardando datos");
            }
        }
    }, [year, rows, costId, token, rowsToPayload, hashRows, errorSnackbar, successSnackbar]);

    // Actualizar fila con recálculos automáticos
    const updateRow = useCallback((updatedRow) => {
        setRows((prev) => {
            const newRows = [...prev];
            
            // Actualizar la fila actual primero
            const currentRowIndex = newRows.findIndex(r => r.id === updatedRow.id);
            if (currentRowIndex !== -1) {
                newRows[currentRowIndex] = updatedRow;
            }
            
            // Si es una fila de mes y campo presup o real, recalcular desviación
            if (updatedRow.mesKey && meses.includes(updatedRow.mesKey) && 
                (updatedRow.campo === 'presup' || updatedRow.campo === 'real')) {
                
                const desvRowIndex = newRows.findIndex(r => r.mesKey === updatedRow.mesKey && r.campo === 'desv');
                
                if (desvRowIndex !== -1) {
                    const presupRow = newRows.find(r => r.mesKey === updatedRow.mesKey && r.campo === 'presup');
                    const realRow = newRows.find(r => r.mesKey === updatedRow.mesKey && r.campo === 'real');
                    
                    const desvRow = { ...newRows[desvRowIndex] };
                    CONCEPTS.forEach((concept) => {
                        const presupVal = toNumOrNull(presupRow?.[concept.id]);
                        const realVal = toNumOrNull(realRow?.[concept.id]);
                        desvRow[concept.id] = calculateDeviation(presupVal, realVal);
                    });
                    newRows[desvRowIndex] = desvRow;
                }
                
                // Recalcular resúmenes de cuatrimestres y anual
                const currentMes = updatedRow.mesKey;
                const currentQuarter = cuatrimestres.find(q => q.meses.includes(currentMes));
                
                if (currentQuarter) {
                    // Recalcular resumen del cuatrimestre
                    campos.forEach((campo) => {
                        const quarterRowIndex = newRows.findIndex(r => r.mesKey === currentQuarter.key && r.campo === campo);
                        if (quarterRowIndex !== -1) {
                            const quarterRow = { ...newRows[quarterRowIndex] };
                            CONCEPTS.forEach((concept) => {
                                quarterRow[concept.id] = calculatePeriodSum(newRows, currentQuarter.key, campo, concept.id);
                            });
                            newRows[quarterRowIndex] = quarterRow;
                        }
                    });
                }
                
                // Recalcular resumen anual
                campos.forEach((campo) => {
                    const anualRowIndex = newRows.findIndex(r => r.mesKey === 'anual' && r.campo === campo);
                    if (anualRowIndex !== -1) {
                        const anualRow = { ...newRows[anualRowIndex] };
                        CONCEPTS.forEach((concept) => {
                            anualRow[concept.id] = calculatePeriodSum(newRows, 'anual', campo, concept.id);
                        });
                        newRows[anualRowIndex] = anualRow;
                    }
                });
            }
            
            return newRows;
        });
        
        return updatedRow;
    }, []);

    // Detectar cambios
    useEffect(() => {
        if (!rows?.length) return setDirty(false);
        setDirty(hashRows(rows) !== originalHash);
    }, [rows, originalHash, hashRows]);

    return {
        rows,
        loading,
        dirty,
        costId,
        loadData,
        saveData,
        updateRow,
        setRows
    };
};