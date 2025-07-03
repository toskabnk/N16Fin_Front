import { CircularProgress, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";

/**
 * Muestra un componente de KPI
 * @param {*} param0 { display: Titulo del KPI, data: Dato a mostrar }
 * @returns {JSX.Element} KPI Component
 */
const KpiComponent = ({ display, data, loading, unit = null}) => {
  return (
    <Box    
        gap={4}
        p={2}>
        <Paper
            elevation={3}
            sx={{ height:"100px"}}>
            <Box>
                <Typography variant="h6"  gutterBottom sx={{marginLeft: '10px', paddingTop: '5px', paddingLeft: '10px'}}>{display}</Typography>
                {loading ? <CircularProgress sx={{marginLeft: '45%'}} /> : 
                  <Typography align='center' variant="h3" gutterBottom>
                          {data}{unit && <span>{unit}</span>}
                  </Typography>
                }
            </Box>
        </Paper>
    </Box>
  );
}

export default KpiComponent;