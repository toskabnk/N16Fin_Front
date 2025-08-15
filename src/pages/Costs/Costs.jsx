import { Box, Button, FormControl, InputLabel, Select, MenuItem, TextField, Typography, Link, Paper, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useGridApiRef } from "@mui/x-data-grid";
import CenterCostService from "../../services/CenterCostService";
import CenterService from "../../services/centerService";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import SaveIcon from '@mui/icons-material/Save';

const meses = ["sep", "oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago"];
const cuatrimestres = [
    { key: "q1", label: "1Q (Sep-Dic)", meses: ["sep", "oct", "nov", "dic"] },
    { key: "q2", label: "2Q (Ene-Abr)", meses: ["ene", "feb", "mar", "abr"] },
    { key: "q3", label: "3Q (May-Ago)", meses: ["may", "jun", "jul", "ago"] },
];
const months = [
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
const getMesNumFromKey = (key) => {
    const info = months.find((m) => m.key === key);
    return info ? info.value : null;
};
const safePickMens = (mensual, mesNum) => {
    if (!mensual) return undefined;
    return mensual[mesNum] ?? mensual[String(Number(mesNum))];
};
const anual = { key: "anual", label: "Anual", meses };
const campos = ["presup", "real", "desv"];

// Conceptos fijos
const CONCEPTS = [
    { id: "no-academicos", nombre: "No Académicos", tipo: "editable" },
    { id: "comercial-online", nombre: "Comercial Online", tipo: "editable" },
    { id: "teachers", nombre: "Teachers", tipo: "editable" },
];

// ---- COLUMNS con flex ----
const columns = [
    { field: "nombre", headerName: "Concepto", flex: 1.4, minWidth: 220, editable: false },
    ...cuatrimestres.flatMap((cuatri) =>
        cuatri.meses
            .flatMap((mes) =>
                campos.map((campo) => ({
                    field: `${mes}_${campo}`,
                    headerName: `${mes.toUpperCase()} ${campo.toUpperCase()}`,
                    flex: 1,
                    minWidth: 90,
                    editable: campo === "presup" || campo === "real",
                }))
            )
            .concat(
                campos.map((campo) => ({
                    field: `${cuatri.key}_${campo}`,
                    headerName: `${cuatri.label} ${campo.toUpperCase()}`,
                    flex: 1,
                    minWidth: 110,
                    editable: false,
                    cellClassName: "resumen-col",
                }))
            )
    ),
    ...campos.map((campo) => ({
        field: `${anual.key}_${campo}`,
        headerName: `${anual.label} ${campo.toUpperCase()}`,
        flex: 1,
        minWidth: 110,
        editable: false,
        cellClassName: "resumen-col",
    })),
];

// === helpers numéricos y cálculos ===
const toNumOrNull = (v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const ensureMonthlyDesv = (row) => {
    meses.forEach((mes) => {
        const p = toNumOrNull(row[`${mes}_presup`]);
        const r = toNumOrNull(row[`${mes}_real`]);
        row[`${mes}_desv`] = p != null && r != null ? r - p : null;
    });
};

const applySummariesToRow = (row) => {
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
        row[`${q.key}_desv`] = presup != null && real != null ? real - presup : null;
    });

    const sumAnual = (campo) => {
        const vals = meses.map((m) => toNumOrNull(row[`${m}_${campo}`]) ?? 0);
        const allNull = meses.every((m) => row[`${m}_${campo}`] == null || row[`${m}_${campo}`] === "");
        return allNull ? null : vals.reduce((a, b) => a + b, 0);
    };
    const anualPresup = sumAnual("presup");
    const anualReal = sumAnual("real");
    row[`anual_presup`] = anualPresup;
    row[`anual_real`] = anualReal;
    row[`anual_desv`] = anualPresup != null && anualReal != null ? anualReal - anualPresup : null;
};

