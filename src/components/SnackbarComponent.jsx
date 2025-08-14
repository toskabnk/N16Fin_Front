import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SnackbarComponent = React.forwardRef(({ open, message, severity, handleClose }, ref) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} ref={ref}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default SnackbarComponent;