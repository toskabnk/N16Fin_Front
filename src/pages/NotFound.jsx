import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import errorImage from "/src/assets/404-error.webp";


function NotFound() {
    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ margin: 'auto', width: '60%' }}
        >
            <Box component="img"
                src={errorImage}
                alt="Error"
                margin={2}
                sx={{
                    height: 350,
                    width: 350,
                }}
            />
            <Box>
                <Typography variant='h3'>Ooops, you reached the end of internet!</Typography>
                <Typography variant='h5'>Maybe we are building it!</Typography>
            </Box>
        </Stack>
    )
}

export default NotFound;