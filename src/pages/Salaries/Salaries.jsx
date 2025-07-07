import ListDataGrid from "../../components/ListDataGrid";
import { Box, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGridApiRef } from "@mui/x-data-grid";
import CenterSalariesService from "../../services/CenterSalariesService";
import CenterService from "../../services/CenterService";
import yearService from "../../services/yearService";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";

const meses = ["sep", "oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago"];
const cuatrimestres = [
    { key: "q1", label: "1Q (Sep-Dic)", meses: ["sep", "oct", "nov", "dic"] },
    { key: "q2", label: "2Q (Ene-Abr)", meses: ["ene", "feb", "mar", "abr"] },
    { key: "q3", label: "3Q (May-Ago)", meses: ["may", "jun", "jul", "ago"] },
];
const anual = { key: "anual", label: "Anual", meses: meses };
const campos = ["presup", "real", "desv"];

// ---- COLUMNS DEFINICIÓN ÚNICA ----
const columns = [
    { field: "nombre", headerName: "Concepto", width: 250, editable: true },
    ...cuatrimestres.flatMap(cuatri =>
        cuatri.meses.flatMap(mes =>
            campos.map(campo => ({
                field: `${mes}_${campo}`,
                headerName: `${mes.toUpperCase()} ${campo.toUpperCase()}`,
                width: 100,
                editable: campo === "presup" || campo === "real",
            }))
        ).concat(
            campos.map(campo => ({
                field: `${cuatri.key}_${campo}`,
                headerName: `${cuatri.label} ${campo.toUpperCase()}`,
                width: 130,
                editable: campo === "presup" || campo === "real",
                cellClassName: 'resumen-col'
            }))
        )
    ),
    ...campos.map(campo => ({
        field: `${anual.key}_${campo}`,
        headerName: `${anual.label} ${campo.toUpperCase()}`,
        width: 130,
        editable: campo === "presup" || campo === "real",
        cellClassName: 'resumen-col'
    }))
];
// ---- FIN COLUMNS ----

