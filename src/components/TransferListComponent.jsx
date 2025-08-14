import { Button, Card, CardHeader, Checkbox, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Grid } from "@mui/system";
import { useEffect, useState } from "react";

export function intersection(a, b) {
    return a.filter((value) => b.includes(value));
}

function TransferList({ left, right, setLeft, setRight }) {
    const [checked, setChecked] = useState([]);
    const [leftChecked, setLeftChecked] = useState([]);
    const [rightChecked, setRightChecked] = useState([]);

    useEffect(() => {
        setLeftChecked(intersection(checked, left.map(item => item.id)));
        setRightChecked(intersection(checked, right.map(item => item.id)));
    }, [checked, left, right]);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        //Guarda en right los centros seleccionados de leftChecked, que solo tiene los ids
        setRight(right.concat(leftChecked.map(id => left.find(item => item.id === id))));
        //Elimina los centros seleccionados de left seleccionados en leftChecked, que solo tiene los ids
        setLeft(left.filter(item => !leftChecked.includes(item.id)));
        //Actualiza el estado de checked para eliminar los ids de los centros que se han movido a right
        setChecked(checked.filter(id => !leftChecked.includes(id)));
    };

    const handleCheckedLeft = () => {
        //Guarda en left los centros seleccionados de rightChecked, que solo tiene los ids
        setLeft(left.concat(rightChecked.map(id => right.find(item => item.id === id))));
        //Elimina los centros seleccionados de right seleccionados en rightChecked, que solo tiene los ids
        setRight(right.filter(item => !rightChecked.includes(item.id)));
        //Actualiza el estado de checked para eliminar los ids de los centros que se han movido a left
        setChecked(checked.filter(id => !rightChecked.includes(id)));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const customList = (items, title) => (
        <Card>
        <CardHeader
        sx={{ px: 2, py: 1 }}
        title={title}
      />
      <Divider />   
        <List 
        dense 
        component="div" 
        role="list"
        sx={{
          width: 200,
          height: 230,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}>
            {items.map((value) => {
            const labelId = `transfer-list-item-${value.id}-label`;

            return (
                <ListItemButton
                key={value.id}
                role="listitem"
                onClick={handleToggle(value.id)}
                >
                <ListItemIcon>
                    <Checkbox
                    checked={checked.includes(value.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                        'aria-labelledby': labelId,
                    }}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value.name}`} />
                </ListItemButton>
            );
            })}
        </List>
        </Card>
    );

    return (
        <>
            <Grid>{customList(left, "Elegibles")}</Grid>
                <Grid>
                    <Grid container direction="column" sx={{ alignItems: 'center' }}>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllRight}
                        disabled={left.length === 0}
                        aria-label="move all right"
                    >
                        ≫
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllLeft}
                        disabled={right.length === 0}
                        aria-label="move all left"
                    >
                        ≪
                    </Button>
                    </Grid>
                </Grid>
            <Grid>{customList(right, "Elegidos")}</Grid>
        </>
    );
}

export default TransferList;