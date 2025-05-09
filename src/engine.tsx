import { convertTimeMsToTimeElapsedString } from "./utils/StringHelperFunctions";
import { AugmentationName, ToastVariant } from "@enums";
import { initBitNodeMultipliers } from "./BitNode/BitNode";
import { initSourceFiles } from "./SourceFile/SourceFiles";
import { tryGeneratingRandomContract } from "./CodingContract/ContractGenerator";
import { CONSTANTS } from "./Constants";
import { Factions } from "./Faction/Factions";
import { staneksGift } from "./CotMG/Helper";
import { processPassiveFactionRepGain, inviteToFaction } from "./Faction/FactionHelpers";
import { Router } from "./ui/GameRoot";
import "./utils/Protections"; // Side-effect: Protect against certain unrecoverable errors
import "./PersonObjects/Player/PlayerObject"; // For side-effect of creating Player

import {
  getHackingWorkRepGain,
  getFactionSecurityWorkRepGain,
  getFactionFieldWorkRepGain,
} from "./PersonObjects/formulas/reputation";
import { hasHacknetServers, processHacknetEarnings } from "./Hacknet/HacknetHelpers";
import { iTutorialStart } from "./InteractiveTutorial";
import { checkForMessagesToSend } from "./Message/MessageHelpers";
import { loadAllRunningScripts, updateOnlineScriptTimes } from "./NetscriptWorker";
import { Player } from "@player";
import { saveObject, loadGame } from "./SaveObject";
import { GetAllServers, initForeignServers } from "./Server/AllServers";
import { Settings } from "./Settings/Settings";
import { FormatsNeedToChange } from "./ui/formatNumber";
import { initSymbolToStockMap, processStockPrices } from "./StockMarket/StockMarket";
import { Terminal } from "./Terminal";

import { Money } from "./ui/React/Money";
import { Hashes } from "./ui/React/Hashes";
import { Reputation } from "./ui/React/Reputation";

import { AlertEvents } from "./ui/React/AlertManager";
import { exceptionAlert } from "./utils/helpers/exceptionAlert";

import { startExploits } from "./Exploits/loops";
import { calculateAchievements } from "./Achievements/Achievements";

import React from "react";
import ReactDOM from "react-dom";
import { setupUncaughtPromiseHandler } from "./UncaughtPromiseHandler";
import { Button, Typography } from "@mui/material";
import { SnackbarEvents } from "./ui/React/Snackbar";
import { SaveData } from "./types";
import { Go } from "./Go/Go";
import { EventEmitter } from "./utils/EventEmitter";
import { Companies } from "./Company/Companies";
import { resetGoPromises } from "./Go/boardAnalysis/goAI";

declare global {
  // This property is only available in the dev build
  // eslint-disable-next-line no-var
  var Bitburner: {
    Player: typeof Player;
    GetAllServers: typeof GetAllServers;
    Factions: typeof Factions;
    Companies: typeof Companies;
    SaveObject: {
      saveObject: typeof saveObject;
      loadGame: typeof loadGame;
    };
  };
}

export const GameCycleEvents = new EventEmitter<[]>();

