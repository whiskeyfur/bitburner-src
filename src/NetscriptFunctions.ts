import { vsprintf, sprintf } from "sprintf-js";
import { currentNodeMults } from "./BitNode/BitNodeMultipliers";
import { CONSTANTS } from "./Constants";
import {
  calculateHackingChance,
  calculateHackingExpGain,
  calculatePercentMoneyHacked,
  calculateHackingTime,
  calculateGrowTime,
  calculateWeakenTime,
} from "./Hacking";
import { netscriptCanGrow, netscriptCanWeaken } from "./Hacking/netscriptCanHack";
import { Terminal } from "./Terminal";
import { Player } from "@player";
import {
  CityName,
  CodingContractName,
  CompletedProgramName,
  CrimeType,
  FactionWorkType,
  GymType,
  JobName,
  JobField,
  type LiteratureName,
  LocationName,
  ToastVariant,
  UniversityClassType,
  CompanyName,
  FactionName,
  type MessageFilename,
} from "@enums";
import { PromptEvent } from "./ui/React/PromptManager";
import { GetServer, DeleteServer, AddToAllServers, createUniqueRandomIp } from "./Server/AllServers";
import {
  getServerOnNetwork,
  numCycleForGrowth,
  numCycleForGrowthCorrected,
  processSingleServerGrowth,
  safelyCreateUniqueServer,
  getWeakenEffect,
} from "./Server/ServerHelpers";
import {
  getPurchasedServerUpgradeCost,
  getPurchaseServerCost,
  getPurchaseServerLimit,
  getPurchaseServerMaxRam,
  renamePurchasedServer,
  upgradePurchasedServer,
} from "./Server/ServerPurchases";
import { Server } from "./Server/Server";
import { influenceStockThroughServerGrow } from "./StockMarket/PlayerInfluencing";
import { runScriptFromScript } from "./NetscriptWorker";
import { killWorkerScript, killWorkerScriptByPid } from "./Netscript/killWorkerScript";
import { workerScripts } from "./Netscript/WorkerScripts";
import { WorkerScript } from "./Netscript/WorkerScript";
import { helpers, wrapUserNode } from "./Netscript/NetscriptHelpers";
import {
  formatExp,
  formatNumberNoSuffix,
  formatMoney,
  formatPercent,
  formatRam,
  formatSecurity,
  formatThreads,
  formatNumber,
} from "./ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "./utils/StringHelperFunctions";
import { roundToTwo } from "./utils/helpers/roundToTwo";
import { arrayToString } from "./utils/helpers/ArrayHelpers";
import { NetscriptGang } from "./NetscriptFunctions/Gang";
import { NetscriptGo } from "./NetscriptFunctions/Go";
import { NetscriptSleeve } from "./NetscriptFunctions/Sleeve";
import { NetscriptExtra } from "./NetscriptFunctions/Extra";
import { NetscriptHacknet } from "./NetscriptFunctions/Hacknet";
import { NetscriptStanek } from "./NetscriptFunctions/Stanek";
import { NetscriptInfiltration } from "./NetscriptFunctions/Infiltration";
import { NetscriptUserInterface } from "./NetscriptFunctions/UserInterface";
import { NetscriptBladeburner } from "./NetscriptFunctions/Bladeburner";
import { NetscriptCodingContract } from "./NetscriptFunctions/CodingContract";
import { NetscriptCorporation } from "./NetscriptFunctions/Corporation";
import { NetscriptFormulas } from "./NetscriptFunctions/Formulas";
import { NetscriptStockMarket } from "./NetscriptFunctions/StockMarket";
import { NetscriptGrafting } from "./NetscriptFunctions/Grafting";
import { NS, RecentScript, ProcessInfo, NSEnums } from "@nsdefs";
import { NetscriptSingularity } from "./NetscriptFunctions/Singularity";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { SnackbarEvents } from "./ui/React/Snackbar";
import { matchScriptPathExact } from "./utils/helpers/scriptKey";

import { Flags } from "./NetscriptFunctions/Flags";
import { calculateCurrentShareBonus, ShareBonusTime, startSharing } from "./NetworkShare/Share";
import { recentScripts } from "./Netscript/RecentScripts";
import { InternalAPI, setRemovedFunctions, NSProxy } from "./Netscript/APIWrapper";
import { INetscriptExtra } from "./NetscriptFunctions/Extra";
import { ScriptDeath } from "./Netscript/ScriptDeath";
import { getBitNodeMultipliers } from "./BitNode/BitNode";
import { assert, assertArray, assertString, assertObject } from "./utils/TypeAssertion";
import { escapeRegExp } from "lodash";
import numeral from "numeral";
import { clearPort, peekPort, portHandle, readPort, tryWritePort, writePort, nextPortWrite } from "./NetscriptPort";
import { FilePath, resolveFilePath } from "./Paths/FilePath";
import { hasScriptExtension } from "./Paths/ScriptFilePath";
import { hasTextExtension } from "./Paths/TextFilePath";
import { ContentFilePath } from "./Paths/ContentFile";
import { hasContractExtension } from "./Paths/ContractFilePath";
import { getRamCost } from "./Netscript/RamCostGenerator";
import { getEnumHelper } from "./utils/EnumHelper";
import { setDeprecatedProperties, deprecationWarning } from "./utils/DeprecationHelper";
import { ServerConstants } from "./Server/data/Constants";
import { assertFunctionWithNSContext } from "./Netscript/TypeAssertion";
import { Router } from "./ui/GameRoot";
import { Page } from "./ui/Router";
import { canAccessBitNodeFeature, validBitNodes } from "./BitNode/BitNodeUtils";
import { isIPAddress } from "./Types/strings";
import { compile } from "./NetscriptJSEvaluator";
import { Script } from "./Script/Script";

export const enums: NSEnums = {
  CityName,
  CrimeType,
  FactionWorkType,
  GymType,
  JobName,
  JobField,
  LocationName,
  ToastVariant,
  UniversityClassType,
  CompanyName,
  FactionName,
  CodingContractName,
};
for (const val of Object.values(enums)) Object.freeze(val);
Object.freeze(enums);

export type NSFull = Readonly<Omit<NS & INetscriptExtra, "pid" | "args" | "enums">>;

