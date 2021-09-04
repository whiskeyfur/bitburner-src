import { IMap } from "../types";

// TODO remember to update RamCalculations.js and WorkerScript.js

// RAM costs for Netscript functions
export const RamCostConstants: IMap<number> = {
  ScriptBaseRamCost: 1.6,
  ScriptDomRamCost: 25,
  ScriptHackRamCost: 0.1,
  ScriptHackAnalyzeRamCost: 1,
  ScriptGrowRamCost: 0.15,
  ScriptGrowthAnalyzeRamCost: 1,
  ScriptWeakenRamCost: 0.15,
  ScriptScanRamCost: 0.2,
  ScriptPortProgramRamCost: 0.05,
  ScriptRunRamCost: 1.0,
  ScriptExecRamCost: 1.3,
  ScriptSpawnRamCost: 2.0,
  ScriptScpRamCost: 0.6,
  ScriptKillRamCost: 0.5,
  ScriptHasRootAccessRamCost: 0.05,
  ScriptGetHostnameRamCost: 0.05,
  ScriptGetHackingLevelRamCost: 0.05,
  ScriptGetMultipliersRamCost: 4.0,
  ScriptGetServerRamCost: 0.1,
  ScriptGetServerMaxRam: 0.05,
  ScriptGetServerUsedRam: 0.05,
  ScriptFileExistsRamCost: 0.1,
  ScriptIsRunningRamCost: 0.1,
  ScriptHacknetNodesRamCost: 4.0,
  ScriptHNUpgLevelRamCost: 0.4,
  ScriptHNUpgRamRamCost: 0.6,
  ScriptHNUpgCoreRamCost: 0.8,
  ScriptGetStockRamCost: 2.0,
  ScriptBuySellStockRamCost: 2.5,
  ScriptGetPurchaseServerRamCost: 0.25,
  ScriptPurchaseServerRamCost: 2.25,
  ScriptGetPurchasedServerLimit: 0.05,
  ScriptGetPurchasedServerMaxRam: 0.05,
  ScriptRoundRamCost: 0.05,
  ScriptReadWriteRamCost: 1.0,
  ScriptArbScriptRamCost: 1.0,
  ScriptGetScriptRamCost: 0.1,
  ScriptGetRunningScriptRamCost: 0.3,
  ScriptGetHackTimeRamCost: 0.05,
  ScriptGetFavorToDonate: 0.1,
  ScriptCodingContractBaseRamCost: 10,
  ScriptSleeveBaseRamCost: 4,

  ScriptSingularityFn1RamCost: 2,
  ScriptSingularityFn2RamCost: 3,
  ScriptSingularityFn3RamCost: 5,

  ScriptGangApiBaseRamCost: 4,

  ScriptBladeburnerApiBaseRamCost: 4,
};

