import { InputAdornment, TextField } from "@mui/material";

/**
 * Crea un campo de texto con validaciones de formik y material-ui
 * @param {*} id Identificador del campo
 * @param {*} type Tipo de campo
 * @param {*} label Etiqueta del campo
 * @param {*} required Si el campo es requerido 
 * @param {*} fullWidth Si el campo ocupa todo el ancho
 * @param {*} formik Objeto formik
 * @param {*} sx Estilos del campo
 * @param {*} disabled Si el campo esta deshabilitado
 * @returns {JSX.Element} Campo de texto
 */

const FormikTextField = ({ id, type, label, required=false, fullWidth, formik, sx=null, disabled=false, multiline=false, adorment = null}) => {
    return (
        <TextField 
            margin='normal' 
            id={id} 
            type={type} 
            label={label} 
            sx={sx}
            required={required} 
            fullWidth={fullWidth} 
            disabled={disabled}
            onBlur={formik.handleBlur} 
            error={formik.touched[id] && Boolean(formik.errors[id])} 
            value={formik.values[id]} 
            onChange={formik.handleChange} 
            helperText={formik.touched[id] && formik.errors[id]}
            {...(multiline ? { multiline} : {})}
            slotProps={{
            input: {
                endAdornment: adorment ? <InputAdornment position="end">{adorment}</InputAdornment> : null,
            },
          }}
        />
    );
}

export default FormikTextField;