const buildResumenes = (row) => {
    const one = (key, label) => ({
        key,
        label,
        presup: toNumOrNull(row[`${key}_presup`]),
        real: toNumOrNull(row[`${key}_real`]),
        desv: toNumOrNull(row[`${key}_desv`]),
    });
    return [one("q1", "1Q (Sep-Dic)"), one("q2", "2Q (Ene-Abr)"), one("q3", "3Q (May-Ago)"), one("anual", "Anual")];
};

function Costs() {
    const token = useSelector((state) => state.user.token);
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState("");
    const year = useSelector((state) => state.data.year);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const apiRef = useGridApiRef();
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    const [isEditing, setIsEditing] = useState(false);
    //datagrid
    const handleRowClick = (params) => {
        console.log(params.row);
        navigate(`${url}/${params.id}`, { state: { objectID: params.row } });
    };
    useEffect(() => {
        if (isEditing) return;
        requestAnimationFrame(() => {
            apiRef.current?.autosizeColumns?.({
                includeHeaders: true,
                includeOutliers: false,
                outliersFactor: 1.2,
            });
        });
    }, [rows, isEditing]);

    // create-or-update & dirty
    const [costId, setCostId] = useState(null);
    const [originalHash, setOriginalHash] = useState("");
    const [dirty, setDirty] = useState(false);

    const hashRows = (rowsToSerialize) => {
        const conceptos = CONCEPTS.map((concept) => {
            const row = rowsToSerialize.find((r) => r.id === concept.id) || {};
            const mensual = {};
            meses.forEach((mes) => {
                const info = months.find((m) => m.key === mes);
                const num = info ? info.value : mes;
                mensual[num] = {
                    presup: toNumOrNull(row[`${mes}_presup`]),
                    real: toNumOrNull(row[`${mes}_real`]),
                    desv: toNumOrNull(row[`${mes}_desv`]),
                };
            });
            return { id: concept.id, mensual };
        });
        return JSON.stringify(conceptos);
    };

    useEffect(() => {
        if (!rows?.length) return setDirty(false);
        setDirty(hashRows(rows) !== originalHash);
    }, [rows, originalHash]);

    // Selectores
    useEffect(() => {
        if (!token) return;
        CenterService.getAll(token)
            .then((resp) => setCenters(resp.data))
            .catch((err) => errorSnackbar(err.message));
    }, [token, errorSnackbar]);


    useEffect(() => {
        if (!year) return;
        handleLoad();
    }, [selectedCenter, year]);

    // Fila vacía por concepto
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

    // Construye filas desde backend
    const buildRows = (backendConceptos) => {
        const byName = new Map();
        (backendConceptos || []).forEach((c) => {
            const key = (c.nombre || "").toString().trim().toLowerCase();
            byName.set(key, c);
        });

        return CONCEPTS.map((concept) => {
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
    };

    const handleLoad = async () => {
        if (!selectedCenter || !year) return;
        setLoading(true);
        try {
            const resp = await CenterCostService.getByCenterAndYear(selectedCenter, year, token);
            const data = resp?.data ?? resp;
            const conceptos = data?.conceptos ?? null;

            const newRows = buildRows(conceptos);
            setRows(newRows);
            setOriginalHash(hashRows(newRows));
            setCostId(data?.id ?? null);
            if (!conceptos || conceptos.length === 0) successSnackbar("No hay datos guardados. Puedes crearlos.");
        } catch (err) {
            errorSnackbar(err.message || "Error cargando datos");
            const newRows = buildRows(null);
            setRows(newRows);
            setOriginalHash(hashRows(newRows));
            setCostId(null);
        } finally {
            setLoading(false);
        }
    };

    const rowsToPayload = (rowsToSerialize) => {
        const conceptos = CONCEPTS.map((concept) => {
            const row = rowsToSerialize.find((r) => r.id === concept.id) || emptyRowForConcept(concept);
            const mensual = {};
            meses.forEach((mes) => {
                const mesInfo = months.find((m) => m.key === mes);
                const mesNum = mesInfo ? mesInfo.value : mes;
                mensual[mesNum] = {
                    presup: toNumOrNull(row[`${mes}_presup`]),
                    real: toNumOrNull(row[`${mes}_real`]),
                    desv: toNumOrNull(row[`${mes}_desv`]),
                };
            });

            const tmp = { ...row };
            ensureMonthlyDesv(tmp);
            applySummariesToRow(tmp);
            const resumenes = buildResumenes(tmp);

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
    };

    const handleSave = async () => {
        if (!selectedCenter || !year) {
            errorSnackbar("Selecciona centro y año antes de guardar.");
            return;
        }
        try {
            if (apiRef.current?.stopCellEditMode) apiRef.current.stopCellEditMode();
        } catch { }

        const payload = rowsToPayload(rows);
        setSaving(true);
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
        } finally {
            setSaving(false);
        }
    };

    const handleRowUpdate = (newRow) => {
        const updated = { ...newRow };
        ensureMonthlyDesv(updated);
        applySummariesToRow(updated);
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        return updated;
    };

    return (

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
                display="flex"
                alignItems="left"
                p={2}>
                <>
                    <Typography variant="body1" >
                        <Link to={'/costs'} style={{ textDecoration: "none" }}>
                            Gastos de explotacion
                        </Link>
                    </Typography>
                </>
            </Box>
            <Paper>

                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Box
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                            gap={4}
                            p={2}>
                            <Typography variant="h6">Gastos Explotacion</Typography>
                            <Button
                                variant="contained"
                                color={dirty ? "warning" : "primary"}
                                loadingPosition="start"
                                loading={saving}
                                startIcon={<SaveIcon />}
                                disabled={
                                    !selectedCenter || !year || saving || loading || !dirty
                                }
                                onClick={handleSave}>
                                {saving
                                    ? "Guardando..."
                                    : costId
                                        ? dirty
                                            ? "Actualizar cambios"
                                            : "Actualizar"
                                        : dirty
                                            ? "Crear"
                                            : "Crear"}
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                                ml: 2,
                                flexWrap: "wrap",
                                width: "100%",

                            }}
                        >
                            <FormControl sx={{ width: "100%", mr: 4 }}>
                                <InputLabel id="center-select-label">Centro</InputLabel>
                                <Select
                                    labelId="center-select-label"
                                    value={selectedCenter}
                                    label="Centro"
                                    onChange={(e) => setSelectedCenter(e.target.value)}
                                >
                                    {centers.map((center) => (
                                        <MenuItem key={center.id} value={center.id}>
                                            {center.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>



                        </Box>
                    </Grid>

                    <Grid size={12}>
                        <Box
                            gap={4}
                            p={2}
                        >
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                apiRef={apiRef}
                                autosizeAfterMount
                                onRowEditStart={() => setIsEditing(true)}
                                onRowEditStop={() => setIsEditing(false)}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 10 },
                                    },
                                    sorting: { sortModel: [] },
                                }}
                                pageSizeOptions={[5, 10, 20, 50, 100]}
                                {...({ onRowClick: handleRowClick })}
                                loading={loading}
                                slotProps={{
                                    loadingOverlay: {
                                        variant: "linear-progress",
                                        noRowsVariant: "linear-progress",
                                    },
                                }}
                                {...({
                                    editMode: "row",
                                    processRowUpdate: handleRowUpdate,
                                })}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                            {/* OLD CALL
                            <ListDataGrid
                                rows={rows}
                                columns={columns}
                                density="comfortable"
                                name="Gastos explotación"
                                subname="Lista"
                                url="/costs"
                                createButton={false}
                                loading={loading}
                                noClick
                                apiRef={apiRef}
                                editable
                                handleRowUpdate={handleRowUpdate}
                                fillParent
                                showHeader={false}
                            />
                            */}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default Costs;