function Salaries() {
    const token = useSelector((state) => state.user.token);
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [rows, setRows] = useState([]);
    const [conceptos, setConceptos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEmptyTable, setShowEmptyTable] = useState(false);
    const apiRef = useGridApiRef();
    const { errorSnackbar } = useSnackbarContext();

    useEffect(() => {
        if (token) {
            CenterService.getAll(token)
                .then(resp => setCenters(resp.data))
                .catch(err => errorSnackbar(err.message));
            yearService.getCurrentYear(token)
                .then(year => setSelectedYear(year.data.year || ""))
                .catch(err => errorSnackbar(err.message));
        }
    }, [token]);

    // Limpia tabla cuando se cambia de centro o año
    useEffect(() => {
        setRows([]);
        setShowEmptyTable(false);
        setConceptos([]);
    }, [selectedCenter, selectedYear]);

    // Sincroniza filas con conceptos
    useEffect(() => {
        setRows(conceptosToRows(conceptos));
    }, [conceptos]);

    const handleCenterChange = (e) => setSelectedCenter(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);

    const handleApply = async () => {
        setLoading(true);
        try {
            const resp = await CenterSalariesService.getByCenterAndYear(selectedCenter, selectedYear, token);
            if (!resp || !resp.conceptos || resp.conceptos.length === 0) {
                setRows([]);
                setConceptos([]);
                setShowEmptyTable(true);
            } else {
                setConceptos(resp.conceptos);
                setShowEmptyTable(false);
            }
        } catch (err) {
            errorSnackbar(err.message);
            setRows([]);
            setConceptos([]);
            setShowEmptyTable(false);
        }
        setLoading(false);
    };

    function conceptosToRows(conceptos) {
        return conceptos.map((concepto, idx) => {
            const fila = {
                id: concepto.id || idx,
                nombre: concepto.nombre,
            };
            meses.forEach(mes => {
                campos.forEach(campo => {
                    fila[`${mes}_${campo}`] = concepto.mensual[mes]?.[campo] ?? "";
                });
            });
            cuatrimestres.forEach(res => {
                campos.forEach(campo => {
                    fila[`${res.key}_${campo}`] = "";
                });
            });
            campos.forEach(campo => {
                fila[`anual_${campo}`] = "";
            });
            return fila;
        });
    }

    function handleAddConcept() {
        const concept = {
            id: Date.now(),
            nombre: "",
            tipo: "editable",
            mensual: {
                sep: {}, oct: {}, nov: {}, dic: {},
                ene: {}, feb: {}, mar: {}, abr: {},
                may: {}, jun: {}, jul: {}, ago: {},
            }
        };
        setConceptos(prev => [...prev, concept]);
    }

    function handleRowUpdate(newRow, oldRow) {
        let recalculatedRow = { ...newRow };
        // Calcula desv para cada mes
        meses.forEach(mes => {
            const presup = recalculatedRow[`${mes}_presup`];
            const real = recalculatedRow[`${mes}_real`];
            recalculatedRow[`${mes}_desv`] =
                (real != null && presup != null && real !== "" && presup !== "") ? real - presup : "";
        });
        // Calcula cada cuatrimestre
        cuatrimestres.forEach(q => {
            campos.forEach(campo => {
                const valores = q.meses.map(mes => +recalculatedRow[`${mes}_${campo}`] || 0);
                const todosNull = q.meses.every(mes => recalculatedRow[`${mes}_${campo}`] == null || recalculatedRow[`${mes}_${campo}`] === "");
                recalculatedRow[`${q.key}_${campo}`] = todosNull ? "" : valores.reduce((a, b) => a + b, 0);
            });
            recalculatedRow[`${q.key}_desv`] =
                (recalculatedRow[`${q.key}_real`] !== "" && recalculatedRow[`${q.key}_presup`] !== "")
                    ? recalculatedRow[`${q.key}_real`] - recalculatedRow[`${q.key}_presup`]
                    : "";
        });
        // Calcula anual
        campos.forEach(campo => {
            const valores = meses.map(mes => +recalculatedRow[`${mes}_${campo}`] || 0);
            const todosNull = meses.every(mes => recalculatedRow[`${mes}_${campo}`] == null || recalculatedRow[`${mes}_${campo}`] === "");
            recalculatedRow[`anual_${campo}`] = todosNull ? "" : valores.reduce((a, b) => a + b, 0);
        });
        recalculatedRow[`anual_desv`] =
            (recalculatedRow[`anual_real`] !== "" && recalculatedRow[`anual_presup`] !== "")
                ? recalculatedRow[`anual_real`] - recalculatedRow[`anual_presup`]
                : "";

        setRows(prevRows => prevRows.map(row =>
            row.id === recalculatedRow.id ? recalculatedRow : row
        ));
        return recalculatedRow;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="center-select-label">Centro</InputLabel>
                    <Select
                        labelId="center-select-label"
                        value={selectedCenter}
                        label="Centro"
                        onChange={handleCenterChange}
                    >
                        {centers.map(center => (
                            <MenuItem key={center.id} value={center.id}>
                                {center.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Año"
                    value={selectedYear}
                    onChange={handleYearChange}
                    sx={{ width: 120 }}
                />
                <Button
                    variant="contained"
                    onClick={handleApply}
                    disabled={!selectedCenter || !selectedYear || loading}
                >
                    Apply
                </Button>
            </Box>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
                {showEmptyTable ? (

                    <p>No existen salarios para este centro y año.</p>

                ) : null}
                <div style={{ width: 3000 }}>

                    <ListDataGrid
                        rows={rows}
                        columns={columns}
                        name="Salarios"
                        subname="Lista"
                        url="/salaries"
                        buttonName="Añadir Salario"
                        buttonFunction={handleAddConcept}
                        loading={loading}
                        noClick={true}
                        apiRef={apiRef}
                        editable={true}
                        handleRowUpdate={handleRowUpdate}
                    />
                </div>
            </Box>
        </Box>
    );
}


export default Salaries;
