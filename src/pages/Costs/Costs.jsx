import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, Link, Paper, Grid, Checkbox, FormGroup, FormControlLabel, Tooltip } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium"
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useGridApiRef } from "@mui/x-data-grid-premium";
import SaveIcon from '@mui/icons-material/Save';
import { useCenters } from "../../hooks/useCenters";
import { useCostsData } from './useCostsData';
import { useDataGridColumns } from './useDataGridColumns';
import { getTreeDataPath, isCellEditable, getRowClassName } from './dataGridUtils';
import { DATAGRID_CONFIG, DATAGRID_STYLES } from './constants';



function Costs() {
    const { centers } = useCenters();
    const year = useSelector((state) => state.data.year);
    const [selectedCenter, setSelectedCenter] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [quarterFilter, setQuarterFilter] = useState({ q1: true, q2: true, q3: true, anual: true });
    
    const apiRef = useGridApiRef();
    
    // Usar el hook personalizado para la gestión de datos
    const { rows, loading, dirty, costId, loadData, saveData, updateRow } = useCostsData();
    
    // Usar el hook para las columnas
    const { transposedColumns } = useDataGridColumns();

    const toggleQuarter = useCallback((key) => {
        setQuarterFilter((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    // Button appearance logic
    const isDisabled = !selectedCenter || !year || saving || loading || !dirty;
    const buttonColor = costId ? (dirty ? 'warning' : 'primary') : (dirty ? 'success' : 'primary');

    // Auto-resize columns effect
    useEffect(() => {
        if (isEditing || !rows.length) return;
        
        const timer = setTimeout(() => {
            if (apiRef.current) {
                apiRef.current.autosizeColumns({
                    include: ['no-academicos', 'comercial-online', 'teachers'],
                    expand: true,
                    includeHeaders: true,
                    includeOutliers: false,
                    outliersFactor: 1.1,
                });
            }
        }, DATAGRID_CONFIG.AUTOSIZE_DELAY);
        
        return () => clearTimeout(timer);
    }, [rows, isEditing]);

    // Load data when dependencies change
    useEffect(() => {
        loadData(selectedCenter, quarterFilter);
    }, [selectedCenter, quarterFilter, loadData]);









    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await saveData(selectedCenter, apiRef);
        } finally {
            setSaving(false);
        }
    }, [saveData, selectedCenter, apiRef]);



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
                            {isDisabled && selectedCenter ? (
                                <Tooltip title="Introduce algún dato">
                                    <span>
                                        <Button
                                            variant="contained"
                                            color={buttonColor}
                                            loadingPosition="start"
                                            loading={saving}
                                            startIcon={<SaveIcon />}
                                            disabled={isDisabled}
                                            onClick={handleSave}
                                        >
                                            {saving
                                                ? "Guardando..."
                                                : costId
                                                    ? dirty
                                                        ? "Actualizar"
                                                        : "Actualizar"
                                                    : dirty
                                                        ? "Crear"
                                                        : "Crear"}
                                        </Button>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Button
                                    variant="contained"
                                    color={buttonColor}
                                    loadingPosition="start"
                                    loading={saving}
                                    startIcon={<SaveIcon />}
                                    disabled={isDisabled}
                                    onClick={handleSave}
                                >
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
                            )}
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
                            {/* Quarter / Annual filters */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, ml: 2 }}>
                                <FormGroup row>
                                    <FormControlLabel control={<Checkbox checked={quarterFilter.q1} onChange={() => toggleQuarter('q1')} />} label="1Q (Sep-Dic)" />
                                    <FormControlLabel control={<Checkbox checked={quarterFilter.q2} onChange={() => toggleQuarter('q2')} />} label="2Q (Ene-Abr)" />
                                    <FormControlLabel control={<Checkbox checked={quarterFilter.q3} onChange={() => toggleQuarter('q3')} />} label="3Q (May-Ago)" />
                                    <FormControlLabel control={<Checkbox checked={quarterFilter.anual} onChange={() => toggleQuarter('anual')} />} label="Anual" />
                                </FormGroup>
                            </Box>

                            <DataGridPremium
                                rows={rows}
                                columns={transposedColumns}
                                apiRef={apiRef}
                                treeData
                                getTreeDataPath={getTreeDataPath}
                                groupingColDef={{ 
                                    headerName: 'Período / Tipo', 
                                    flex: DATAGRID_CONFIG.GROUPING_COLUMN_FLEX, 
                                    minWidth: DATAGRID_CONFIG.GROUPING_COLUMN_MIN_WIDTH 
                                }}
                                defaultGroupingExpansionDepth={1}
                                onRowEditStart={() => setIsEditing(true)}
                                onRowEditStop={() => setIsEditing(false)}
                                initialState={{
                                    pagination: { paginationModel: { page: 0, pageSize: DATAGRID_CONFIG.DEFAULT_PAGE_SIZE } },
                                    sorting: { sortModel: [] },
                                    columns: { columnVisibilityModel: { mes: false, campo: false } }
                                }}
                                pageSizeOptions={DATAGRID_CONFIG.PAGE_SIZE_OPTIONS}
                                loading={loading}
                                slotProps={{
                                    loadingOverlay: { variant: 'linear-progress', noRowsVariant: 'linear-progress' },
                                }}
                                editMode="cell"
                                processRowUpdate={updateRow}
                                onProcessRowUpdateError={(error) => {
                                    console.error('Error updating row:', error);
                                }}
                                isCellEditable={isCellEditable}
                                getRowClassName={getRowClassName}
                                disableColumnResize={false}
                                columnResizeMode="onHover"
                                sx={DATAGRID_STYLES}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default Costs;
