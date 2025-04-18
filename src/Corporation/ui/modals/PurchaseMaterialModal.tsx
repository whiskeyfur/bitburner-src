import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { MaterialInfo } from "../../MaterialInfo";
import { Warehouse } from "../../Warehouse";
import { Material } from "../../Material";
import { formatMatPurchaseAmount } from "../../../ui/formatNumber";
import * as actions from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation, useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../../utils/KeyboardEventKey";

interface IBulkPurchaseTextProps {
  warehouse: Warehouse;
  mat: Material;
  amount: string;
}

interface IBPProps {
  onClose: () => void;
  mat: Material;
  warehouse: Warehouse;
}

function BulkPurchaseSection(props: IBPProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [buyAmt, setBuyAmt] = useState("");
  const [disabled, setDisabled] = useState(false);

  function BulkPurchaseText(props: IBulkPurchaseTextProps): React.ReactElement {
    const parsedAmt = parseFloat(props.amount);
    const cost = parsedAmt * props.mat.marketPrice;

    const matSize = MaterialInfo[props.mat.name].size;
    const maxAmount = (props.warehouse.size - props.warehouse.sizeUsed) / matSize;

    if (parsedAmt > maxAmount) {
      setDisabled(true);
      return (
        <>
          <Typography color={"error"}>Not enough warehouse space to purchase this amount</Typography>
        </>
      );
    } else if (isNaN(cost) || parsedAmt < 0) {
      setDisabled(true);
      return (
        <>
          <Typography color={"error"}>Invalid input for Bulk Purchase amount</Typography>
        </>
      );
    } else {
      setDisabled(false);
      return (
        <>
          <Typography>
            Purchasing {formatMatPurchaseAmount(parsedAmt)} of {props.mat.name} will cost <Money money={cost} />
          </Typography>
        </>
      );
    }
  }

  function bulkPurchase(): void {
    try {
      actions.bulkPurchase(corp, division, props.warehouse, props.mat, parseFloat(buyAmt));
    } catch (error) {
      dialogBoxCreate(String(error));
    }
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) bulkPurchase();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setBuyAmt(event.target.value);
  }

  return (
    <>
      <Typography>
        Enter the amount of {props.mat.name} you would like to bulk purchase. This purchases the specified amount
        instantly (all at once).
      </Typography>
      <BulkPurchaseText warehouse={props.warehouse} mat={props.mat} amount={buyAmt} />
      <TextField
        value={buyAmt}
        onChange={onChange}
        type="number"
        placeholder="Bulk Purchase amount"
        onKeyDown={onKeyDown}
      />
      <Button disabled={disabled} onClick={bulkPurchase}>
        Confirm Bulk Purchase
      </Button>
    </>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
  warehouse: Warehouse;
  disablePurchaseLimit: boolean;
}

// Create a popup that lets the player purchase a Material
export function PurchaseMaterialModal(props: IProps): React.ReactElement {
  const division = useDivision();
  const [buyAmt, setBuyAmt] = useState(props.mat.buyAmount ? props.mat.buyAmount : 0);

  function purchaseMaterial(): void {
    if (buyAmt === null) return;
    try {
      actions.buyMaterial(division, props.mat, buyAmt);
    } catch (error) {
      dialogBoxCreate(String(error));
    }

    props.onClose();
  }

  function clearPurchase(): void {
    props.mat.buyAmount = 0;
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) purchaseMaterial();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setBuyAmt(parseFloat(event.target.value));
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the amount of {props.mat.name} you would like to purchase per second. This material's cost changes
        constantly.
        {props.disablePurchaseLimit ? " Note: Purchase amount is disabled as smart supply is enabled" : ""}
      </Typography>
      <TextField
        value={buyAmt}
        onChange={onChange}
        autoFocus={true}
        placeholder="Purchase amount"
        type="number"
        disabled={props.disablePurchaseLimit}
        onKeyDown={onKeyDown}
      />
      <Button disabled={props.disablePurchaseLimit} onClick={purchaseMaterial}>
        Confirm
      </Button>
      <Button disabled={props.disablePurchaseLimit} onClick={clearPurchase}>
        Clear Purchase
      </Button>
      {<BulkPurchaseSection onClose={props.onClose} mat={props.mat} warehouse={props.warehouse} />}
    </Modal>
  );
}