export const RamCosts: IMap<any> = {
  hacknet: {
    numNodes: () => 0,
    purchaseNode: () => 0,
    getPurchaseNodeCost: () => 0,
    getNodeStats: () => 0,
    upgradeLevel: () => 0,
    upgradeRam: () => 0,
    upgradeCore: () => 0,
    upgradeCache: () => 0,
    getLevelUpgradeCost: () => 0,
    getRamUpgradeCost: () => 0,
    getCoreUpgradeCost: () => 0,
    getCacheUpgradeCost: () => 0,
    numHashes: () => 0,
    hashCost: () => 0,
    spendHashes: () => 0,
  },
  sprintf: () => 0,
  vsprintf: () => 0,
  scan: () => RamCostConstants.ScriptScanRamCost,
  hack: () => RamCostConstants.ScriptHackRamCost,
  hackAnalyzeThreads: () => RamCostConstants.ScriptHackAnalyzeRamCost,
  hackAnalyzePercent: () => RamCostConstants.ScriptHackAnalyzeRamCost,
  hackChance: () => RamCostConstants.ScriptHackAnalyzeRamCost,
  sleep: () => 0,
  grow: () => RamCostConstants.ScriptGrowRamCost,
  growthAnalyze: () => RamCostConstants.ScriptGrowthAnalyzeRamCost,
  weaken: () => RamCostConstants.ScriptWeakenRamCost,
  print: () => 0,
  tprint: () => 0,
  clearLog: () => 0,
  disableLog: () => 0,
  enableLog: () => 0,
  isLogEnabled: () => 0,
  getScriptLogs: () => 0,
  nuke: () => RamCostConstants.ScriptPortProgramRamCost,
  brutessh: () => RamCostConstants.ScriptPortProgramRamCost,
  ftpcrack: () => RamCostConstants.ScriptPortProgramRamCost,
  relaysmtp: () => RamCostConstants.ScriptPortProgramRamCost,
  httpworm: () => RamCostConstants.ScriptPortProgramRamCost,
  sqlinject: () => RamCostConstants.ScriptPortProgramRamCost,
  run: () => RamCostConstants.ScriptRunRamCost,
  exec: () => RamCostConstants.ScriptExecRamCost,
  spawn: () => RamCostConstants.ScriptSpawnRamCost,
  kill: () => RamCostConstants.ScriptKillRamCost,
  killall: () => RamCostConstants.ScriptKillRamCost,
  exit: () => 0,
  scp: () => RamCostConstants.ScriptScpRamCost,
  ls: () => RamCostConstants.ScriptScanRamCost,
  ps: () => RamCostConstants.ScriptScanRamCost,
  hasRootAccess: () => RamCostConstants.ScriptHasRootAccessRamCost,
  getIp: () => RamCostConstants.ScriptGetHostnameRamCost,
  getHostname: () => RamCostConstants.ScriptGetHostnameRamCost,
  getHackingLevel: () => RamCostConstants.ScriptGetHackingLevelRamCost,
  getHackingMultipliers: () => RamCostConstants.ScriptGetMultipliersRamCost,
  getHacknetMultipliers: () => RamCostConstants.ScriptGetMultipliersRamCost,
  getBitNodeMultipliers: () => RamCostConstants.ScriptGetMultipliersRamCost,
  getServer: () => RamCostConstants.ScriptGetMultipliersRamCost / 2,
  getServerMoneyAvailable: () => RamCostConstants.ScriptGetServerRamCost,
  getServerSecurityLevel: () => RamCostConstants.ScriptGetServerRamCost,
  getServerBaseSecurityLevel: () => RamCostConstants.ScriptGetServerRamCost,
  getServerMinSecurityLevel: () => RamCostConstants.ScriptGetServerRamCost,
  getServerRequiredHackingLevel: () => RamCostConstants.ScriptGetServerRamCost,
  getServerMaxMoney: () => RamCostConstants.ScriptGetServerRamCost,
  getServerGrowth: () => RamCostConstants.ScriptGetServerRamCost,
  getServerNumPortsRequired: () => RamCostConstants.ScriptGetServerRamCost,
  getServerRam: () => RamCostConstants.ScriptGetServerRamCost,
  getServerMaxRam: () => RamCostConstants.ScriptGetServerMaxRam,
  getServerUsedRam: () => RamCostConstants.ScriptGetServerUsedRam,
  serverExists: () => RamCostConstants.ScriptGetServerRamCost,
  fileExists: () => RamCostConstants.ScriptFileExistsRamCost,
  isRunning: () => RamCostConstants.ScriptIsRunningRamCost,
  getStockSymbols: () => RamCostConstants.ScriptGetStockRamCost,
  getStockPrice: () => RamCostConstants.ScriptGetStockRamCost,
  getStockAskPrice: () => RamCostConstants.ScriptGetStockRamCost,
  getStockBidPrice: () => RamCostConstants.ScriptGetStockRamCost,
  getStockPosition: () => RamCostConstants.ScriptGetStockRamCost,
  getStockMaxShares: () => RamCostConstants.ScriptGetStockRamCost,
  getStockPurchaseCost: () => RamCostConstants.ScriptGetStockRamCost,
  getStockSaleGain: () => RamCostConstants.ScriptGetStockRamCost,
  buyStock: () => RamCostConstants.ScriptBuySellStockRamCost,
  sellStock: () => RamCostConstants.ScriptBuySellStockRamCost,
  shortStock: () => RamCostConstants.ScriptBuySellStockRamCost,
  sellShort: () => RamCostConstants.ScriptBuySellStockRamCost,
  placeOrder: () => RamCostConstants.ScriptBuySellStockRamCost,
  cancelOrder: () => RamCostConstants.ScriptBuySellStockRamCost,
  getOrders: () => RamCostConstants.ScriptBuySellStockRamCost,
  getStockVolatility: () => RamCostConstants.ScriptBuySellStockRamCost,
  getStockForecast: () => RamCostConstants.ScriptBuySellStockRamCost,
  purchase4SMarketData: () => RamCostConstants.ScriptBuySellStockRamCost,
  purchase4SMarketDataTixApi: () => RamCostConstants.ScriptBuySellStockRamCost,
  getPurchasedServerLimit: () => RamCostConstants.ScriptGetPurchasedServerLimit,
  getPurchasedServerMaxRam: () =>
    RamCostConstants.ScriptGetPurchasedServerMaxRam,
  getPurchasedServerCost: () => RamCostConstants.ScriptGetPurchaseServerRamCost,
  purchaseServer: () => RamCostConstants.ScriptPurchaseServerRamCost,
  deleteServer: () => RamCostConstants.ScriptPurchaseServerRamCost,
  getPurchasedServers: () => RamCostConstants.ScriptPurchaseServerRamCost,
  write: () => RamCostConstants.ScriptReadWriteRamCost,
  tryWrite: () => RamCostConstants.ScriptReadWriteRamCost,
  read: () => RamCostConstants.ScriptReadWriteRamCost,
  peek: () => RamCostConstants.ScriptReadWriteRamCost,
  clear: () => RamCostConstants.ScriptReadWriteRamCost,
  getPortHandle: () => RamCostConstants.ScriptReadWriteRamCost * 10,
  rm: () => RamCostConstants.ScriptReadWriteRamCost,
  scriptRunning: () => RamCostConstants.ScriptArbScriptRamCost,
  scriptKill: () => RamCostConstants.ScriptArbScriptRamCost,
  getScriptName: () => 0,
  getScriptRam: () => RamCostConstants.ScriptGetScriptRamCost,
  getHackTime: () => RamCostConstants.ScriptGetHackTimeRamCost,
  getGrowTime: () => RamCostConstants.ScriptGetHackTimeRamCost,
  getWeakenTime: () => RamCostConstants.ScriptGetHackTimeRamCost,
  getScriptIncome: () => RamCostConstants.ScriptGetScriptRamCost,
  getScriptExpGain: () => RamCostConstants.ScriptGetScriptRamCost,
  getRunningScript: () => RamCostConstants.ScriptGetRunningScriptRamCost,
  nFormat: () => 0,
  getTimeSinceLastAug: () => RamCostConstants.ScriptGetHackTimeRamCost,
  prompt: () => 0,
  wget: () => 0,
  getFavorToDonate: () => RamCostConstants.ScriptGetFavorToDonate,

  // Singularity Functions
  universityCourse: () => RamCostConstants.ScriptSingularityFn1RamCost,
  gymWorkout: () => RamCostConstants.ScriptSingularityFn1RamCost,
  travelToCity: () => RamCostConstants.ScriptSingularityFn1RamCost,
  purchaseTor: () => RamCostConstants.ScriptSingularityFn1RamCost,
  purchaseProgram: () => RamCostConstants.ScriptSingularityFn1RamCost,
  getCurrentServer: () => RamCostConstants.ScriptSingularityFn1RamCost,
  connect: () => RamCostConstants.ScriptSingularityFn1RamCost,
  manualHack: () => RamCostConstants.ScriptSingularityFn1RamCost,
  installBackdoor: () => RamCostConstants.ScriptSingularityFn1RamCost,
  getStats: () => RamCostConstants.ScriptSingularityFn1RamCost / 4,
  getCharacterInformation: () =>
    RamCostConstants.ScriptSingularityFn1RamCost / 4,
  getPlayer: () => RamCostConstants.ScriptSingularityFn1RamCost / 4,
  hospitalize: () => RamCostConstants.ScriptSingularityFn1RamCost / 4,
  isBusy: () => RamCostConstants.ScriptSingularityFn1RamCost / 4,
  stopAction: () => RamCostConstants.ScriptSingularityFn1RamCost / 2,
  upgradeHomeRam: () => RamCostConstants.ScriptSingularityFn2RamCost,
  getUpgradeHomeRamCost: () => RamCostConstants.ScriptSingularityFn2RamCost / 2,
  workForCompany: () => RamCostConstants.ScriptSingularityFn2RamCost,
  applyToCompany: () => RamCostConstants.ScriptSingularityFn2RamCost,
  getCompanyRep: () => RamCostConstants.ScriptSingularityFn2RamCost / 3,
  getCompanyFavor: () => RamCostConstants.ScriptSingularityFn2RamCost / 3,
  getCompanyFavorGain: () => RamCostConstants.ScriptSingularityFn2RamCost / 4,
  checkFactionInvitations: () => RamCostConstants.ScriptSingularityFn2RamCost,
  joinFaction: () => RamCostConstants.ScriptSingularityFn2RamCost,
  workForFaction: () => RamCostConstants.ScriptSingularityFn2RamCost,
  getFactionRep: () => RamCostConstants.ScriptSingularityFn2RamCost / 3,
  getFactionFavor: () => RamCostConstants.ScriptSingularityFn2RamCost / 3,
  getFactionFavorGain: () => RamCostConstants.ScriptSingularityFn2RamCost / 4,
  donateToFaction: () => RamCostConstants.ScriptSingularityFn3RamCost,
  createProgram: () => RamCostConstants.ScriptSingularityFn3RamCost,
  commitCrime: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getCrimeChance: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getCrimeStats: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getOwnedAugmentations: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getOwnedSourceFiles: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getAugmentationsFromFaction: () =>
    RamCostConstants.ScriptSingularityFn3RamCost,
  getAugmentationPrereq: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getAugmentationCost: () => RamCostConstants.ScriptSingularityFn3RamCost,
  getAugmentationStats: () => RamCostConstants.ScriptSingularityFn3RamCost,
  purchaseAugmentation: () => RamCostConstants.ScriptSingularityFn3RamCost,
  softReset: () => RamCostConstants.ScriptSingularityFn3RamCost,
  installAugmentations: () => RamCostConstants.ScriptSingularityFn3RamCost,

  // Gang API
  gang: {
    createGang: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    inGang: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    getMemberNames: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    getGangInformation: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getOtherGangInformation: () =>
      RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getMemberInformation: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    canRecruitMember: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    recruitMember: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getTaskNames: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    getTaskStats: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    setMemberTask: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getEquipmentNames: () => RamCostConstants.ScriptGangApiBaseRamCost / 4,
    getEquipmentCost: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getEquipmentType: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getEquipmentStats: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    purchaseEquipment: () => RamCostConstants.ScriptGangApiBaseRamCost,
    ascendMember: () => RamCostConstants.ScriptGangApiBaseRamCost,
    setTerritoryWarfare: () => RamCostConstants.ScriptGangApiBaseRamCost / 2,
    getChanceToWinClash: () => RamCostConstants.ScriptGangApiBaseRamCost,
    getBonusTime: () => 0,
  },

  // Bladeburner API
  bladeburner: {
    getContractNames: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 10,
    getOperationNames: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 10,
    getBlackOpNames: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 10,
    getBlackOpRank: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost / 2,
    getGeneralActionNames: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 10,
    getSkillNames: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost / 10,
    startAction: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    stopBladeburnerAction: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 2,
    getCurrentAction: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost / 4,
    getActionTime: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionEstimatedSuccessChance: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionRepGain: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionCountRemaining: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionMaxLevel: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionCurrentLevel: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getActionAutolevel: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    setActionAutolevel: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    setActionLevel: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getRank: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getSkillPoints: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getSkillLevel: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getSkillUpgradeCost: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    upgradeSkill: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getTeamSize: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    setTeamSize: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getCityEstimatedPopulation: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getCityEstimatedCommunities: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getCityChaos: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getCity: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    switchCity: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getStamina: () => RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    joinBladeburnerFaction: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    joinBladeburnerDivision: () =>
      RamCostConstants.ScriptBladeburnerApiBaseRamCost,
    getBonusTime: () => 0,
  },

  // Coding Contract API
  codingcontract: {
    attempt: () => RamCostConstants.ScriptCodingContractBaseRamCost,
    getContractType: () => RamCostConstants.ScriptCodingContractBaseRamCost / 2,
    getData: () => RamCostConstants.ScriptCodingContractBaseRamCost / 2,
    getDescription: () => RamCostConstants.ScriptCodingContractBaseRamCost / 2,
    getNumTriesRemaining: () =>
      RamCostConstants.ScriptCodingContractBaseRamCost / 5,
  },

  // Duplicate Sleeve API
  sleeve: {
    getNumSleeves: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToShockRecovery: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToSynchronize: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToCommitCrime: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToUniversityCourse: () => RamCostConstants.ScriptSleeveBaseRamCost,
    travel: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToCompanyWork: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToFactionWork: () => RamCostConstants.ScriptSleeveBaseRamCost,
    setToGymWorkout: () => RamCostConstants.ScriptSleeveBaseRamCost,
    getSleeveStats: () => RamCostConstants.ScriptSleeveBaseRamCost,
    getTask: () => RamCostConstants.ScriptSleeveBaseRamCost,
    getInformation: () => RamCostConstants.ScriptSleeveBaseRamCost,
    getSleeveAugmentations: () => RamCostConstants.ScriptSleeveBaseRamCost,
    getSleevePurchasableAugs: () => RamCostConstants.ScriptSleeveBaseRamCost,
    purchaseSleeveAug: () => RamCostConstants.ScriptSleeveBaseRamCost,
  },

  heart: {
    // Easter egg function
    break: () => 0,
  },
};

export function getRamCost(...args: string[]): number {
  if (args.length === 0) {
    console.warn(`No arguments passed to getRamCost()`);
    return 0;
  }

  let curr = RamCosts[args[0]];
  for (let i = 1; i < args.length; ++i) {
    if (curr == null) {
      console.warn(`Invalid function passed to getRamCost: ${args}`);
      return 0;
    }

    const currType = typeof curr;
    if (currType === "function" || currType === "number") {
      break;
    }

    curr = curr[args[i]];
  }

  const currType = typeof curr;
  if (currType === "function") {
    return curr();
  }

  if (currType === "number") {
    return curr;
  }

  console.warn(`Unexpected type (${currType}) for value [${args}]`);
  return 0;
}
