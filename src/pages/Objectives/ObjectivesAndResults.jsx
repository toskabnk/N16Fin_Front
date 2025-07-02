import { Autocomplete, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { Box, Grid, Stack } from "@mui/system";import { DataGridPremium, useGridApiRef } from "@mui/x-data-grid-premium";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useSnackbarContext } from "../../providers/SnackbarWrapperProvider";
import BusinessLineService from "../../services/businessLineService";
import CenterService from "../../services/centerService";
import ObjetivesService from "../../services/objetivesService";
import SaveIcon from '@mui/icons-material/Save';

function ObjectivesAndResults() {
    //#region States and Variables
    //Hooks
    const { errorSnackbar, successSnackbar } = useSnackbarContext();
    //Token de usuario
    const token = useSelector((state) => state.user.token);
    //Year
    const year = useSelector((state) => state.data.year);

    const apiRef = useGridApiRef();
    const [rowInEdit, setRowInEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [proccesedRows, setProcessedRows] = useState([]);
    const [columns, setColumns] = useState([]);

    //Business Lines
    const [bussinesLines, setBussinesLines] = useState([]);
    const [businessLineValue, setBusinessLineValue] = useState('');
    const [selectedBusinessLine, setSelectedBusinessLine] = useState(null);
    const [loadingBusinessLines, setLoadingBusinessLines] = useState(true);

    //Centers
    const [centers, setCenters] = useState([]);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [centerValue, setCenterValue] = useState('');

    //Objectives And Results
    const [projectedGrowth, setProjectedGrowth] = useState(1);
    const [notFound, setNotFound] = useState(false);

    //Modifications
    const [enableSave, setEnableSave] = useState(false);
    const [savingModifications, setSavingModifications] = useState(false);

    //Months
    const orderedMonths = ["09", "10", "11", "12", "01", "02", "03", "04", "05", "06", "07", "08"];
    const monthNames = {
        "01": "Enero",
        "02": "Febrero",
        "03": "Marzo",
        "04": "Abril",
        "05": "Mayo",
        "06": "Junio",
        "07": "Julio",
        "08": "Agosto",
        "09": "Septiembre",
        "10": "Octubre",
        "11": "Noviembre",
        "12": "Diciembre"
    };
    //#endregion

    //#region ValueGetters
    //Value getters for the columns
    const getActualObjetives = (value, row) => {
        const realAnterior = row.realAnterior || 0;
        const projected_growth = row.projectedGrowth || 1;
        return (realAnterior * projected_growth).toFixed(2);
    };

    const getDeviationObjectives = (value, row) => {
        const realAnterior = parseFloat(row.realAnterior) || 0;
        const projected_growth = row.projectedGrowth || 1;
        const objetivosActual = realAnterior * projected_growth;

        const realActual = parseFloat(row.realActual) || 0;
        return objetivosActual !== 0
            ? ((realActual / objetivosActual) * 100).toFixed(2) + '%'
            : '0%';
    };

    const getDeviationYearBefore = (value, row) => {
        const realAnterior = parseFloat(row.realAnterior) || 0;
        const realActual = parseFloat(row.realActual) || 0;
        return realAnterior !== 0 ? ((realActual / realAnterior) * 100).toFixed(2) + '%' : '0%';
    };
    //#endregion

    //#region Columns
    //Columns for the DataGrid
    const columnsObjCenters = [
        { field: 'month', headerName: businessLineValue, type:'string', flex: 1, resizable: true, overflow: 'hidden',},
        { field: 'realAnterior', headerName: 'Resultado Año Anterior', type:'number', flex: 1, editable: true },
        { field: 'objetivosActual', headerName: 'Objetivos Año Actual', flex: 1,type:'number', valueGetter: getActualObjetives},
        { field: 'realActual', headerName: 'Real Año Actual', flex: 1,type:'number', editable: true},
        { field: 'desviacionObj', headerName: 'Desviacion % Obj', flex: 1, valueGetter: getDeviationObjectives},
        { field: 'desviacionAnterior', headerName: 'Desviacion % Año Anterior', flex: 1, valueGetter: getDeviationYearBefore},
    ];
    //#endregion

    //#region UseEffects
    //Get the business lines and centers when the component mounts
    useEffect(() => {
        getBussinesLines();
        getCenters();
    }, [token]);

    //Get the objectives and results when the business line or center changes
    useEffect(() => {
        console.log("Edit mode:", rowInEdit);

        //If there is a row in edit mode, stop the edit mode ignoring the modifications
        if (rowInEdit !== null) {
            apiRef.current.stopRowEditMode({ id: rowInEdit, ignoreModifications: true,});
            setRowInEdit(null);
        }

        //Disable the save button
        setEnableSave(false);

        //If there are a business line selected, get the objectives and results
        if (selectedBusinessLine) {
            getObjectivesAndResults();
        }

    }, [selectedBusinessLine, selectedCenter, year]);

    useEffect(() => {
        const processed = rows.map(row => ({
            ...row,
            objetivosActual: Number((row.realAnterior || 0) * (row.projectedGrowth || 1)),
            // Puedes calcular aquí desviaciones también si quieres
        }));

        const totalRow = getTotalRow(processed);
        setProcessedRows([...processed, totalRow]);
    }, [rows]);
    //#endregion

    const getBussinesLines = async () => {
        try {
            setLoadingBusinessLines(true);
            const response = await BusinessLineService.getAll(token);
            setBussinesLines(response.data);
            setLoadingBusinessLines(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar las lineas de negocio");
            setLoadingBusinessLines(false);
        }
    }

    const getCenters = async () => {
        try {
            setLoadingCenters(true);
            const response = await CenterService.getAll(token);
            setCenters(response.data);
            setLoadingCenters(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al cargar los centros");
            setLoadingCenters(false);
        }
    }

    const getObjectivesAndResults = async () => {
        try {
            setLoading(true);
            let body = {
                id_business_line: selectedBusinessLine ? selectedBusinessLine.id : null,
                id_center: selectedBusinessLine.name == 'Presencial' ? selectedCenter ? selectedCenter.id : null : null,
                year: year
            }
            const response = await ObjetivesService.getObjetives(token, body);

            if(selectedBusinessLine.name === 'Presencial'){
                //If center is not selected, show the results of all centers combined
                if (!selectedCenter) {
                    //Set the columns to the centers columns
                    setColumns(columnsObjCenters);

                    const empty = fillMonthsWithZeros();
                    let apiData = {
                        projected_growth: 0,
                        results_year_before: empty,
                        results: empty,
                        year: year,
                    };

                    //Iterate through the response data to sum the results of all centers
                    for (let i = 0; i < response.data.data.length; i++) {
                        const data = response.data.data[i];

                        //Sum all the results of the centers
                        apiData.results_year_before = Object.fromEntries(
                            Object.entries(apiData.results_year_before).map(([key, value]) => [
                                key,
                                value + (data.results_year_before?.[key] || 0)
                            ])
                        );
                        apiData.results = Object.fromEntries(
                            Object.entries(apiData.results).map(([key, value]) => [
                                key,
                                value + (data.results?.[key] || 0)
                            ])
                        );
                        apiData.projected_growth = (apiData.projected_growth + (parseFloat(data.projected_growth) || 0));
                    }

                    //Calculate the average projected growth and set it to 2 decimal places
                    apiData.projected_growth = apiData.projected_growth / response.data.data.length;
                    setProjectedGrowth(parseFloat(apiData.projected_growth.toFixed(2)) || 1);

                    let rowsData = mapDataToRows(apiData, apiData.projected_growth.toFixed(2))

                    //Calculate the objetivosActual for each row and save it in the row
                    const processed = rowsData.map(row => ({
                        ...row,
                        objetivosActual: Number((row.realAnterior || 0) * (apiData.projected_growth.toFixed(2) || 1)),
                        // Puedes calcular aquí desviaciones también si quieres
                    }));

                    console.log("Processed Rows:", processed);

                    const totalRow = getTotalRow(processed, apiData.projected_growth.toFixed(2) || 1);

                    console.log("Total Row:", totalRow);

                    rowsData.push(totalRow);

                    console.log("Rows Data:", rowsData);

                    setRows(rowsData);

                } else{
                    setProjectedGrowth(parseFloat(response.data.data[0].projected_growth) || 1);

                    let rowsData = mapDataToRows(response.data.data[0], response.data.data[0].projected_growth);

                    //Calculate the objetivosActual for each row and save it in the row
                    const processed = rowsData.map(row => ({
                        ...row,
                        objetivosActual: Number((row.realAnterior || 0) * (parseFloat(response.data.data[0].projected_growth) || 1)),
                        // Puedes calcular aquí desviaciones también si quieres
                    }));

                    const totalRow = getTotalRow(processed, parseFloat(response.data.data[0].projected_growth) || 1);

                    rowsData.push(totalRow);

                    setRows(rowsData);
                }
            } else {

            }

            setLoading(false);

        } catch (error) {
            if(error.response.data?.data?.code === 404){
                setLoading(false);
                //Initialice the data with the rows name 
                const empty = fillMonthsWithZeros();
                let apiData = {
                    projected_growth: 1,
                    results_year_before: empty,
                    results: empty,
                    year: year,
                };

                setColumns(columnsObjCenters);
                setProjectedGrowth(1);
                setRows(mapDataToRows(apiData), 1);
                setNotFound(true);
            } else {
                errorSnackbar(error.message, "Error al cargar los objetivos y resultados");
            setLoading(false);
            }
        }
    }

    const getTotalRow = (rows, growth) => {
        const totalRow = {
            id: 'total',
            month: 'TOTAL',
            realAnterior: 0,
            realActual: 0,
            objetivosActual: 0,
            projectedGrowth: growth, // El total no tiene crecimiento proyectado
        };

        rows.forEach(row => {
            if (row.id !== 'total') {
                totalRow.realAnterior += row.realAnterior || 0;
                totalRow.realActual += row.realActual || 0;
            }
        });

        // Redondeos
        totalRow.realAnterior = Number(totalRow.realAnterior.toFixed(2));
        totalRow.realActual = Number(totalRow.realActual.toFixed(2));
        totalRow.objetivosActual = Number((totalRow.realAnterior * projectedGrowth).toFixed(2));

        return totalRow;
    };

    const handleRowUpdate = (newRow) => {
        const row = rows.find((row) => row.id === newRow.id);

        // Si no hay cambios, devolver el original
        if (row.realActual === newRow.realActual && row.realAnterior === newRow.realAnterior) {
            return row;
        }

        // Habilitar el botón de guardar
        setEnableSave(true);

        // Eliminar la fila total antes de actualizar
        const rowsWithoutTotal = rows.filter(r => r.id !== 'total');

        // Recalcular objetivosActual para la fila editada
        const updatedRow = {
            ...newRow,
            objetivosActual: Number((newRow.realAnterior || 0) * (newRow.projectedGrowth || 1)).toFixed(2)
        };

        // Actualizar todas las filas (menos la total)
        const updatedRows = rowsWithoutTotal.map((row) =>
            row.id === updatedRow.id ? updatedRow : row
        );

        // Añadir la nueva fila total al final
        const totalRow = getTotalRow(updatedRows, projectedGrowth);

        // Actualizar el estado
        setRows([...updatedRows, totalRow]);

        return updatedRow;
    };

    const handleRowUpdateError = (error) => {
        //TODO
    };

    const handleSave = async () => {
        console.log("Saving modifications...");

        if(!selectedBusinessLine) {
            errorSnackbar("Debe seleccionar una linea de negocio para guardar las modificaciones", "Error al guardar"); 
            return;
        }

        setSavingModifications(true);
        try {
            let body = {};
            if(businessLineValue === 'Presencial') {
                if(!selectedCenter) {
                    errorSnackbar("Debe seleccionar un centro para guardar las modificaciones", "Error al guardar");
                    return;
                }
                body = getSaveDataCenters();
            } else {
                //body = getSavedData();
            }

            console.log("Data to save:", body);

            //Check if the data exists
            if(notFound) {
                await ObjetivesService.create(token, body);
            } else {
                await ObjetivesService.update(token, body);
            }
            successSnackbar("Modificaciones guardadas correctamente");
            setEnableSave(false);
        } catch (error) {
            errorSnackbar(error.message, "Error al guardar las modificaciones");
        } finally {
            setSavingModifications(false);
        }
    }

    const getSaveDataCenters = () => {
        const resultsToSave = {};
            const resultsYearBeforeToSave = {}
            rows.forEach((row) => {
                //Skip the total row
                if( row.id === 'total') return;
                //Get the month from the row and convert ii to number
                const month = row.month;
                const monthNumber = Object.keys(monthNames).find(key => monthNames[key] === month);
                if (monthNumber) {
                    resultsToSave[monthNumber] = parseFloat(row.realActual) || 0,
                    resultsYearBeforeToSave[monthNumber] = parseFloat(row.realAnterior) || 0;
                }
            });

            const body = {
                id_business_line: selectedBusinessLine ? selectedBusinessLine.id : null,
                id_center: selectedBusinessLine.name == 'Presencial' ? selectedCenter ? selectedCenter.id : null : null,
                year: year,
                results: resultsToSave,
                results_year_before: resultsYearBeforeToSave,
                projected_growth: projectedGrowth
            };
        return body;
    };

    const getSavedData = () => {
        //TODO
    }

    const mapDataToRows = (data, projected_growth) => {
        return orderedMonths.map((month, index) => ({
            id: index, // necesario para DataGrid
            month: monthNames[month],
            realAnterior: data.results_year_before?.[month] ?? 0,
            realActual: data.results?.[month] ?? 0,
            projectedGrowth: projected_growth || 1,
        }));
    };

    const fillMonthsWithZeros = () => {
        const filled = {};
        orderedMonths.forEach(month => {
            filled[month] = 0;
        });
        return filled;
    }


    return (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
                display="flex"
                alignItems="left"
                p={2}>
                <>
                    <Typography variant="body1" >
                        <Link to={'/objetives'} style={{ textDecoration: "none" }}>
                            Objetivos y Resultados
                        </Link>
                    </Typography>
                </>
            </Box>
            <Box
                gap={4}
                p={2}>
                <Paper>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Box
                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                gap={4}
                                p={2}>
                                <Typography variant="h6">Objetivos y Resultados</Typography>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    loadingPosition="start" 
                                    loading={savingModifications} 
                                    startIcon={<SaveIcon/>} 
                                    disabled={!enableSave} 
                                    onClick={handleSave}>
                                        {savingModifications ? "Guardando..." : "Guardar"}
                                </Button>
                            </Box>
                            <Stack 
                                    direction={{ sm: 'column', md: 'row' }}
                                    spacing={{ xs: 1, sm: 2, md: 4 }}
                                    p={2}
                                    sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Autocomplete
                                    fullWidth
                                    autoHighlight
                                    loading={loadingBusinessLines}
                                    id="businessLine_id"
                                    options={bussinesLines}
                                    inputValue={businessLineValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedBusinessLine}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if (newValue) {
                                            setSelectedBusinessLine(newValue);
                                        } else {
                                            setSelectedBusinessLine(null);
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setBusinessLineValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Linea de Negocio"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingBusinessLines ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )} />
                                { businessLineValue == "Presencial" ?
                                    <Autocomplete
                                    fullWidth
                                    autoHighlight
                                    loading={loadingCenters}
                                    id="center_id"
                                    options={centers}
                                    inputValue={centerValue}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedCenter}
                                    onChange={(event, newValue) => {
                                        console.log(newValue);
                                        if (newValue) {
                                            setSelectedCenter(newValue);
                                        } else {
                                            setSelectedCenter(null);
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        console.log(newInputValue);
                                        setCenterValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Centro"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingCenters ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )} /> : null
                                }
                                <TextField
                                    id="projected_growth"
                                    label="Crecimiento"
                                    value={projectedGrowth}
                                    type="number"
                                    sx={{ width: 300}}
                                    onChange={(event) => {
                                        setProjectedGrowth(event.target.value);
                                        setRows((prevRows) =>
                                            prevRows.map((row) => ({
                                                ...row,
                                                projectedGrowth: event.target.value,
                                            }))
                                        );
                                    }}
                                />
                            </Stack>
                        </Grid>
                        <Grid size={12}>
                            <Box
                                gap={4}
                                p={2}
                            >
                                <DataGridPremium
                                    apiRef={apiRef}
                                    rows={rows}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 15 },
                                        }
                                    }}
                                    pageSizeOptions={[15]}
                                    loading={loading}
                                    slotProps={{
                                        loadingOverlay: {
                                            variant: 'linear-progress',
                                            noRowsVariant: 'linear-progress',
                                        },
                                    }}
                                    editMode={'row'}
                                    processRowUpdate={handleRowUpdate}
                                    onProcessRowUpdateError={handleRowUpdateError}
                                    onRowEditStart={(params) => setRowInEdit(params.id)}
                                    onRowEditStop={() => setRowInEdit(null)}
                                    isCellEditable={(params) => params.row.id !== 'total'}
                                    getRowClassName={(params) =>
                                        params.row.id === 'total' ? 'fila-total' : ''
                                    }
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    )
}

export default ObjectivesAndResults;