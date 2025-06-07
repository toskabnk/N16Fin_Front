import React, { createContext, Fragment, useContext } from 'react';
import { useSnackbar, SnackbarProvider } from 'notistack';
import { Button } from '@mui/material';

const SnackbarContext = createContext();

export const useSnackbarContext = () => {
    return useContext(SnackbarContext);
};

export const SnackbarWrapperProvider = ({ children }) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showSnackbar = (message, options = {}) => {
        enqueueSnackbar(message, options);
    };

    const errorSnackbar =  (errorMessage, message = 'Algo ha ido mal, intentalo más tarde') => {
        showSnackbar(message, {
            variant: 'error',
            autoHideDuration: 6000,
            action: (key) => (
                <Fragment>
                    <Button
                        size='small'
                        onClick={() => alert(`Error: ${errorMessage}`)}
                    >
                        Detalles
                    </Button>
                    <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                        Cerrar
                    </Button>
                </Fragment>
            ),
        });
    };

    const successSnackbar = (message = 'Operacion competada correctamente') => {
        showSnackbar(message, {
            variant: 'success',
            autoHideDuration: 6000,
            action: (key) => (
                <Fragment>
                    <Button size='small' onClick={() => closeSnackbarGlobal(key)}>
                        Cerrar
                    </Button>
                </Fragment>
            ),
        });
    }

    const closeSnackbarGlobal = (key) => {
        closeSnackbar(key);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar, closeSnackbarGlobal, errorSnackbar, successSnackbar }}>
            {children}
        </SnackbarContext.Provider>
    );
};