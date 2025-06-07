import { Button, Grid, Paper, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { DataGrid } from "@mui/x-data-grid"
import { Link, useNavigate } from "react-router-dom";

const ListDataGrid = ({ rows, columns, name, subname = null, url, buttonName, loading = false, noClick = false, createButton = true , filterComponent = [], sort = [], editable = false, handleRowUpdate, handleRowUpdateError, apiRef, buttonFunction = null }) => {
    //Hooks
    const navigate = useNavigate();

    //Cuando se hace click en una fila de la tabla se redirige a la página de edicion del tipo de evento
    const handleRowClick = (params) => {
        console.log(params.row);
        navigate(`${url}/${params.id}`, { state: { objectID: params.row } });
    };

    //Cuando se hace click en el boton de crear se redirige a la página de creacion del tipo de evento o se ejecuta la funcion que se le pasa por parametro
    const handleClick = () => {
        if (buttonFunction) {
            buttonFunction();
        } else {
            navigate(`${url}/new`);
        }
    };

    const components = [filterComponent]


    return (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
                display="flex"
                alignItems="left"
                p={2}>
                <>
                    <Typography variant="body1" >
                        <Link to={url} color="blue" underline="hover" style={{ textDecoration: "none" }}>
                            {name} /
                        </Link>
                    </Typography>
                    {subname ?
                        (<Typography variant="body1" >
                            &nbsp;{subname}
                        </Typography>) : null}
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
                                <Typography variant="h6">{name}</Typography>
                                {createButton ? (
                                    <Button variant="contained" color="primary" onClick={handleClick}>{buttonName}</Button>
                                ) : null}
                            </Box>
                            <Stack direction="row" spacing={2}>
                            {components.map((filterComponentT, index) => (
                                <Box
                                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                                    gap={4}
                                    px={2}
                                    key={index}>
                                    {filterComponentT}
                                </Box>
                            ))}
                            </Stack>
                        </Grid>

                        <Grid size={12}>
                            <Box
                                gap={4}
                                p={2}
                                >
                                <DataGrid
                                    {...editable && { apiRef:apiRef }}
                                    rows={rows}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 10 },
                                        },
                                        sorting: {
                                            sortModel: [sort],
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 20, 50]}
                                    {...(!noClick && { onRowClick: handleRowClick })}
                                    loading={loading}
                                    slotProps={{
                                        loadingOverlay: {
                                            variant: 'linear-progress',
                                            noRowsVariant: 'linear-progress',
                                        },
                                    }}
                                    {...editable && {
                                        editMode: 'row',
                                        processRowUpdate: handleRowUpdate,
                                        onProcessRowUpdateError: handleRowUpdateError,
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    )
}

export default ListDataGrid