/**
 * React Subcomponent for displaying a location's UI, when that location has special
 * actions/options/properties
 *
 * Examples:
 *      - Bladeburner @ NSA
 *      - Grafting @ VitaLife
 *      - Create Corporation @ City Hall
 *
 * This subcomponent creates all of the buttons for interacting with those special
 * properties
 */
import React, { useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { Location } from "../Location";
import { CreateCorporationModal } from "../../Corporation/ui/modals/CreateCorporationModal";
import { AugmentationName, FactionName, LocationName, ToastVariant } from "@enums";
import { Factions } from "../../Faction/Factions";
import { joinFaction } from "../../Faction/FactionHelpers";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { N00dles } from "../../utils/helpers/N00dles";
import { Exploit } from "../../Exploits/Exploit";
import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";
import { CorruptableText } from "../../ui/React/CorruptableText";
import { HacknetNode } from "../../Hacknet/HacknetNode";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { GetServer } from "../../Server/AllServers";
import { ArcadeRoot } from "../../Arcade/ui/ArcadeRoot";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { canAccessBitNodeFeature, knowAboutBitverse } from "../../BitNode/BitNodeUtils";
import { useRerender } from "../../ui/React/hooks";
import { PromptEvent } from "../../ui/React/PromptManager";
import { canAcceptStaneksGift } from "../../CotMG/Helper";

interface SpecialLocationProps {
  loc: Location;
}

export function SpecialLocation(props: SpecialLocationProps): React.ReactElement {
  const rerender = useRerender();

  // Apply for Bladeburner division
  const joinBladeburnerDivision = useCallback(() => {
    Player.startBladeburner();
    dialogBoxCreate("You have been accepted into the Bladeburner division!");
    rerender();
  }, [rerender]);

  /** Click handler for Bladeburner button at Sector-12 NSA */
  function handleBladeburner(): void {
    if (Player.bladeburner) {
      // Enter Bladeburner division
      Router.toPage(Page.Bladeburner);
      return;
    }
    if (
      Player.skills.strength < 100 ||
      Player.skills.defense < 100 ||
      Player.skills.dexterity < 100 ||
      Player.skills.agility < 100
    ) {
      dialogBoxCreate("Rejected! Please apply again when you have 100 of each combat stat (str, def, dex, agi)");
      return;
    }
    if (
      Player.activeSourceFileLvl(7) >= 3 &&
      canAcceptStaneksGift().success &&
      !Player.hasAugmentation(AugmentationName.StaneksGift1)
    ) {
      PromptEvent.emit({
        txt:
          `After joining the Bladeburner division, you will immediately receive "${AugmentationName.BladesSimulacrum}"\n` +
          `augmentation and won't be able to accept Stanek's Gift. If you want to accept Stanek's Gift,\n` +
          `you must do that before joining the Bladeburner division.\n\n` +
          "Do you really want to join the Bladeburner division now?",
        resolve: (value: string | boolean) => {
          if (value !== true) {
            return;
          }
          joinBladeburnerDivision();
        },
      });
      return;
    }
    joinBladeburnerDivision();
  }

  /** Click handler for Secret lab button at New Tokyo VitaLife */
  function handleGrafting(): void {
    Router.toPage(Page.Grafting);
  }

  function renderBladeburner(): React.ReactElement {
    if (!Player.canAccessBladeburner() || currentNodeMults.BladeburnerRank === 0) {
      return <></>;
    }
    const text = Player.bladeburner ? "Enter Bladeburner Headquarters" : "Apply to Bladeburner Division";
    return (
      <>
        <br />
        <Button onClick={handleBladeburner}>{text}</Button>
      </>
    );
  }

  function renderNoodleBar(): React.ReactElement {
    function EatNoodles(): void {
      SnackbarEvents.emit("You ate some delicious noodles and feel refreshed", ToastVariant.SUCCESS, 2000);
      N00dles(); // This is the true power of the noodles.
      if (knowAboutBitverse()) {
        Player.giveExploit(Exploit.N00dles);
      }
      if (canAccessBitNodeFeature(5)) {
        Player.exp.intelligence *= 1.0000000000000002;
      }
      Player.exp.hacking *= 1.0000000000000002;
      Player.exp.strength *= 1.0000000000000002;
      Player.exp.defense *= 1.0000000000000002;
      Player.exp.agility *= 1.0000000000000002;
      Player.exp.dexterity *= 1.0000000000000002;
      Player.exp.charisma *= 1.0000000000000002;
      for (const node of Player.hacknetNodes) {
        if (node instanceof HacknetNode) {
          Player.gainMoney(node.moneyGainRatePerSecond * 0.001, "other");
        } else {
          const server = GetServer(node);
          if (!(server instanceof HacknetServer)) throw new Error(`Server ${node} is not a hacknet server.`);
          Player.hashManager.storeHashes(server.hashRate * 0.001);
        }
      }

      if (Player.bladeburner) {
        Player.bladeburner.rank += 0.00001;
      }

      if (Player.corporation) {
        Player.corporation.gainFunds(Player.corporation.revenue * 0.000001, "glitch in reality");
      }
    }

    return (
      <>
        <br />
        <Button onClick={EatNoodles}>Eat noodles</Button>
      </>
    );
  }

  function CreateCorporation(): React.ReactElement {
    const [open, setOpen] = useState(false);
    if (!Player.canAccessCorporation()) {
      return (
        <>
          <Typography>
            <i>A businessman is yelling at a clerk. You should come back later.</i>
          </Typography>
        </>
      );
    }
    return (
      <>
        <Button disabled={!Player.canAccessCorporation() || !!Player.corporation} onClick={() => setOpen(true)}>
          Create a Corporation
        </Button>
        <CreateCorporationModal open={open} onClose={() => setOpen(false)} restart={false} />
      </>
    );
  }

  function renderGrafting(): React.ReactElement {
    if (!Player.canAccessGrafting()) {
      return <></>;
    }
    return (
      <Button onClick={handleGrafting} sx={{ my: 5 }}>
        Enter the secret lab
      </Button>
    );
  }

  function handleCotMG(): void {
    const faction = Factions[FactionName.ChurchOfTheMachineGod];
    if (!Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
      joinFaction(faction);
    }
    if (
      !Player.augmentations.some((a) => a.name === AugmentationName.StaneksGift1) &&
      !Player.queuedAugmentations.some((a) => a.name === AugmentationName.StaneksGift1)
    ) {
      applyAugmentation({ name: AugmentationName.StaneksGift1, level: 1 });
    }

    Router.toPage(Page.StaneksGift);
  }

  function renderCotMG(): React.ReactElement {
    const toStanek = <Button onClick={() => Router.toPage(Page.StaneksGift)}>Open Stanek's Gift</Button>;
    // prettier-ignore
    const symbol = <Typography sx={{ lineHeight: '1em', whiteSpace: 'pre' }}>
      {"                 ``          "}<br />
      {"             -odmmNmds:      "}<br />
      {"           `hNmo:..-omNh.    "}<br />
      {"           yMd`      `hNh    "}<br />
      {"           mMd        oNm    "}<br />
      {"           oMNo      .mM/    "}<br />
      {"           `dMN+    -mM+     "}<br />
      {"            -mMNo  -mN+      "}<br />
      {"  .+-        :mMNo/mN/       "}<br />
      {":yNMd.        :NMNNN/        "}<br />
      {"-mMMMh.        /NMMh`        "}<br />
      {" .dMMMd.       /NMMMy`       "}<br />
      {"  `yMMMd.     /NNyNMMh`      "}<br />
      {"   `sMMMd.   +Nm: +NMMh.     "}<br />
      {"     oMMMm- oNm:   /NMMd.    "}<br />
      {"      +NMMmsMm-     :mMMd.   "}<br />
      {"       /NMMMm-       -mMMd.  "}<br />
      {"        /MMMm-        -mMMd. "}<br />
      {"       `sMNMMm-        .mMmo "}<br />
      {"      `sMd:hMMm.        ./.  "}<br />
      {"     `yMy` `yNMd`            "}<br />
      {"    `hMs`    oMMy            "}<br />
      {"   `hMh       sMN-           "}<br />
      {"   /MM-       .NMo           "}<br />
      {"   +MM:       :MM+           "}<br />
      {"    sNNo-.`.-omNy`           "}<br />
      {"     -smNNNNmdo-             "}<br />
      {"        `..`                 "}</Typography>
    if (Player.hasAugmentation(AugmentationName.StaneksGift3, true)) {
      return (
        <>
          <Typography>
            <i>
              Allison "Mother" Stanek: ..can ...you hear them too ...? Come now, don't be shy and let me get a closer
              look at you. Yes wonderful, I see my creation has taken root without consequence or much ill effect it
              seems. Curious, Just how much of a machine's soul do you house in that body?
            </i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }
    if (Player.hasAugmentation(AugmentationName.StaneksGift2, true)) {
      return (
        <>
          <Typography>
            <i>
              Allison "Mother" Stanek: I see you've taken to my creation. So much that it could hardly be recognized as
              one of my own after your tinkering with it. I see you follow the ways of the Machine God as I do, and your
              mastery of the gift clearly demonstrates that. My hopes are climbing by the day for you.
            </i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }
    if (Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
      return (
        <>
          <Typography>
            <i>Allison "Mother" Stanek: Welcome back my child!</i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }

    if (!Player.canAccessCotMG()) {
      return (
        <>
          <Typography>
            A decrepit altar stands in the middle of a dilapidated church.
            <br />
            <br />A symbol is carved in the altar.
          </Typography>
          <br />
          {symbol}
        </>
      );
    }

    if (
      Player.augmentations.filter((a) => a.name !== AugmentationName.NeuroFluxGovernor).length > 0 ||
      Player.queuedAugmentations.filter((a) => a.name !== AugmentationName.NeuroFluxGovernor).length > 0
    ) {
      return (
        <>
          <Typography>
            <i>
              Allison "Mother" Stanek: Begone you filth! My gift must be the first modification that your body should
              have!
            </i>
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography>
          <i>
            Allison "Mother" Stanek: Welcome child, I see your body is pure. Are you ready to ascend beyond our human
            form? If you are, accept my gift.
          </i>
        </Typography>
        <Button onClick={handleCotMG}>Accept Stanek's Gift</Button>
        {symbol}
      </>
    );
  }

  function renderGlitch(): React.ReactElement {
    return (
      <>
        <Typography>
          <CorruptableText content={"An eerie aura surrounds this area. You feel you should leave."} spoiler={false} />
        </Typography>
      </>
    );
  }

  switch (props.loc.name) {
    case LocationName.NewTokyoVitaLife: {
      return renderGrafting();
    }
    case LocationName.Sector12CityHall: {
      return (currentNodeMults.CorporationSoftcap < 0.15 && <></>) || <CreateCorporation />;
    }
    case LocationName.Sector12NSA: {
      return renderBladeburner();
    }
    case LocationName.NewTokyoNoodleBar: {
      return renderNoodleBar();
    }
    case LocationName.ChongqingChurchOfTheMachineGod: {
      return renderCotMG();
    }
    case LocationName.IshimaGlitch: {
      return renderGlitch();
    }
    case LocationName.NewTokyoArcade: {
      return <ArcadeRoot />;
    }
    case LocationName.Sector12CIA:
    case LocationName.NewTokyoDefComm: {
      return (
        <>
          <br />
          <br />
          <br />
          <Button onClick={() => Router.toPage(Page.Go)}>IPvGO Subnet Takeover</Button>
        </>
      );
    }
    default:
      console.error(`Location ${props.loc.name} doesn't have any special properties`);
      return <></>;
  }
}