export const ns: InternalAPI<NSFull> = {
  singularity: NetscriptSingularity(),
  gang: NetscriptGang(),
  go: NetscriptGo(),
  bladeburner: NetscriptBladeburner(),
  codingcontract: NetscriptCodingContract(),
  sleeve: NetscriptSleeve(),
  corporation: NetscriptCorporation(),
  stanek: NetscriptStanek(),
  infiltration: NetscriptInfiltration(),
  ui: NetscriptUserInterface(),
  formulas: NetscriptFormulas(),
  stock: NetscriptStockMarket(),
  grafting: NetscriptGrafting(),
  hacknet: NetscriptHacknet(),
  sprintf:
    (ctx) =>
    (_format, ...args) => {
      const format = helpers.string(ctx, "format", _format);
      return sprintf(format, ...(args as unknown[]));
    },
  vsprintf: (ctx) => (_format, _args) => {
    const format = helpers.string(ctx, "format", _format);
    if (!Array.isArray(_args)) {
      throw helpers.errorMessage(ctx, `args must be an array.`);
    }
    return vsprintf(format, _args);
  },
  scan: (ctx) => (_host, _returnOpts) => {
    const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
    const returnOpts = helpers.hostReturnOptions(_returnOpts);
    const server = helpers.getServer(ctx, host);
    const out: string[] = [];
    for (let i = 0; i < server.serversOnNetwork.length; i++) {
      const s = getServerOnNetwork(server, i);
      if (s === null) continue;
      const entry = helpers.returnServerID(s, returnOpts);
      if (entry === null) continue;
      out.push(entry);
    }
    helpers.log(
      ctx,
      () =>
        `returned ${server.serversOnNetwork.length} connections for ${isIPAddress(host) ? server.ip : server.hostname}`,
    );
    return out;
  },
  hasTorRouter: () => () => Player.hasTorRouter(),
  hack: (ctx) => (_host, opts?) => {
    const host = helpers.string(ctx, "host", _host);
    return helpers.hack(ctx, host, false, opts);
  },
  hackAnalyzeThreads: (ctx) => (_host, _hackAmount) => {
    const host = helpers.string(ctx, "host", _host);
    const hackAmount = helpers.number(ctx, "hackAmount", _hackAmount);

    // Check argument validity
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return -1;
    }
    if (isNaN(hackAmount)) {
      throw helpers.errorMessage(
        ctx,
        `Invalid hackAmount argument passed into hackAnalyzeThreads: ${hackAmount}. Must be numeric.`,
      );
    }

    if (hackAmount < 0 || hackAmount > server.moneyAvailable) {
      return -1;
    } else if (hackAmount === 0) {
      return 0;
    }

    const percentHacked = calculatePercentMoneyHacked(server, Player);

    if (percentHacked === 0 || server.moneyAvailable === 0) {
      return -1; // To prevent returning infinity below
    }

    return hackAmount / (server.moneyAvailable * percentHacked);
  },
  hackAnalyze: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);

    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }

    return calculatePercentMoneyHacked(server, Player);
  },
  hackAnalyzeSecurity: (ctx) => (_threads, _host?) => {
    let threads = helpers.number(ctx, "threads", _threads);
    if (_host) {
      const host = helpers.string(ctx, "host", _host);
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "Cannot be executed on this server.");
        return 0;
      }

      const percentHacked = calculatePercentMoneyHacked(server, Player);

      if (percentHacked > 0) {
        // thread count is limited to the maximum number of threads needed
        threads = Math.min(threads, Math.ceil(1 / percentHacked));
      }
    }

    return ServerConstants.ServerFortifyAmount * threads;
  },
  hackAnalyzeChance: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);

    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }

    return calculateHackingChance(server, Player);
  },
  sleep:
    (ctx) =>
    (_time = 0) => {
      const time = helpers.number(ctx, "time", _time);
      helpers.log(ctx, () => `Sleeping for ${convertTimeMsToTimeElapsedString(time, true)}.`);
      return helpers.netscriptDelay(ctx, time).then(function () {
        return Promise.resolve(true);
      });
    },
  asleep:
    (ctx) =>
    (_time = 0) => {
      const time = helpers.number(ctx, "time", _time);
      helpers.log(ctx, () => `Sleeping for ${convertTimeMsToTimeElapsedString(time, true)}.`);
      return new Promise((resolve) => setTimeout(() => resolve(true), time));
    },
  grow: (ctx) => (_host, opts?) => {
    const host = helpers.string(ctx, "host", _host);
    const { threads, stock, additionalMsec } = helpers.validateHGWOptions(ctx, opts);

    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      throw helpers.errorMessage(ctx, "Cannot be executed on this server.");
    }

    // No root access or skill level too low
    const canHack = netscriptCanGrow(server);
    if (!canHack.res) {
      throw helpers.errorMessage(ctx, canHack.msg || "");
    }

    const growTime = calculateGrowTime(server, Player) + additionalMsec / 1000.0;
    helpers.log(
      ctx,
      () =>
        `Executing on '${server.hostname}' in ${convertTimeMsToTimeElapsedString(
          growTime * 1000,
          true,
        )} (t=${formatThreads(threads)}).`,
    );
    return helpers.netscriptDelay(ctx, growTime * 1000).then(function () {
      const scripthost = GetServer(ctx.workerScript.hostname);
      if (scripthost === null) {
        throw helpers.errorMessage(ctx, `Cannot find host of WorkerScript. Hostname: ${ctx.workerScript.hostname}.`);
      }
      const moneyBefore = server.moneyAvailable;
      const growth = processSingleServerGrowth(server, threads, scripthost.cpuCores);
      const moneyAfter = server.moneyAvailable;
      ctx.workerScript.scriptRef.recordGrow(server.hostname, threads);
      const expGain = calculateHackingExpGain(server, Player) * threads;
      helpers.log(
        ctx,
        () =>
          `Available money on '${server.hostname}' grown by ${formatPercent(growth - 1, 6)}. Gained ${formatExp(
            expGain,
          )} hacking exp (t=${formatThreads(threads)}).`,
      );
      ctx.workerScript.scriptRef.onlineExpGained += expGain;
      Player.gainHackingExp(expGain);
      if (stock) {
        influenceStockThroughServerGrow(server, moneyAfter - moneyBefore);
      }
      return Promise.resolve(server.moneyMax === 0 ? 0 : growth);
    });
  },
  growthAnalyze:
    (ctx) =>
    (_host, _multiplier, _cores = 1) => {
      const host = helpers.string(ctx, "hostname", _host);
      const mult = helpers.number(ctx, "multiplier", _multiplier);
      const cores = helpers.positiveInteger(ctx, "cores", _cores);

      // Check argument validity
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        // Todo 2.3: Make this throw instead of returning 0?
        helpers.log(ctx, () => `${host} is not a hackable server. Returning 0.`);
        return 0;
      }
      if (!Number.isFinite(mult) || mult < 1) {
        throw helpers.errorMessage(ctx, `Invalid argument: multiplier must be finite and >= 1, is ${mult}.`);
      }

      return numCycleForGrowth(server, mult, cores);
    },
  growthAnalyzeSecurity:
    (ctx) =>
    (_threads, _host?, _cores = 1) => {
      let threads = helpers.number(ctx, "threads", _threads);
      if (_host) {
        const cores = helpers.number(ctx, "cores", _cores);
        const host = helpers.string(ctx, "host", _host);
        const server = helpers.getServer(ctx, host);

        if (!(server instanceof Server)) {
          helpers.log(ctx, () => "Cannot be executed on this server.");
          return 0;
        }

        const maxThreadsNeeded = Math.ceil(
          numCycleForGrowthCorrected(server, server.moneyMax, server.moneyAvailable, cores),
        );

        threads = Math.min(threads, maxThreadsNeeded);
      }

      return 2 * ServerConstants.ServerFortifyAmount * threads;
    },
  weaken: (ctx) => async (_host, opts?) => {
    const host = helpers.string(ctx, "host", _host);
    const { threads, additionalMsec } = helpers.validateHGWOptions(ctx, opts);

    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      throw helpers.errorMessage(ctx, "Cannot be executed on this server.");
    }

    // No root access or skill level too low
    const canHack = netscriptCanWeaken(server);
    if (!canHack.res) {
      throw helpers.errorMessage(ctx, canHack.msg || "");
    }

    const weakenTime = calculateWeakenTime(server, Player) + additionalMsec / 1000.0;
    helpers.log(
      ctx,
      () =>
        `Executing on '${server.hostname}' in ${convertTimeMsToTimeElapsedString(
          weakenTime * 1000,
          true,
        )} (t=${formatThreads(threads)})`,
    );
    return helpers.netscriptDelay(ctx, weakenTime * 1000).then(function () {
      const scripthost = GetServer(ctx.workerScript.hostname);
      if (scripthost === null) {
        throw helpers.errorMessage(ctx, `Cannot find host of WorkerScript. Hostname: ${ctx.workerScript.hostname}.`);
      }
      const weakenAmt = getWeakenEffect(threads, scripthost.cpuCores);
      const securityBeforeWeaken = server.hackDifficulty;
      server.weaken(weakenAmt);
      const securityAfterWeaken = server.hackDifficulty;
      const securityReduction = securityBeforeWeaken - securityAfterWeaken;
      ctx.workerScript.scriptRef.recordWeaken(server.hostname, threads);
      const expGain = calculateHackingExpGain(server, Player) * threads;
      helpers.log(
        ctx,
        () =>
          `'${server.hostname}' security level weakened to ${server.hackDifficulty}. Gained ${formatExp(
            expGain,
          )} hacking exp (t=${formatThreads(threads)})`,
      );
      ctx.workerScript.scriptRef.onlineExpGained += expGain;
      Player.gainHackingExp(expGain);
      // Account for hidden multiplier in Server.weaken()
      return Promise.resolve(securityReduction);
    });
  },
  weakenAnalyze:
    (ctx) =>
    (_threads, _cores = 1) => {
      const threads = helpers.number(ctx, "threads", _threads);
      const cores = helpers.number(ctx, "cores", _cores);
      return getWeakenEffect(threads, cores);
    },
  share: (ctx) => () => {
    const threads = ctx.workerScript.scriptRef.threads;
    const hostname = ctx.workerScript.hostname;
    helpers.log(ctx, () => `Sharing ${threads} threads on ${hostname}.`);
    const end = startSharing(threads, helpers.getServer(ctx, hostname).cpuCores);
    return helpers.netscriptDelay(ctx, ShareBonusTime).finally(function () {
      helpers.log(ctx, () => `Finished sharing ${threads} threads on ${hostname}.`);
      end();
    });
  },
  getSharePower: () => () => {
    return calculateCurrentShareBonus();
  },
  print:
    (ctx) =>
    (...args) => {
      if (args.length === 0) {
        throw helpers.errorMessage(ctx, "Takes at least 1 argument.");
      }
      ctx.workerScript.print(helpers.argsToString(args));
    },
  printf:
    (ctx) =>
    (_format, ...args) => {
      const format = helpers.string(ctx, "format", _format);
      if (typeof format !== "string") {
        throw helpers.errorMessage(ctx, "First argument must be string for the format.");
      }
      ctx.workerScript.print(vsprintf(format, args));
    },
  tprint:
    (ctx) =>
    (...args) => {
      if (args.length === 0) {
        throw helpers.errorMessage(ctx, "Takes at least 1 argument.");
      }
      const str = helpers.argsToString(args);
      if (str.startsWith("ERROR") || str.startsWith("FAIL")) {
        Terminal.error(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("SUCCESS")) {
        Terminal.success(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("WARN")) {
        Terminal.warn(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("INFO")) {
        Terminal.info(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      Terminal.print(`${ctx.workerScript.name}: ${str}`);
    },
  tprintf:
    (ctx) =>
    (_format, ...args) => {
      const format = helpers.string(ctx, "format", _format);
      const str = vsprintf(format, args);

      if (str.startsWith("ERROR") || str.startsWith("FAIL")) {
        Terminal.error(`${str}`);
        return;
      }
      if (str.startsWith("SUCCESS")) {
        Terminal.success(`${str}`);
        return;
      }
      if (str.startsWith("WARN")) {
        Terminal.warn(`${str}`);
        return;
      }
      if (str.startsWith("INFO")) {
        Terminal.info(`${str}`);
        return;
      }
      Terminal.print(`${str}`);
    },
  clearLog: (ctx) => () => {
    ctx.workerScript.scriptRef.clearLog();
  },
  disableLog: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (possibleLogs[fn] === undefined) {
      throw helpers.errorMessage(ctx, `Invalid argument: ${fn}.`);
    }
    if (fn === "ALL") {
      ctx.workerScript.disableLogs = allDisabled;
      // No need to log here, it's been disabled.
    } else {
      // We don't track individual log entries when all are disabled.
      if (!ctx.workerScript.disableLogs["ALL"]) {
        ctx.workerScript.disableLogs[fn] = true;
        helpers.log(ctx, () => `Disabled logging for ${fn}`);
      }
    }
  },
  enableLog: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (possibleLogs[fn] === undefined) {
      throw helpers.errorMessage(ctx, `Invalid argument: ${fn}.`);
    }
    if (fn === "ALL") {
      ctx.workerScript.disableLogs = {};
      helpers.log(ctx, () => `Enabled logging for all functions`);
    } else {
      if (ctx.workerScript.disableLogs["ALL"]) {
        // As an optimization, we normally store only that key, but we have to
        // expand it out to all keys at this point.
        // Conveniently, possibleLogs serves as a model for "all keys disabled."
        ctx.workerScript.disableLogs = Object.assign({}, possibleLogs, { ALL: false, [fn]: false });
      } else {
        ctx.workerScript.disableLogs[fn] = false;
      }
      helpers.log(ctx, () => `Enabled logging for ${fn}`);
    }
  },
  isLogEnabled: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (possibleLogs[fn] === undefined) {
      throw helpers.errorMessage(ctx, `Invalid argument: ${fn}.`);
    }
    return ctx.workerScript.shouldLog(fn);
  },
  getScriptLogs:
    (ctx) =>
    (scriptID, host, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
      const runningScriptObj = helpers.getRunningScript(ctx, ident);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return [] as string[];
      }

      return runningScriptObj.logs.map((x) => String(x));
    },
  tail:
    (ctx) =>
    (scriptID, hostname, ...scriptArgs) => {
      deprecationWarning("ns.tail", "Use ns.ui.openTail instead.");
      ns.ui.openTail(ctx)(scriptID, hostname, ...scriptArgs);
    },
  moveTail:
    (ctx) =>
    (_x, _y, _pid = ctx.workerScript.scriptRef.pid) => {
      deprecationWarning("ns.moveTail", "Use ns.ui.moveTail instead.");
      ns.ui.moveTail(ctx)(_x, _y, _pid);
    },
  resizeTail:
    (ctx) =>
    (_w, _h, _pid = ctx.workerScript.scriptRef.pid) => {
      deprecationWarning("ns.resizeTail", "Use ns.ui.resizeTail instead.");
      ns.ui.resizeTail(ctx)(_w, _h, _pid);
    },
  closeTail:
    (ctx) =>
    (_pid = ctx.workerScript.scriptRef.pid) => {
      deprecationWarning("ns.closeTail", "Use ns.ui.closeTail instead.");
      ns.ui.closeTail(ctx)(_pid);
    },
  setTitle:
    (ctx) =>
    (title, _pid = ctx.workerScript.scriptRef.pid) => {
      deprecationWarning("ns.setTitle", "Use ns.ui.setTailTitle instead.");
      ns.ui.setTailTitle(ctx)(title, _pid);
    },
  nuke: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);

    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (server.hasAdminRights) {
      helpers.log(ctx, () => `Already have root access to '${server.hostname}'.`);
      return true;
    }
    if (!Player.hasProgram(CompletedProgramName.nuke)) {
      throw helpers.errorMessage(ctx, "You do not have the NUKE.exe virus!");
    }
    if (server.openPortCount < server.numOpenPortsRequired) {
      throw helpers.errorMessage(ctx, "Not enough ports opened to use NUKE.exe virus.");
    }
    server.hasAdminRights = true;
    helpers.log(ctx, () => `Executed NUKE.exe virus on '${server.hostname}' to gain root access.`);
    return true;
  },
  brutessh: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.bruteSsh)) {
      throw helpers.errorMessage(ctx, "You do not have the BruteSSH.exe program!");
    }
    if (!server.sshPortOpen) {
      helpers.log(ctx, () => `Executed BruteSSH.exe on '${server.hostname}' to open SSH port (22).`);
      server.sshPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SSH Port (22) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  ftpcrack: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.ftpCrack)) {
      throw helpers.errorMessage(ctx, "You do not have the FTPCrack.exe program!");
    }
    if (!server.ftpPortOpen) {
      helpers.log(ctx, () => `Executed FTPCrack.exe on '${server.hostname}' to open FTP port (21).`);
      server.ftpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `FTP Port (21) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  relaysmtp: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.relaySmtp)) {
      throw helpers.errorMessage(ctx, "You do not have the relaySMTP.exe program!");
    }
    if (!server.smtpPortOpen) {
      helpers.log(ctx, () => `Executed relaySMTP.exe on '${server.hostname}' to open SMTP port (25).`);
      server.smtpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SMTP Port (25) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  httpworm: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.httpWorm)) {
      throw helpers.errorMessage(ctx, "You do not have the HTTPWorm.exe program!");
    }
    if (!server.httpPortOpen) {
      helpers.log(ctx, () => `Executed HTTPWorm.exe on '${server.hostname}' to open HTTP port (80).`);
      server.httpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `HTTP Port (80) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  sqlinject: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.sqlInject)) {
      throw helpers.errorMessage(ctx, "You do not have the SQLInject.exe program!");
    }
    if (!server.sqlPortOpen) {
      helpers.log(ctx, () => `Executed SQLInject.exe on '${server.hostname}' to open SQL port (1433).`);
      server.sqlPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SQL Port (1433) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  run:
    (ctx) =>
    (_scriptname, _thread_or_opt = 1, ..._args) => {
      const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
      const runOpts = helpers.runOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const scriptServer = ctx.workerScript.getServer();

      return runScriptFromScript("run", scriptServer, path, args, ctx.workerScript, runOpts);
    },
  exec:
    (ctx) =>
    (_scriptname, _host, _thread_or_opt = 1, ..._args) => {
      const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
      const host = helpers.string(ctx, "host", _host);
      const runOpts = helpers.runOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const server = helpers.getServer(ctx, host);
      return runScriptFromScript("exec", server, path, args, ctx.workerScript, runOpts);
    },
  spawn:
    (ctx) =>
    (_scriptname, _thread_or_opt = 1, ..._args) => {
      const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
      const runOpts = helpers.spawnOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const spawnCb = () => {
        if (Router.page() === Page.BitVerse) {
          helpers.log(ctx, () => `Script execution is canceled because you are in Bitverse.`);
          return;
        }
        const scriptServer = GetServer(ctx.workerScript.hostname);
        if (scriptServer == null) {
          throw helpers.errorMessage(ctx, `Cannot find server ${ctx.workerScript.hostname}`);
        }

        return runScriptFromScript("spawn", scriptServer, path, args, ctx.workerScript, runOpts);
      };

      if (runOpts.spawnDelay !== 0) {
        setTimeout(spawnCb, runOpts.spawnDelay);
        helpers.log(ctx, () => `Will execute '${path}' in ${runOpts.spawnDelay} milliseconds`);
      }

      helpers.log(ctx, () => "About to exit...");
      const killed = killWorkerScript(ctx.workerScript);

      if (runOpts.spawnDelay === 0) {
        helpers.log(ctx, () => `Executing '${path}' immediately`);
        spawnCb();
      }

      if (killed) {
        // This prevents error messages about statements after the spawn()
        // trying to be executed when the script is dead.
        throw new ScriptDeath(ctx.workerScript);
      }
    },
  self: (ctx) => () => {
    const runningScript = helpers.getRunningScript(ctx, ctx.workerScript.pid);
    if (runningScript == null) throw helpers.errorMessage(ctx, "Cannot find running script. This is a bug.");
    return helpers.createPublicRunningScript(runningScript, ctx.workerScript);
  },
  kill:
    (ctx) =>
    (scriptID, host = ctx.workerScript.hostname, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
      let res;
      const killByPid = typeof ident === "number";
      if (killByPid) {
        // Kill by pid
        res = killWorkerScriptByPid(ident, ctx.workerScript);
      } else {
        // Kill by filename/hostname
        if (scriptID === undefined) {
          throw helpers.errorMessage(ctx, "Usage: kill(scriptname, server, [arg1], [arg2]...)");
        }

        const byPid = helpers.getRunningScriptsByArgs(ctx, ident.scriptname, ident.hostname, ident.args);
        if (byPid === null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
          return false;
        }

        res = true;
        for (const pid of byPid.keys()) {
          res &&= killWorkerScriptByPid(pid, ctx.workerScript);
        }
      }

      if (res) {
        if (killByPid) {
          helpers.log(ctx, () => `Killing script with PID ${ident}`);
        } else {
          helpers.log(ctx, () => `Killing '${scriptID}' on '${host}' with args: ${arrayToString(scriptArgs)}.`);
        }
        return true;
      } else {
        if (killByPid) {
          helpers.log(ctx, () => `No script with PID ${ident}`);
        } else {
          helpers.log(
            ctx,
            () => `Internal error killing '${scriptID}' on '${host}' with args: ${arrayToString(scriptArgs)}`,
          );
        }
        return false;
      }
    },
  killall:
    (ctx) =>
    (_host = ctx.workerScript.hostname, _safetyGuard = true) => {
      const host = helpers.string(ctx, "host", _host);
      const safetyGuard = !!_safetyGuard;
      const server = helpers.getServer(ctx, host);

      let scriptsKilled = 0;

      for (const byPid of server.runningScriptMap.values()) {
        for (const pid of byPid.keys()) {
          if (safetyGuard && pid == ctx.workerScript.pid) continue;
          killWorkerScriptByPid(pid, ctx.workerScript);
          ++scriptsKilled;
        }
      }
      helpers.log(ctx, () => `Killing all scripts on '${server.hostname}'.`);

      return scriptsKilled > 0;
    },
  exit: (ctx) => () => {
    helpers.log(ctx, () => "Exiting...");
    killWorkerScript(ctx.workerScript);
    throw new ScriptDeath(ctx.workerScript);
  },
  scp: (ctx) => (_files, _destination, _source) => {
    const destination = helpers.string(ctx, "destination", _destination);
    const source = helpers.string(ctx, "source", _source ?? ctx.workerScript.hostname);
    const destServer = helpers.getServer(ctx, destination);
    const sourceServer = helpers.getServer(ctx, source);
    const files = Array.isArray(_files) ? _files : [_files];
    const lits: FilePath[] = [];
    const contentFiles: ContentFilePath[] = [];
    //First loop through filenames to find all errors before moving anything.
    for (const file of files) {
      const path = helpers.filePath(ctx, "files", file);
      if (hasScriptExtension(path) || hasTextExtension(path)) {
        contentFiles.push(path);
        continue;
      }
      if (!path.endsWith(".lit")) {
        throw helpers.errorMessage(ctx, "Only works for scripts, .lit and .txt files.");
      }
      lits.push(path);
    }

    let noFailures = true;
    // --- Scripts and Text Files---
    for (const contentFilePath of contentFiles) {
      const sourceContentFile = sourceServer.getContentFile(contentFilePath);
      if (!sourceContentFile) {
        helpers.log(ctx, () => `File '${contentFilePath}' does not exist.`);
        noFailures = false;
        continue;
      }
      // Overwrite script if it already exists
      const result = destServer.writeToContentFile(contentFilePath, sourceContentFile.content);
      helpers.log(ctx, () => `Copied file ${contentFilePath} from ${sourceServer.hostname} to ${destServer.hostname}`);
      if (result.overwritten) {
        helpers.log(ctx, () => `Warning: ${contentFilePath} was overwritten on ${destServer.hostname}`);
      }
    }

    // --- Literature Files ---
    for (const litFilePath of lits) {
      const sourceMessage = sourceServer.messages.find((message) => message === litFilePath);
      if (!sourceMessage) {
        helpers.log(ctx, () => `File '${litFilePath}' does not exist.`);
        noFailures = false;
        continue;
      }

      const destMessage = destServer.messages.find((message) => message === litFilePath);
      if (destMessage) {
        helpers.log(ctx, () => `File '${litFilePath}' was already on '${destServer.hostname}'.`);
        continue;
      }

      // It exists in sourceServer.messages, so it's a valid name.
      destServer.messages.push(litFilePath as LiteratureName);
      helpers.log(ctx, () => `File '${litFilePath}' copied over to '${destServer.hostname}'.`);
      continue;
    }
    return noFailures;
  },
  ls: (ctx) => (_host, _substring) => {
    const host = helpers.string(ctx, "host", _host);
    const substring = helpers.string(ctx, "substring", _substring ?? "");
    const server = helpers.getServer(ctx, host);

    const allFilenames = [
      ...server.contracts.map((contract) => contract.fn),
      ...server.messages,
      ...server.programs,
      ...server.scripts.keys(),
      ...server.textFiles.keys(),
    ];

    if (!substring) return allFilenames.sort();
    return allFilenames.filter((filename) => ("/" + filename).includes(substring)).sort();
  },
  getRecentScripts: () => (): RecentScript[] => {
    return recentScripts.map((rs) => ({
      timeOfDeath: rs.timeOfDeath,
      ...helpers.createPublicRunningScript(rs.runningScript),
    }));
  },
  ps:
    (ctx) =>
    (_host = ctx.workerScript.hostname) => {
      const host = helpers.string(ctx, "host", _host);
      const server = helpers.getServer(ctx, host);
      const processes: ProcessInfo[] = [];
      for (const byPid of server.runningScriptMap.values()) {
        for (const script of byPid.values()) {
          processes.push({
            filename: script.filename,
            threads: script.threads,
            args: script.args.slice(),
            pid: script.pid,
            temporary: script.temporary,
          });
        }
      }
      return processes;
    },
  hasRootAccess: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    return server.hasAdminRights;
  },
  getHostname: (ctx) => () => ctx.workerScript.hostname,
  getIP: (ctx) => () => {
    const hostname = ctx.workerScript.hostname;
    const server = helpers.getServer(ctx, hostname);
    return server.ip;
  },
  getHackingLevel: (ctx) => () => {
    Player.updateSkillLevels();
    helpers.log(ctx, () => `returned ${Player.skills.hacking}`);
    return Player.skills.hacking;
  },
  getHackingMultipliers: () => () => {
    return {
      chance: Player.mults.hacking_chance,
      speed: Player.mults.hacking_speed,
      money: Player.mults.hacking_money,
      growth: Player.mults.hacking_grow,
    };
  },
  getHacknetMultipliers: () => () => {
    return {
      production: Player.mults.hacknet_node_money,
      purchaseCost: Player.mults.hacknet_node_purchase_cost,
      ramCost: Player.mults.hacknet_node_ram_cost,
      coreCost: Player.mults.hacknet_node_core_cost,
      levelCost: Player.mults.hacknet_node_level_cost,
    };
  },
  getBitNodeMultipliers:
    (ctx) =>
    (_n = Player.bitNodeN, _lvl = Player.activeSourceFileLvl(Player.bitNodeN) + 1) => {
      if (!canAccessBitNodeFeature(5)) {
        throw helpers.errorMessage(ctx, "Requires Source-File 5 to run.");
      }
      const n = helpers.positiveInteger(ctx, "n", _n);
      const lvl = helpers.positiveInteger(ctx, "lvl", _lvl);
      if (!validBitNodes.includes(n)) {
        throw new Error(`Invalid BitNode: ${n}.`);
      }

      return Object.assign({}, getBitNodeMultipliers(n, lvl));
    },
  getServer: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
    const server = helpers.getServer(ctx, host);
    return {
      hostname: server.hostname,
      ip: server.ip,
      sshPortOpen: server.sshPortOpen,
      ftpPortOpen: server.ftpPortOpen,
      smtpPortOpen: server.smtpPortOpen,
      httpPortOpen: server.httpPortOpen,
      sqlPortOpen: server.sqlPortOpen,
      hasAdminRights: server.hasAdminRights,
      cpuCores: server.cpuCores,
      isConnectedTo: server.isConnectedTo,
      ramUsed: server.ramUsed,
      maxRam: server.maxRam,
      organizationName: server.organizationName,
      purchasedByPlayer: server.purchasedByPlayer,
      backdoorInstalled: server.backdoorInstalled,
      baseDifficulty: server.baseDifficulty,
      hackDifficulty: server.hackDifficulty,
      minDifficulty: server.minDifficulty,
      moneyAvailable: server.hostname === "home" ? Player.money : server.moneyAvailable,
      moneyMax: server.moneyMax,
      numOpenPortsRequired: server.numOpenPortsRequired,
      openPortCount: server.openPortCount,
      requiredHackingSkill: server.requiredHackingSkill,
      serverGrowth: server.serverGrowth,
    };
  },
  getServerMoneyAvailable: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 0;
    }
    if (server.hostname == "home") {
      // Return player's money
      helpers.log(ctx, () => `returned player's money: ${formatMoney(Player.money)}`);
      return Player.money;
    }
    helpers.log(ctx, () => `returned ${formatMoney(server.moneyAvailable)} for '${server.hostname}'`);
    return server.moneyAvailable;
  },
  getServerSecurityLevel: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.hackDifficulty)} for '${server.hostname}'`);
    return server.hackDifficulty;
  },
  getServerBaseSecurityLevel: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.baseDifficulty)} for '${server.hostname}'`);
    return server.baseDifficulty;
  },
  getServerMinSecurityLevel: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.minDifficulty)} for ${server.hostname}`);
    return server.minDifficulty;
  },
  getServerRequiredHackingLevel: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatNumberNoSuffix(server.requiredHackingSkill, 0)} for '${server.hostname}'`);
    return server.requiredHackingSkill;
  },
  getServerMaxMoney: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 0;
    }
    helpers.log(ctx, () => `returned ${formatMoney(server.moneyMax)} for '${server.hostname}'`);
    return server.moneyMax;
  },
  getServerGrowth: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${server.serverGrowth} for '${server.hostname}'`);
    return server.serverGrowth;
  },
  getServerNumPortsRequired: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 5;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 5;
    }
    helpers.log(ctx, () => `returned ${server.numOpenPortsRequired} for '${server.hostname}'`);
    return server.numOpenPortsRequired;
  },
  getServerMaxRam: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    helpers.log(ctx, () => `returned ${formatRam(server.maxRam)}`);
    return server.maxRam;
  },
  getServerUsedRam: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    helpers.log(ctx, () => `returned ${formatRam(server.ramUsed)}`);
    return server.ramUsed;
  },
  dnsLookup: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    return isIPAddress(host) ? server.hostname : server.ip;
  },
  serverExists: (ctx) => (_host) => {
    const host = helpers.string(ctx, "host", _host);
    const server = GetServer(host);
    return server !== null && (server.serversOnNetwork.length > 0 || server.hostname === "home");
  },
  fileExists: (ctx) => (_filename, _host) => {
    const filename = helpers.string(ctx, "filename", _filename);
    const host = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
    const server = helpers.getServer(ctx, host);
    const path = resolveFilePath(filename, ctx.workerScript.name);
    if (!path) return false;
    if (hasScriptExtension(path)) return server.scripts.has(path);
    if (hasTextExtension(path)) return server.textFiles.has(path);
    if (path.endsWith(".lit") || path.endsWith(".msg"))
      return server.messages.includes(path as LiteratureName | MessageFilename);
    if (hasContractExtension(path)) return !!server.contracts.find(({ fn }) => fn === path);
    const lowerPath = path.toLowerCase();
    return server.programs.map((programName) => programName.toLowerCase()).includes(lowerPath);
  },
  isRunning:
    (ctx) =>
    (fn, host, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, fn, host, scriptArgs);
      return helpers.getRunningScript(ctx, ident) !== null;
    },
  getPurchasedServerLimit: () => () => {
    return getPurchaseServerLimit();
  },
  getPurchasedServerMaxRam: () => () => {
    return getPurchaseServerMaxRam();
  },
  getPurchasedServerCost: (ctx) => (_ram) => {
    const ram = helpers.number(ctx, "ram", _ram);

    const cost = getPurchaseServerCost(ram);
    if (cost === Infinity) {
      if (ram > getPurchaseServerMaxRam()) {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must not be greater than getPurchaseServerMaxRam`);
      } else {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must be a positive power of 2`);
      }
      return Infinity;
    }

    return cost;
  },
  purchaseServer: (ctx) => (_name, _ram) => {
    const name = helpers.string(ctx, "name", _name);
    const ram = helpers.number(ctx, "ram", _ram);
    let hostnameStr = String(name);
    hostnameStr = hostnameStr.replace(/\s+/g, "");
    if (hostnameStr == "" || isIPAddress(hostnameStr)) {
      helpers.log(ctx, () => `Invalid argument: hostname='${hostnameStr}'`);
      return "";
    }
    if (hostnameStr.startsWith("hacknet-node-") || hostnameStr.startsWith("hacknet-server-")) {
      helpers.log(ctx, () => `Invalid argument: hostname='${hostnameStr}' is a reserved hostname.`);
      return "";
    }

    if (Player.purchasedServers.length >= getPurchaseServerLimit()) {
      helpers.log(
        ctx,
        () =>
          `You have reached the maximum limit of ${getPurchaseServerLimit()} servers. You cannot purchase any more.`,
      );
      return "";
    }

    const cost = getPurchaseServerCost(ram);
    if (cost === Infinity) {
      if (ram > getPurchaseServerMaxRam()) {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must not be greater than getPurchaseServerMaxRam`);
      } else {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must be a positive power of 2`);
      }

      return "";
    }

    if (Player.money < cost) {
      helpers.log(ctx, () => `Not enough money to purchase server. Need ${formatMoney(cost)}`);
      return "";
    }
    const newServ = safelyCreateUniqueServer({
      ip: createUniqueRandomIp(),
      hostname: hostnameStr,
      organizationName: "",
      isConnectedTo: false,
      adminRights: true,
      purchasedByPlayer: true,
      maxRam: ram,
    });
    AddToAllServers(newServ);

    Player.purchasedServers.push(newServ.hostname);
    const homeComputer = Player.getHomeComputer();
    homeComputer.serversOnNetwork.push(newServ.hostname);
    newServ.serversOnNetwork.push(homeComputer.hostname);
    Player.loseMoney(cost, "servers");
    helpers.log(ctx, () => `Purchased new server with hostname '${newServ.hostname}' for ${formatMoney(cost)}`);
    return newServ.hostname;
  },

  getPurchasedServerUpgradeCost: (ctx) => (_host, _ram) => {
    const host = helpers.string(ctx, "host", _host);
    const ram = helpers.number(ctx, "ram", _ram);
    try {
      return getPurchasedServerUpgradeCost(host, ram);
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return -1;
    }
  },

  upgradePurchasedServer: (ctx) => (_host, _ram) => {
    const host = helpers.string(ctx, "host", _host);
    const ram = helpers.number(ctx, "ram", _ram);
    try {
      upgradePurchasedServer(host, ram);
      return true;
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return false;
    }
  },

  renamePurchasedServer: (ctx) => (_hostname, _newName) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const newName = helpers.string(ctx, "newName", _newName);
    try {
      renamePurchasedServer(hostname, newName);
      return true;
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return false;
    }
  },

  deleteServer: (ctx) => (_name) => {
    const name = helpers.string(ctx, "name", _name);
    let hostnameStr = String(name);
    hostnameStr = hostnameStr.replace(/\s\s+/g, "");
    const server = GetServer(hostnameStr);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => `Invalid argument: hostname='${hostnameStr}'`);
      return false;
    }

    if (!server.purchasedByPlayer || server.hostname === "home") {
      helpers.log(ctx, () => "Cannot delete non-purchased server.");
      return false;
    }

    const hostname = server.hostname;

    // Can't delete server you're currently connected to
    if (server.isConnectedTo) {
      helpers.log(ctx, () => "You are currently connected to the server you are trying to delete.");
      return false;
    }

    // A server cannot delete itself
    if (hostname === ctx.workerScript.hostname) {
      helpers.log(ctx, () => "Cannot delete the server this script is running on.");
      return false;
    }

    // Delete all scripts running on server
    if (server.runningScriptMap.size > 0) {
      helpers.log(ctx, () => `Cannot delete server '${hostname}' because it still has scripts running.`);
      return false;
    }

    // Delete from player's purchasedServers array
    let found = false;
    for (let i = 0; i < Player.purchasedServers.length; ++i) {
      if (hostname == Player.purchasedServers[i]) {
        found = true;
        Player.purchasedServers.splice(i, 1);
        break;
      }
    }

    if (!found) {
      helpers.log(
        ctx,
        () => `Could not identify server ${hostname} as a purchased server. This is a bug. Report to dev.`,
      );
      return false;
    }

    // Delete from all servers
    DeleteServer(hostname);

    // Delete from home computer
    found = false;
    const homeComputer = Player.getHomeComputer();
    for (let i = 0; i < homeComputer.serversOnNetwork.length; ++i) {
      if (hostname == homeComputer.serversOnNetwork[i]) {
        homeComputer.serversOnNetwork.splice(i, 1);
        helpers.log(ctx, () => `Deleted server '${hostnameStr}`);
        return true;
      }
    }
    // Wasn't found on home computer
    helpers.log(ctx, () => `Could not find server ${hostname} as a purchased server. This is a bug. Report to dev.`);
    return false;
  },
  getPurchasedServers:
    (ctx) =>
    (_returnOpts): string[] => {
      const returnOpts = helpers.hostReturnOptions(_returnOpts);
      const res: string[] = [];
      for (const hostname of Player.purchasedServers) {
        const server = helpers.getServer(ctx, hostname);
        const id = helpers.returnServerID(server, returnOpts);
        res.push(id);
      }
      return res;
    },
  writePort: (ctx) => (_portNumber, data) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return writePort(portNumber, data);
  },
  write: (ctx) => (_filename, _data, _mode) => {
    const filepath = helpers.filePath(ctx, "filename", _filename);
    const data = helpers.string(ctx, "data", _data ?? "");
    const mode = helpers.string(ctx, "mode", _mode ?? "a");

    const server = helpers.getServer(ctx, ctx.workerScript.hostname);

    if (hasScriptExtension(filepath)) {
      if (mode === "w") {
        server.writeToScriptFile(filepath, data);
        return;
      }
      const existingScript = server.scripts.get(filepath);
      const existingCode = existingScript ? existingScript.code : "";
      server.writeToScriptFile(filepath, existingCode + data);
      return;
    }
    if (!hasTextExtension(filepath)) {
      throw helpers.errorMessage(ctx, `File path should be a text file or script. ${filepath} is invalid.`);
    }
    if (mode === "w") {
      server.writeToTextFile(filepath, data);
      return;
    }
    const existingTextFile = server.textFiles.get(filepath);
    const existingText = existingTextFile?.text ?? "";
    server.writeToTextFile(filepath, mode === "w" ? data : existingText + data);
  },
  tryWritePort: (ctx) => (_portNumber, data) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return tryWritePort(portNumber, data);
  },
  nextPortWrite: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return nextPortWrite(portNumber);
  },
  readPort: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return readPort(portNumber);
  },
  read: (ctx) => (_filename) => {
    const path = helpers.filePath(ctx, "filename", _filename);
    if (!hasScriptExtension(path) && !hasTextExtension(path)) return "";
    const server = ctx.workerScript.getServer();
    return server.getContentFile(path)?.content ?? "";
  },
  peek: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return peekPort(portNumber);
  },
  clear: (ctx) => (_file) => {
    const path = helpers.filePath(ctx, "file", _file);
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      throw helpers.errorMessage(ctx, `Invalid file path or extension: ${_file}`);
    }
    const server = ctx.workerScript.getServer();
    const file = server.getContentFile(path);
    if (!file) throw helpers.errorMessage(ctx, `${path} does not exist on ${server.hostname}`);
    // The content setter handles invalidating script modules where applicable.
    file.content = "";
  },
  clearPort: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return clearPort(portNumber);
  },
  getPortHandle: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return portHandle(portNumber);
  },
  rm: (ctx) => (_fn, _host) => {
    const filepath = helpers.filePath(ctx, "fn", _fn);
    const host = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
    const s = helpers.getServer(ctx, host);
    if (!filepath) {
      helpers.log(ctx, () => `Error while parsing filepath ${filepath}`);
      return false;
    }

    const status = s.removeFile(filepath);
    if (!status.res) {
      helpers.log(ctx, () => status.msg + "");
    }

    return status.res;
  },
  scriptRunning: (ctx) => (_scriptname, _host) => {
    const scriptname = helpers.scriptPath(ctx, "scriptname", _scriptname);
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    return server.isRunning(scriptname);
  },
  scriptKill: (ctx) => (_scriptname, _host) => {
    const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    let suc = false;

    const pattern = matchScriptPathExact(escapeRegExp(path));
    for (const [key, byPid] of server.runningScriptMap) {
      if (!pattern.test(key)) continue;
      suc = true;
      for (const pid of byPid.keys()) {
        killWorkerScriptByPid(pid, ctx.workerScript);
      }
    }
    return suc;
  },
  getScriptName: (ctx) => () => ctx.workerScript.name,
  getScriptRam: (ctx) => (_scriptname, _host) => {
    const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
    const host = helpers.string(ctx, "hostname", _host ?? ctx.workerScript.hostname);
    const server = helpers.getServer(ctx, host);
    const script = server.scripts.get(path);
    if (!script) return 0;
    const ramUsage = script.getRamUsage(server.scripts);
    if (!ramUsage) {
      helpers.log(ctx, () => `Could not calculate ram usage for ${path} on ${host}.`);
      return 0;
    }
    return ramUsage;
  },
  getRunningScript:
    (ctx) =>
    (fn, host, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, host, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript === null) return null;
      // Need to look this up again, because we only have ident-based lookup
      // for RunningScript.
      const ws = workerScripts.get(runningScript.pid);
      // We don't check for null, since it's fine to pass null as the 2nd arg.
      return helpers.createPublicRunningScript(runningScript, ws);
    },
  ramOverride: (ctx) => (_ram) => {
    const newRam = roundToTwo(helpers.number(ctx, "ram", _ram || 0));
    const rs = ctx.workerScript.scriptRef;
    const server = ctx.workerScript.getServer();
    if (newRam < roundToTwo(ctx.workerScript.dynamicRamUsage)) {
      // Impossibly small, return immediately.
      return rs.ramUsage;
    }
    const newServerRamUsed = roundToTwo(server.ramUsed + (newRam - rs.ramUsage) * rs.threads);
    if (newServerRamUsed > server.maxRam) {
      // Can't allocate more RAM.
      return rs.ramUsage;
    }
    if (newServerRamUsed <= 0) {
      throw helpers.errorMessage(
        ctx,
        `Game error: Calculated impossible new server ramUsed ${newServerRamUsed} from new limit of ${_ram}`,
      );
    }
    server.updateRamUsed(newServerRamUsed);
    rs.ramUsage = newRam;
    return rs.ramUsage;
  },
  getHackTime:
    (ctx) =>
    (_host = ctx.workerScript.hostname) => {
      const host = helpers.string(ctx, "hostname", _host);
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateHackingTime(server, Player) * 1000;
    },
  getGrowTime:
    (ctx) =>
    (_host = ctx.workerScript.hostname) => {
      const host = helpers.string(ctx, "host", _host);
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateGrowTime(server, Player) * 1000;
    },
  getWeakenTime:
    (ctx) =>
    (_host = ctx.workerScript.hostname) => {
      const host = helpers.string(ctx, "hostname", _host);
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateWeakenTime(server, Player) * 1000;
    },
  getTotalScriptIncome: () => () => {
    // First element is total income of all currently running scripts
    let total = 0;
    for (const script of workerScripts.values()) {
      total += script.scriptRef.onlineMoneyMade / script.scriptRef.onlineRunningTime;
    }

    let incomeFromScriptsSinceLastAug = Player.scriptProdSinceLastAug / (Player.playtimeSinceLastAug / 1000);
    if (!Number.isFinite(incomeFromScriptsSinceLastAug)) {
      incomeFromScriptsSinceLastAug = 0;
    }
    return [total, incomeFromScriptsSinceLastAug];
  },
  getScriptIncome:
    (ctx) =>
    (fn, host, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, host, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return -1;
      }
      return runningScript.onlineMoneyMade / runningScript.onlineRunningTime;
    },
  getTotalScriptExpGain: () => () => {
    let total = 0;
    for (const ws of workerScripts.values()) {
      total += ws.scriptRef.onlineExpGained / ws.scriptRef.onlineRunningTime;
    }
    return total;
  },
  getScriptExpGain:
    (ctx) =>
    (fn, host, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, host, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return -1;
      }
      return runningScript.onlineExpGained / runningScript.onlineRunningTime;
    },
  formatNumber:
    (ctx) =>
    (_n, _fractionalDigits = 3, _suffixStart = 1000, isInteger) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      const suffixStart = helpers.number(ctx, "suffixStart", _suffixStart);
      return formatNumber(n, fractionalDigits, suffixStart, !!isInteger);
    },
  formatRam:
    (ctx) =>
    (_n, _fractionalDigits = 2) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      return formatRam(n, fractionalDigits);
    },
  formatPercent:
    (ctx) =>
    (_n, _fractionalDigits = 2, _multStart = 1e6) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      const multStart = helpers.number(ctx, "multStart", _multStart);
      return formatPercent(n, fractionalDigits, multStart);
    },
  // Todo: Remove function for real though in 2.4. Until then it just directly wraps numeral.
  nFormat: (ctx) => (_n, _format) => {
    deprecationWarning(
      "ns.nFormat",
      "Use ns.formatNumber, ns.formatRam, ns.formatPercent, or JS built-in objects/functions (e.g., Intl namespace) instead. " +
        "Check the NS API documentation for details.",
    );
    const n = helpers.number(ctx, "n", _n);
    const format = helpers.string(ctx, "format", _format);
    return numeral(n).format(format);
  },
  tFormat: (ctx) => (_milliseconds, _milliPrecision) => {
    const milliseconds = helpers.number(ctx, "milliseconds", _milliseconds);
    const milliPrecision = !!_milliPrecision;
    return convertTimeMsToTimeElapsedString(milliseconds, milliPrecision);
  },
  getTimeSinceLastAug: () => () => {
    deprecationWarning(
      "ns.getTimeSinceLastAug()",
      "Use `Date.now() - ns.getResetInfo().lastAugReset` instead. Please note that ns.getResetInfo().lastAugReset does NOT return the " +
        "same value as ns.getTimeSinceLastAug(). Check the NS API documentation for details.",
    );
    return Player.playtimeSinceLastAug;
  },
  alert: (ctx) => (_message) => {
    const message = helpers.string(ctx, "message", _message);
    dialogBoxCreate(message, { html: true, canBeDismissedEasily: true });
  },
  toast:
    (ctx) =>
    (_message, _variant = ToastVariant.SUCCESS, _duration = 2000) => {
      const message = helpers.string(ctx, "message", _message);
      const variant = getEnumHelper("ToastVariant").nsGetMember(ctx, _variant);
      const duration = _duration === null ? null : helpers.number(ctx, "duration", _duration);
      SnackbarEvents.emit(message, variant as ToastVariant, duration);
    },
  prompt: (ctx) => (_txt, _options) => {
    const options: { type?: string; choices?: string[] } = {};
    _options ??= options;
    const txt = helpers.string(ctx, "txt", _txt);
    assert(_options, assertObject, (type) =>
      helpers.errorMessage(ctx, `Invalid type for options: ${type}. Should be object.`, "TYPE"),
    );
    if (_options.type !== undefined) {
      assert(_options.type, assertString, (type) =>
        helpers.errorMessage(ctx, `Invalid type for options.type: ${type}. Should be string.`, "TYPE"),
      );
      options.type = _options.type;
      const validTypes = ["boolean", "text", "select"];
      if (!["boolean", "text", "select"].includes(options.type)) {
        throw helpers.errorMessage(
          ctx,
          `Invalid value for options.type: ${options.type}. Must be one of ${validTypes.join(", ")}.`,
        );
      }
      if (options.type === "select") {
        assert(_options.choices, assertArray, (type) =>
          helpers.errorMessage(
            ctx,
            `Invalid type for options.choices: ${type}. If options.type is "select", options.choices must be an array.`,
            "TYPE",
          ),
        );
        options.choices = _options.choices.map((choice, i) => helpers.string(ctx, `options.choices[${i}]`, choice));
      }
    }
    return new Promise(function (resolve) {
      PromptEvent.emit({
        txt: txt,
        options,
        resolve: resolve,
      });
    });
  },
  wget: (ctx) => async (_url, _target, _host) => {
    const url = helpers.string(ctx, "url", _url);
    const target = helpers.filePath(ctx, "target", _target);
    const host = _host ? helpers.string(ctx, "hostname", _host) : ctx.workerScript.hostname;
    const server = helpers.getServer(ctx, host);
    if (!target || (!hasTextExtension(target) && !hasScriptExtension(target))) {
      helpers.log(ctx, () => `Invalid target file: '${target}'. Must be a script or text file.`);
      return false;
    }
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      /**
       * Properties in error are not enumerable, so JSON.stringify(error) returns "{}". We need to explicitly specify
       * the properties in the "replacer" parameter of JSON.stringify. We can do it by using Object.getOwnPropertyNames.
       *
       * Ref:
       * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
       * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
       * - https://stackoverflow.com/q/18391212
       */
      helpers.log(ctx, () => JSON.stringify(error, Object.getOwnPropertyNames(error)));
      return false;
    }
    if (response.status !== 200) {
      helpers.log(ctx, () => `wget failed. HTTP code: ${response.status}.`);
      return false;
    }
    const writeResult = server.writeToContentFile(target, await response.text());
    if (writeResult.overwritten) {
      helpers.log(ctx, () => `Successfully retrieved content and overwrote '${target}' on '${host}'`);
    } else {
      helpers.log(ctx, () => `Successfully retrieved content to new file '${target}' on '${host}'`);
    }
    return true;
  },
  getFavorToDonate: () => () => {
    return Math.floor(CONSTANTS.BaseFavorToDonate * currentNodeMults.RepToDonateToFaction);
  },
  getPlayer: () => () => {
    const data = {
      // Person
      hp: structuredClone(Player.hp),
      skills: structuredClone(Player.skills),
      exp: structuredClone(Player.exp),
      mults: structuredClone(Player.mults),
      city: Player.city,
      // Player-specific
      numPeopleKilled: Player.numPeopleKilled,
      money: Player.money,
      location: Player.location,
      totalPlaytime: Player.totalPlaytime,
      jobs: structuredClone(Player.jobs),
      factions: Player.factions.slice(),
      entropy: Player.entropy,
      karma: Player.karma,
    };
    setDeprecatedProperties(data, {
      playtimeSinceLastAug: {
        identifier: "ns.getPlayer().playtimeSinceLastAug",
        message: "Use ns.getResetInfo().lastAugReset instead. This is a static timestamp instead of an elapsed time.",
        value: Player.playtimeSinceLastAug,
      },
      playtimeSinceLastBitnode: {
        identifier: "ns.getPlayer().playtimeSinceLastBitnode",
        message: "Use ns.getResetInfo().lastNodeReset instead. This is a static timestamp instead of an elapsed time.",
        value: Player.playtimeSinceLastBitnode,
      },
      bitNodeN: {
        identifier: "ns.getPlayer().bitNodeN",
        message: "Use ns.getResetInfo().currentNode instead",
        value: Player.bitNodeN,
      },
    });
    return data;
  },
  getMoneySources: () => () => ({
    sinceInstall: Object.assign({}, Player.moneySourceA),
    sinceStart: Object.assign({}, Player.moneySourceB),
  }),
  atExit: (ctx) => (callback, _id) => {
    const id = _id ? helpers.string(ctx, "id", _id) : "default";
    assertFunctionWithNSContext(ctx, "callback", callback);
    ctx.workerScript.atExit.set(id, callback);
  },
  mv: (ctx) => (_host, _source, _destination) => {
    const host = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, host);
    const sourcePath = helpers.filePath(ctx, "source", _source);
    const destinationPath = helpers.filePath(ctx, "destination", _destination);

    if (
      (!hasTextExtension(sourcePath) && !hasScriptExtension(sourcePath)) ||
      (!hasTextExtension(destinationPath) && !hasScriptExtension(destinationPath))
    ) {
      throw helpers.errorMessage(ctx, `'mv' can only be used on scripts and text files (.txt)`);
    }
    if (sourcePath === destinationPath) {
      helpers.log(ctx, () => "WARNING: Did nothing, source and destination paths were the same.");
      return;
    }
    const sourceContentFile = server.getContentFile(sourcePath);
    if (!sourceContentFile) {
      throw helpers.errorMessage(ctx, `Source text file ${sourcePath} does not exist on ${host}`);
    }
    const success = sourceContentFile.deleteFromServer(server);
    if (success) {
      const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
      if (overwritten) helpers.log(ctx, () => `WARNING: Overwriting file ${destinationPath} on ${host}`);
      helpers.log(ctx, () => `Moved ${sourcePath} to ${destinationPath} on ${host}`);
      return;
    }
    helpers.log(ctx, () => `ERROR: Failed. Was unable to remove file ${sourcePath} from its original location.`);
  },
  getResetInfo: () => () => ({
    lastAugReset: Player.lastAugReset,
    lastNodeReset: Player.lastNodeReset,
    currentNode: Player.bitNodeN,
    ownedAugs: new Map(Player.augmentations.map((aug) => [aug.name, aug.level])),
    ownedSF: new Map(
      [...Player.activeSourceFiles].filter(([__, activeLevel]) => {
        return activeLevel > 0;
      }),
    ),
    bitNodeOptions: {
      ...Player.bitNodeOptions,
      sourceFileOverrides: new Map(Player.bitNodeOptions.sourceFileOverrides),
    },
  }),
  getFunctionRamCost: (ctx) => (_name) => {
    const name = helpers.string(ctx, "name", _name);
    return getRamCost(name.split("."), true);
  },
  tprintRaw: () => (value) => {
    Terminal.printRaw(wrapUserNode(value));
  },
  printRaw: (ctx) => (value) => {
    ctx.workerScript.print(wrapUserNode(value));
  },
  dynamicImport: (ctx) => async (value) => {
    const path = helpers.scriptPath(ctx, "path", value);
    const server = helpers.getServer(ctx, ctx.workerScript.hostname);
    const script = server.getContentFile(path);

    if (!script) throw helpers.errorMessage(ctx, `Script was not found\nPath: ${path}`);

    //We validated the path as ScriptFilePath and made sure script is not null
    //Script **must** be a script at this point
    return compile(script as Script, server.scripts);
  },
  flags: Flags,
  heart: { break: () => () => Player.karma },
  ...NetscriptExtra(),
};

// Removed functions
setRemovedFunctions(ns, {
  getServerRam: { version: "2.2.0", replacement: "getServerMaxRam and getServerUsedRam" },
});

export function NetscriptFunctions(ws: WorkerScript): NSFull {
  return NSProxy(ws, ns, [], { args: ws.args.slice(), pid: ws.pid, enums });
}

const possibleLogs = Object.fromEntries(getFunctionNames(ns, "").map((a) => [a, true]));
possibleLogs.ALL = true;

// We reuse this object for *all* scripts that disable all keys, to prevent memory growth.
// Any script that needs a custom set of values will use a fresh object.
const allDisabled = { ALL: true } as const;

/** Provides an array of all function names on a nested object */
function getFunctionNames(obj: object, prefix: string): string[] {
  const functionNames: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === "args") {
      continue;
    } else if (typeof value === "function") {
      functionNames.push(prefix + key);
    } else if (typeof value === "object") {
      functionNames.push(...getFunctionNames(value as object, `${prefix}${key}.`));
    }
  }
  return functionNames;
}
