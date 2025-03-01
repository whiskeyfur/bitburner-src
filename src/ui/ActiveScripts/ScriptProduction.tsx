/**
 * React Component for displaying the total production and production rate
 * of scripts on the 'Active Scripts' UI page
 */
import * as React from "react";

import { Money } from "../React/Money";
import { MoneyRate } from "../React/MoneyRate";
import { Player } from "@player";

import Typography from "@mui/material/Typography";

import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const useStyles = makeStyles()((theme: Theme) => ({
  cell: {
    borderBottom: "none",
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    whiteSpace: "nowrap",
  },
  size: {
    width: "1px",
  },
}));
export function ScriptProduction(): React.ReactElement {
  const { classes } = useStyles();
  let prodRateSinceLastAug = Player.scriptProdSinceLastAug / (Player.playtimeSinceLastAug / 1000);
  if (!Number.isFinite(prodRateSinceLastAug)) {
    prodRateSinceLastAug = 0;
  }

  return (
    <Table size="small" classes={{ root: classes.size }}>
      <TableBody>
        <TableRow>
          <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
            <Typography variant="body2">Total production since last Augment Installation:</Typography>
          </TableCell>
          <TableCell align="left" classes={{ root: classes.cell }}>
            <Typography variant="body2">
              <Money money={Player.scriptProdSinceLastAug} />
            </Typography>
          </TableCell>
          <TableCell align="left" classes={{ root: classes.cell }}>
            <Typography variant="body2">
              (<MoneyRate money={prodRateSinceLastAug} />)
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
