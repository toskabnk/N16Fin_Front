import { meses, cuatrimestres, months, campos } from './constants';

/**
 * Convierte un valor a número o null si no es válido
 */
export const toNumOrNull = (v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Obtiene el número de mes desde una clave de mes
 */
export const getMesNumFromKey = (key) => {
    const info = months.find((m) => m.key === key);
    return info ? info.value : null;
};

/**
 * Obtiene datos mensuales de forma segura
 */
export const safePickMens = (mensual, mesNum) => {
    if (!mensual) return undefined;
    return mensual[mesNum] ?? mensual[String(Number(mesNum))];
};

/**
 * Calcula las desviaciones mensuales para una fila
 */
export const ensureMonthlyDesv = (row) => {
    meses.forEach((mes) => {
        const p = toNumOrNull(row[`${mes}_presup`]);
        const r = toNumOrNull(row[`${mes}_real`]);
        row[`${mes}_desv`] = p != null && r != null ? p - r : null;
    });
};

/**
 * Aplica resúmenes de cuatrimestres y anual a una fila
 */
export const applySummariesToRow = (row) => {
    // Resúmenes por cuatrimestres
    cuatrimestres.forEach((q) => {
        const sum = (campo) => {
            const vals = q.meses.map((m) => toNumOrNull(row[`${m}_${campo}`]) ?? 0);
            const allNull = q.meses.every((m) => row[`${m}_${campo}`] == null || row[`${m}_${campo}`] === "");
            return allNull ? null : vals.reduce((a, b) => a + b, 0);
        };
        const presup = sum("presup");
        const real = sum("real");
        row[`${q.key}_presup`] = presup;
        row[`${q.key}_real`] = real;
        row[`${q.key}_desv`] = presup != null && real != null ? presup - real : null;
    });

    // Resumen anual
    const sumAnual = (campo) => {
        const vals = meses.map((m) => toNumOrNull(row[`${m}_${campo}`]) ?? 0);
        const allNull = meses.every((m) => row[`${m}_${campo}`] == null || row[`${m}_${campo}`] === "");
        return allNull ? null : vals.reduce((a, b) => a + b, 0);
    };
    const anualPresup = sumAnual("presup");
    const anualReal = sumAnual("real");
    row[`anual_presup`] = anualPresup;
    row[`anual_real`] = anualReal;
    row[`anual_desv`] = anualPresup != null && anualReal != null ? anualPresup - anualReal : null;
};

/**
 * Construye resúmenes para una fila
 */
export const buildResumenes = (row) => {
    const one = (key, label) => ({
        key,
        label,
        presup: toNumOrNull(row[`${key}_presup`]),
        real: toNumOrNull(row[`${key}_real`]),
        desv: toNumOrNull(row[`${key}_desv`]),
    });
    return [
        one("q1", "1Q (Sep-Dic)"), 
        one("q2", "2Q (Ene-Abr)"), 
        one("q3", "3Q (May-Ago)"), 
        one("anual", "Anual")
    ];
};

/**
 * Calcula la suma de valores para un período específico
 */
export const calculatePeriodSum = (rows, periodo, campo, conceptId) => {
    if (cuatrimestres.find(q => q.key === periodo)) {
        // Es un cuatrimestre
        const quarter = cuatrimestres.find(q => q.key === periodo);
        const sum = quarter.meses.reduce((acc, mes) => {
            const mesRow = rows.find(r => r.mesKey === mes && r.campo === campo);
            const value = toNumOrNull(mesRow?.[conceptId]);
            return acc + (value ?? 0);
        }, 0);
        
        const allNull = quarter.meses.every(mes => {
            const mesRow = rows.find(r => r.mesKey === mes && r.campo === campo);
            return mesRow?.[conceptId] == null || mesRow?.[conceptId] === '';
        });
        
        return allNull ? null : sum;
    } else if (periodo === 'anual') {
        // Es anual
        const sum = meses.reduce((acc, mes) => {
            const mesRow = rows.find(r => r.mesKey === mes && r.campo === campo);
            const value = toNumOrNull(mesRow?.[conceptId]);
            return acc + (value ?? 0);
        }, 0);
        
        const allNull = meses.every(mes => {
            const mesRow = rows.find(r => r.mesKey === mes && r.campo === campo);
            return mesRow?.[conceptId] == null || mesRow?.[conceptId] === '';
        });
        
        return allNull ? null : sum;
    }
    
    return null;
};

/**
 * Calcula la desviación entre presupuesto y real
 */
export const calculateDeviation = (presupValue, realValue) => {
    return presupValue != null && realValue != null ? presupValue - realValue : null;
};