import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function HeaderPage({children, name, subname = null, url}) {
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
            {children}
        </Box>
  );
}

export default HeaderPage;