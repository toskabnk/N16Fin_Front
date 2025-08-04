import { LoadingButton } from "@mui/lab";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import HeaderPage from "./PagesComponents/HeaderPage";

const FormGrid = ({ children, formik, name, url, isEdit, loading, loadingDelete, handleDelete, onSubmit, noDelete=false, largeSize=6 }) => {
    const navigate = useNavigate();
    return (
            <HeaderPage name={name} url={url} subname={isEdit ? 'Editar' : 'Crear'} >
                <Grid container spacing={2} sx={{padding: 2}}>
                    <Grid size={{xs: 12, md: 6, lg: largeSize}}>
                        <Paper>
                            <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                                {children}
                                <Grid size={12}>
                                    <Box
                                    sx={{display: 'flex', paddingBottom: 2}}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            sx={{marginRight: 2}}
                                            loading={loading}
                                            disabled={loadingDelete}
                                            loadingPosition="start"
                                            startIcon={<SaveIcon />}
                                            onClick={formik.handleSubmit}
                                        >{isEdit ? 'Editar' : 'Enviar'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            sx={{marginRight: 2}}
                                            onClick={e => {
                                                e.preventDefault();
                                                navigate(`${url}`);
                                            }}
                                        >Cancelar
                                        </Button>
                                        {isEdit && !noDelete ? (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                loading={loadingDelete}
                                                onClick={handleDelete}
                                                loadingPosition="start"
                                                startIcon={<DeleteIcon />}
                                            >{'Borrar'}</Button>) : null}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </HeaderPage>
    );
}

export default FormGrid;