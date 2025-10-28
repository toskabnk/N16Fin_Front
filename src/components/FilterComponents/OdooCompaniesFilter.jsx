import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";


const OdooCompaniesFilter = ({ selectedCompany, setSelectedCompany, companies }) => {
    return (
        <FormControl fullWidth>
            <InputLabel id="company-select-label">Compañía</InputLabel>
            <Select
            id="company-select"
                label="Compañía"
                variant="outlined"
                margin='none'
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
            >
                {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                        {company.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default OdooCompaniesFilter;