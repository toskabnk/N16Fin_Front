import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

const CreatableAutocomplete = ({id, value, setValue, options, label, formik}) => {
    return (
    <Autocomplete
        value={value}
        onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
                setValue({
                    name: newValue,
                });
                formik.setFieldValue(id, newValue);
            } else if (newValue && newValue.inputValue) {
                setValue({
                    name: newValue.inputValue,
                });
                formik.setFieldValue(id, newValue.inputValue);
            } else {
                setValue(newValue);
                formik.setFieldValue(id, newValue ? newValue.name : '');
            }
        }}
        filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            const isExisting = options.some((option) => inputValue === option.name);
            if (inputValue !== '' && !isExisting) {
                filtered.push({
                    inputValue,
                    name: `Añadir "${inputValue}"`,
                });
            }

            return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id={id}
        options={options}
        getOptionLabel={(option) => {
            if (typeof option === 'string') {
                return option;
            }
            if (option.inputValue) {
                return option.inputValue;
            }
                return option.name;
        }}
        renderOption={(props, option) => {
            const { key, ...optionProps } = props;
                return (
                <li key={key} {...optionProps}>
                    {option.name}
                </li>
            );
        }}
        fullWidth
        freeSolo
renderInput={(params) => (
            <TextField
            {...params}
            label={label}
            margin='normal'
            onBlur={formik.handleBlur}
            error={formik.touched[id] && Boolean(formik.errors[id])}
            helperText={formik.touched[id] && formik.errors[id]}
            />
        )}
    />
    );
};

export default CreatableAutocomplete;