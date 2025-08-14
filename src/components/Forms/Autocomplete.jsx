import { CircularProgress, Autocomplete as MUIAutocomplete, TextField } from "@mui/material";

const Autocomplete = ({ loading, id, label, options, value, setValue, selected, setSelected, formik  }) => {
  return (
    <MUIAutocomplete 
        fullWidth
        loading={loading}
        id={id}
        options={options}
        inputValue={value}
        getOptionLabel={(option) => option.name}
        value={selected}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => {
            console.log(newValue);
            if(newValue){
                setSelected(newValue);
                formik.setFieldValue(id, newValue.id);
            }
            else {
                setSelected(null);
                formik.setFieldValue(id, '');
            }
        }}
        onInputChange={(event, newInputValue) => {
            console.log(newInputValue);
            setValue(newInputValue);
        }}
        renderInput={(params) => (
            <TextField
            {...params}
            label={label}
            margin='normal'
            onBlur={formik.handleBlur}
            error={formik.touched[id] && Boolean(formik.errors[id])}
            helperText={formik.touched[id] && formik.errors[id]}
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                    <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                    </>
                ),
            }}
            />
        )}/>
  );
}

export default Autocomplete;