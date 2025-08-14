import { Button, Grid, Paper, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { DataGrid } from "@mui/x-data-grid"
import { Link, useNavigate } from "react-router-dom";
import HeaderPage from "./PagesComponents/HeaderPage";

const ListDataGrid = ({ rows, columns, name, subname = null, url, buttonName, loading = false, noClick = false, createButton = true, filterComponent = [], sort = [], editable = false, handleRowUpdate, handleRowUpdateError, apiRef = null, buttonFunction = null, filter = false, filterModel, setFilterModel, initialState = null, fillParent = false, showHeader = true }) => {
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
    <HeaderPage name={name} subname={subname} url={url} show={showHeader}>
      <Box
        p={2}
        gap={4}
        sx={
          fillParent
            ? {
              height: "100%",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              overflow: "hidden",
            }
            : undefined
        }
      >
        <Paper
          sx={
            fillParent
              ? {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                overflow: "hidden",
              }
              : undefined
          }
        >
          <Grid
            container
            spacing={2}
            sx={fillParent ? { flex: 1, minWidth: 0 } : undefined}
          >
            <Grid size={12}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between" }}
                gap={4}
                p={2}
              >
                <Typography variant="h6">{name}</Typography>
                {createButton ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClick}
                  >
                    {buttonName}
                  </Button>
                ) : null}
              </Box>
              <Stack direction="row" spacing={2}>
                {components.map((filterComponentT, index) => (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                    gap={4}
                    px={2}
                    key={index}
                  >
                    {filterComponentT}
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid size={12} sx={fillParent ? { flex: 1, minWidth: 0 } : undefined}>
              <Box
                p={2}
                sx={
                  fillParent
                    ? {
                      height: "100%",
                      width: "100%",
                      minWidth: 0,
                      overflow: "auto",
                      display: "flex",
                    }
                    : undefined
                }
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                    sorting: { sortModel: [sort] },
                  }}
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  {...(!noClick && { onRowClick: handleRowClick })}
                  loading={loading}
                  slotProps={{
                    loadingOverlay: {
                      variant: "linear-progress",
                      noRowsVariant: "linear-progress",
                    },
                  }}
                  {...(editable && {
                    editMode: "row",
                    processRowUpdate: handleRowUpdate,
                    onProcessRowUpdateError: handleRowUpdateError,
                  })}
                  {...(filter && {
                    filterModel: filterModel,
                    onFilterModelChange: (model) => setFilterModel(model),
                  })}
                  {...(apiRef && { apiRef: apiRef })}
                  {...(initialState && { initialState })}

                  autoHeight={!fillParent}
                  sx={
                    fillParent
                      ? {
                        flex: 1,
                        minWidth: 0,
                        width: "100%",
                        height: "100%",
                      }
                      : undefined
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </HeaderPage>
  );
};

export default ListDataGrid;