/** Game engine. Handles the main game loop. */
const Engine: {
  _lastUpdate: number;
  updateGame: (numCycles?: number) => void;
  Counters: {
    [key: string]: number | undefined;
    autoSaveCounter: number;
    updateSkillLevelsCounter: number;
    updateDisplays: number;
    updateDisplaysLong: number;
    updateActiveScriptsDisplay: number;
    createProgramNotifications: number;
    augmentationsNotifications: number;
    checkFactionInvitations: number;
    passiveFactionGrowth: number;
    messages: number;
    mechanicProcess: number;
    contractGeneration: number;
    achievementsCounter: number;
  };
  decrementAllCounters: (numCycles?: number) => void;
  checkCounters: () => void;
  load: (saveData: SaveData) => Promise<void>;
  start: () => void;
} = {
  // Time variables (milliseconds unix epoch time)
  _lastUpdate: new Date().getTime(),
  updateGame: function (numCycles = 1) {
    const time = numCycles * CONSTANTS.MilliPerCycle;
    if (Player.totalPlaytime == null) {
      Player.totalPlaytime = 0;
    }
    if (Player.playtimeSinceLastAug == null) {
      Player.playtimeSinceLastAug = 0;
    }
    if (Player.playtimeSinceLastBitnode == null) {
      Player.playtimeSinceLastBitnode = 0;
    }
    Player.totalPlaytime += time;
    Player.playtimeSinceLastAug += time;
    Player.playtimeSinceLastBitnode += time;

    Terminal.process(numCycles);

    Player.processWork(numCycles);

    // Update stock prices
    if (Player.hasWseAccount) {
      processStockPrices(numCycles);
    }

    // Gang
    if (Player.gang) Player.gang.process(numCycles);

    // Stanek's gift
    staneksGift.process(numCycles);

    // Corporation
    if (Player.corporation) {
      Player.corporation.storeCycles(numCycles);
      Player.corporation.process();
    }

    // Bladeburner
    if (Player.bladeburner) Player.bladeburner.storeCycles(numCycles);

    // Sleeves
    Player.sleeves.forEach((sleeve) => sleeve.process(numCycles));

    // Update the running time of all active scripts
    updateOnlineScriptTimes(numCycles);

    // Hacknet Nodes
    processHacknetEarnings(numCycles);

    // Counters
    Engine.decrementAllCounters(numCycles);
    // This **MUST** be the last call in the function, because checkCounters()
    // can invoke the autosave, so any work done after here risks not getting saved!
    Engine.checkCounters();
  },

  /**
   * Counters for the main event loop. Represent the number of game cycles that
   * are required for something to happen. These counters are in game cycles,
   * which is once every 200ms
   */
  Counters: {
    autoSaveCounter: 300,
    updateSkillLevelsCounter: 10,
    updateDisplays: 3,
    updateDisplaysLong: 15,
    updateActiveScriptsDisplay: 5,
    createProgramNotifications: 10,
    augmentationsNotifications: 10,
    checkFactionInvitations: 10,
    passiveFactionGrowth: 5,
    messages: 150,
    mechanicProcess: 5, // Process Bladeburner
    contractGeneration: 3000, // Generate Coding Contracts
    achievementsCounter: 60, // Check if we have new achievements
  },

  decrementAllCounters: function (numCycles = 1) {
    for (const [counterName, counter] of Object.entries(Engine.Counters)) {
      if (counter === undefined) {
        exceptionAlert(new Error(`counter value is undefined. counterName: ${counterName}.`), true);
        continue;
      }
      Engine.Counters[counterName] = counter - numCycles;
    }
  },

  /**
   * Checks if any counters are 0. If they are, executes whatever
   * is necessary and then resets the counter
   */
  checkCounters: function () {
    if (Engine.Counters.checkFactionInvitations <= 0) {
      const invitedFactions = Player.checkForFactionInvitations();
      for (const invitedFaction of invitedFactions) {
        inviteToFaction(invitedFaction);
      }
      Engine.Counters.checkFactionInvitations = 10;
    }

    if (Engine.Counters.passiveFactionGrowth <= 0) {
      const adjustedCycles = Math.floor(5 - Engine.Counters.passiveFactionGrowth);
      processPassiveFactionRepGain(adjustedCycles);
      Engine.Counters.passiveFactionGrowth = 5;
    }

    if (Engine.Counters.messages <= 0) {
      checkForMessagesToSend();
      if (Player.hasAugmentation(AugmentationName.TheRedPill)) {
        Engine.Counters.messages = 4500; // 15 minutes for Red pill message
      } else {
        Engine.Counters.messages = 150;
      }
    }
    if (Engine.Counters.mechanicProcess <= 0) {
      if (Player.bladeburner) {
        try {
          Player.bladeburner.process();
        } catch (e) {
          exceptionAlert(e, true);
        }
      }
      Engine.Counters.mechanicProcess = 5;
    }

    if (Engine.Counters.contractGeneration <= 0) {
      tryGeneratingRandomContract(1);
      Engine.Counters.contractGeneration = 3000;
    }

    if (Engine.Counters.achievementsCounter <= 0) {
      calculateAchievements();
      Engine.Counters.achievementsCounter = 300;
    }

    // This **MUST** remain the last block in the function!
    // Otherwise, any work done after this point won't be saved!
    // Due to the way most of these counters are reset, that would probably be
    // OK, but it's much simpler to reason about if we can assume that the
    // entire function has been performed after a save.
    if (Engine.Counters.autoSaveCounter <= 0) {
      if (Settings.AutosaveInterval == null) {
        Settings.AutosaveInterval = 60;
      }
      if (Settings.AutosaveInterval === 0) {
        warnAutosaveDisabled();
        Engine.Counters.autoSaveCounter = 60 * 5; // Let's check back in a bit
      } else {
        Engine.Counters.autoSaveCounter = Settings.AutosaveInterval * 5;
        saveObject.saveGame(!Settings.SuppressSavedGameToast).catch((error) => console.error(error));
      }
    }
  },

  load: async function (saveData) {
    startExploits();
    setupUncaughtPromiseHandler();
    // Source files must be initialized early because save-game translation in
    // loadGame() needs them sometimes.
    initSourceFiles();
    // Load game from save or create new game

    if (await loadGame(saveData)) {
      FormatsNeedToChange.emit();
      initBitNodeMultipliers();
      if (Player.hasWseAccount) {
        initSymbolToStockMap();
      }

      // Apply penalty for entropy accumulation
      Player.applyEntropy(Player.entropy);

      // Calculate the number of cycles have elapsed while offline
      Engine._lastUpdate = new Date().getTime();
      const lastUpdate = Player.lastUpdate;
      let timeOffline = Engine._lastUpdate - lastUpdate;
      if (timeOffline < 0) {
        timeOffline = 0;
      }
      const numCyclesOffline = Math.floor(timeOffline / CONSTANTS.MilliPerCycle);

      // Generate bonus CCTs
      tryGeneratingRandomContract(timeOffline / CONSTANTS.MillisecondsPerTenMinutes);

      let offlineReputation = 0;
      let offlineHackingIncome =
        (Player.moneySourceA.hacking / Player.playtimeSinceLastAug) * timeOffline * CONSTANTS.OfflineHackingIncome;
      if (!Number.isFinite(offlineHackingIncome)) {
        offlineHackingIncome = 0;
      }
      Player.gainMoney(offlineHackingIncome, "hacking");
      // Process offline progress

      loadAllRunningScripts(); // This also takes care of offline production for those scripts

      if (Player.currentWork !== null) {
        Player.focus = true;
        Player.processWork(numCyclesOffline);
      } else if (Player.bitNodeN !== 2) {
        for (let i = 0; i < Player.factions.length; i++) {
          const facName = Player.factions[i];
          if (!Object.hasOwn(Factions, facName)) continue;
          const faction = Factions[facName];
          if (!faction.isMember) continue;
          // No rep for special factions.
          const info = faction.getInfo();
          if (!info.offersWork()) continue;
          // No rep for gangs.
          if (Player.getGangName() === facName) continue;

          const hRep = getHackingWorkRepGain(Player, faction.favor);
          const sRep = getFactionSecurityWorkRepGain(Player, faction.favor);
          const fRep = getFactionFieldWorkRepGain(Player, faction.favor);
          // can be infinite, doesn't matter.
          const reputationRate = Math.max(hRep, sRep, fRep) / Player.factions.length;

          const rep = reputationRate * numCyclesOffline;
          faction.playerReputation += rep;
          offlineReputation += rep;
        }
      }

      // Hacknet Nodes offline progress
      const offlineProductionFromHacknetNodes = processHacknetEarnings(numCyclesOffline);
      const hacknetProdInfo = hasHacknetServers() ? (
        <>
          <Hashes hashes={offlineProductionFromHacknetNodes} /> hashes
        </>
      ) : (
        <Money money={offlineProductionFromHacknetNodes} />
      );

      // Passive faction rep gain offline
      processPassiveFactionRepGain(numCyclesOffline);

      // Stock Market offline progress
      if (Player.hasWseAccount) {
        processStockPrices(numCyclesOffline);
      }

      // Gang progress for BitNode 2
      if (Player.gang) Player.gang.process(numCyclesOffline);

      // Corporation offline progress
      if (Player.corporation) Player.corporation.storeCycles(numCyclesOffline);

      // Bladeburner offline progress
      if (Player.bladeburner) Player.bladeburner.storeCycles(numCyclesOffline);

      Go.storeCycles(numCyclesOffline);

      staneksGift.process(numCyclesOffline);

      // Sleeves offline progress
      Player.sleeves.forEach((sleeve) => sleeve.process(numCyclesOffline));

      // Update total playtime
      const time = numCyclesOffline * CONSTANTS.MilliPerCycle;
      Player.totalPlaytime ??= 0;
      Player.playtimeSinceLastAug ??= 0;
      Player.playtimeSinceLastBitnode ??= 0;

      Player.totalPlaytime += time;
      Player.playtimeSinceLastAug += time;
      Player.playtimeSinceLastBitnode += time;

      Player.lastUpdate = Engine._lastUpdate;
      Engine.start(); // Run main game loop and Scripts loop
      const timeOfflineString = convertTimeMsToTimeElapsedString(time);
      setTimeout(
        () =>
          AlertEvents.emit(
            <>
              <Typography>Offline for {timeOfflineString}. While you were offline:</Typography>
              <ul>
                <li>
                  <Typography>
                    Your scripts generated <Money money={offlineHackingIncome} />
                  </Typography>
                </li>
                <li>
                  <Typography>Your Hacknet Nodes generated {hacknetProdInfo}</Typography>
                </li>
                <li>
                  <Typography>
                    You gained <Reputation reputation={offlineReputation} /> reputation divided amongst your factions
                  </Typography>
                </li>
              </ul>
            </>,
          ),
        250,
      );
    } else {
      // No save found, start new game
      FormatsNeedToChange.emit();
      initBitNodeMultipliers();
      Player.init();
      initForeignServers(Player.getHomeComputer());
      Player.reapplyAllAugmentations();
      resetGoPromises();

      // Start interactive tutorial
      iTutorialStart();

      Engine.start(); // Run main game loop and Scripts loop
    }

    // Expose internal objects/functions in the dev build
    if (process.env.NODE_ENV === "development") {
      globalThis.Bitburner = {
        // Most data is in this object
        Player: Player,
        // Manipulate data of servers
        GetAllServers: GetAllServers,
        // Manipulate data of Factions and Companies
        Factions: Factions,
        Companies: Companies,
        // saveObject and loadGame can be used to create a custom save/load tool
        SaveObject: {
          saveObject: saveObject,
          loadGame: loadGame,
        },
      };
    }
  },

  start: function () {
    // Get time difference
    const _thisUpdate = new Date().getTime();
    let diff = _thisUpdate - Engine._lastUpdate;
    if (diff < 0) {
      diff = 0;
      Engine._lastUpdate = _thisUpdate;
      Player.lastUpdate = _thisUpdate;
    }
    const offset = diff % CONSTANTS.MilliPerCycle;

    // Divide this by cycle time to determine how many cycles have elapsed since last update
    diff = Math.floor(diff / CONSTANTS.MilliPerCycle);

    if (diff > 0) {
      // Update the game engine by the calculated number of cycles
      Engine._lastUpdate = _thisUpdate - offset;
      Player.lastUpdate = _thisUpdate - offset;
      Engine.updateGame(diff);
      if (GameCycleEvents.hasSubscibers()) {
        ReactDOM.unstable_batchedUpdates(() => {
          GameCycleEvents.emit();
        });
      }
    }
    window.setTimeout(Engine.start, CONSTANTS.MilliPerCycle - offset);
  },
};

/** Shows a toast warning that lets the player know that auto-saves are disabled, with an button to re-enable them. */
function warnAutosaveDisabled(): void {
  // If the player has suppressed those warnings let's just exit right away.
  if (Settings.SuppressAutosaveDisabledWarnings) return;

  // We don't want this warning to show up on certain pages.
  // When in recovery or importing we want to keep autosave disabled.
  if (Router.hidingMessages()) return;

  const warningToast = (
    <>
      Auto-saves are <strong>disabled</strong>!
      <Button
        sx={{ ml: 1 }}
        color="warning"
        size="small"
        onClick={() => {
          // We reset the value to a default
          Settings.AutosaveInterval = 60;
        }}
      >
        Enable
      </Button>
    </>
  );
  SnackbarEvents.emit(warningToast, ToastVariant.WARNING, 5000);
}

export { Engine };
