import { GangMemberTask } from "./GangMemberTask";
import { GangMemberTasks } from "./GangMemberTasks";
import { GangMemberUpgrade } from "./GangMemberUpgrade";
import { GangMemberUpgrades } from "./GangMemberUpgrades";
import { IAscensionResult } from "./IAscensionResult";
import { Player } from "@player";
import { Gang } from "./Gang";
import { GangConstants } from "./data/Constants";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import {
  calculateRespectGain,
  calculateMoneyGain,
  calculateWantedLevelGain,
  calculateAscensionMult,
  calculateAscensionPointsGain,
} from "./formulas/formulas";
import { GangMemberExpGain } from "@nsdefs";

interface IMults {
  hack: number;
  str: number;
  def: number;
  dex: number;
  agi: number;
  cha: number;
}

export class GangMember {
  name: string;
  task = "Unassigned";

  earnedRespect = 0;

  hack = 1;
  str = 1;
  def = 1;
  dex = 1;
  agi = 1;
  cha = 1;

  hack_exp = 0;
  str_exp = 0;
  def_exp = 0;
  dex_exp = 0;
  agi_exp = 0;
  cha_exp = 0;

  hack_mult = 1;
  str_mult = 1;
  def_mult = 1;
  dex_mult = 1;
  agi_mult = 1;
  cha_mult = 1;

  hack_asc_points = 0;
  str_asc_points = 0;
  def_asc_points = 0;
  dex_asc_points = 0;
  agi_asc_points = 0;
  cha_asc_points = 0;

  upgrades: string[] = []; // Names of upgrades
  augmentations: string[] = []; // Names of augmentations only

  constructor(name = "") {
    this.name = name;
  }

  calculateSkill(exp: number, mult = 1): number {
    return Math.max(Math.floor(mult * (32 * Math.log(exp + 534.5) - 200)), 1);
  }

  calculateAscensionMult(points: number): number {
    return calculateAscensionMult(points);
  }

  updateSkillLevels(): void {
    this.hack = this.calculateSkill(this.hack_exp, this.hack_mult * this.calculateAscensionMult(this.hack_asc_points));
    this.str = this.calculateSkill(this.str_exp, this.str_mult * this.calculateAscensionMult(this.str_asc_points));
    this.def = this.calculateSkill(this.def_exp, this.def_mult * this.calculateAscensionMult(this.def_asc_points));
    this.dex = this.calculateSkill(this.dex_exp, this.dex_mult * this.calculateAscensionMult(this.dex_asc_points));
    this.agi = this.calculateSkill(this.agi_exp, this.agi_mult * this.calculateAscensionMult(this.agi_asc_points));
    this.cha = this.calculateSkill(this.cha_exp, this.cha_mult * this.calculateAscensionMult(this.cha_asc_points));
  }

  calculatePower(): number {
    return (this.hack + this.str + this.def + this.dex + this.agi + this.cha) / 95;
  }

  assignToTask(taskName: string): boolean {
    if (!Object.hasOwn(GangMemberTasks, taskName)) {
      this.task = "Unassigned";
      return false;
    }
    this.task = taskName;
    return true;
  }

  unassignFromTask(): void {
    this.task = "Unassigned";
  }

  getTask(): GangMemberTask {
    if (Object.hasOwn(GangMemberTasks, this.task)) {
      return GangMemberTasks[this.task];
    }
    return GangMemberTasks.Unassigned;
  }

  calculateRespectGain(gang: Gang): number {
    const task = this.getTask();
    const g = {
      respect: gang.respect,
      wantedLevel: gang.wanted,
      territory: gang.getTerritory(),
    };
    return calculateRespectGain(g, this, task);
  }

  calculateWantedLevelGain(gang: Gang): number {
    const task = this.getTask();
    const g = {
      respect: gang.respect,
      wantedLevel: gang.wanted,
      territory: gang.getTerritory(),
    };
    return calculateWantedLevelGain(g, this, task);
  }

  calculateMoneyGain(gang: Gang): number {
    const task = this.getTask();
    const g = {
      respect: gang.respect,
      wantedLevel: gang.wanted,
      territory: gang.getTerritory(),
    };
    return calculateMoneyGain(g, this, task);
  }

  expMult(): IMults {
    return {
      hack: (this.hack_mult - 1) / 4 + 1,
      str: (this.str_mult - 1) / 4 + 1,
      def: (this.def_mult - 1) / 4 + 1,
      dex: (this.dex_mult - 1) / 4 + 1,
      agi: (this.agi_mult - 1) / 4 + 1,
      cha: (this.cha_mult - 1) / 4 + 1,
    };
  }

  // Calculate our gain for each stat based on each modifier of member
  // if no task is assigned to that member we return null, other wise we
  // return an object containing our per-cycle gains for each stat.
  calculateExpGain(numCycles = 1): GangMemberExpGain | null {
    const task = this.getTask();
    if (task === GangMemberTasks.Unassigned) return null;

    const expValues = {
      hack_exp: 0,
      str_exp: 0,
      def_exp: 0,
      dex_exp: 0,
      agi_exp: 0,
      cha_exp: 0,
    };

    const difficultyMult = Math.pow(task.difficulty, 0.9);
    const difficultyPerCycles = difficultyMult * numCycles;
    const weightDivisor = 1500;
    const expMult = this.expMult();

    expValues.hack_exp +=
      (task.hackWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.hack *
      this.calculateAscensionMult(this.hack_asc_points);

    expValues.str_exp +=
      (task.strWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.str *
      this.calculateAscensionMult(this.str_asc_points);

    expValues.def_exp +=
      (task.defWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.def *
      this.calculateAscensionMult(this.def_asc_points);

    expValues.dex_exp +=
      (task.dexWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.dex *
      this.calculateAscensionMult(this.dex_asc_points);

    expValues.agi_exp +=
      (task.agiWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.agi *
      this.calculateAscensionMult(this.agi_asc_points);

    expValues.cha_exp +=
      (task.chaWeight / weightDivisor) *
      difficultyPerCycles *
      expMult.cha *
      this.calculateAscensionMult(this.cha_asc_points);

    return expValues;
  }

  gainExperience(numCycles: number): void {
    // Do the calculations if our function returns null meaning no task is assigned
    // then we return otherwise we add our exp gains to our total values
    const gains = this.calculateExpGain(numCycles);
    if (gains === null) {
      return;
    }

    this.hack_exp += gains.hack_exp;
    this.str_exp += gains.str_exp;
    this.def_exp += gains.def_exp;
    this.dex_exp += gains.dex_exp;
    this.agi_exp += gains.agi_exp;
    this.cha_exp += gains.cha_exp;
  }

  earnRespect(numCycles = 1, gang: Gang): number {
    const earnedRespect = this.calculateRespectGain(gang) * numCycles;
    this.earnedRespect += earnedRespect;
    return earnedRespect;
  }

  getGainedAscensionPoints(): IMults {
    return {
      hack: calculateAscensionPointsGain(this.hack_exp),
      str: calculateAscensionPointsGain(this.str_exp),
      def: calculateAscensionPointsGain(this.def_exp),
      dex: calculateAscensionPointsGain(this.dex_exp),
      agi: calculateAscensionPointsGain(this.agi_exp),
      cha: calculateAscensionPointsGain(this.cha_exp),
    };
  }

  canAscend(): boolean {
    const points = this.getGainedAscensionPoints();
    return points.hack > 0 || points.str > 0 || points.def > 0 || points.dex > 0 || points.agi > 0 || points.cha > 0;
  }

  getCurrentAscensionMults(): IMults {
    return {
      hack: this.calculateAscensionMult(this.hack_asc_points),
      str: this.calculateAscensionMult(this.str_asc_points),
      def: this.calculateAscensionMult(this.def_asc_points),
      dex: this.calculateAscensionMult(this.dex_asc_points),
      agi: this.calculateAscensionMult(this.agi_asc_points),
      cha: this.calculateAscensionMult(this.cha_asc_points),
    };
  }

  getAscensionMultsAfterAscend(): IMults {
    const points = this.getGainedAscensionPoints();
    return {
      hack: this.calculateAscensionMult(this.hack_asc_points + points.hack),
      str: this.calculateAscensionMult(this.str_asc_points + points.str),
      def: this.calculateAscensionMult(this.def_asc_points + points.def),
      dex: this.calculateAscensionMult(this.dex_asc_points + points.dex),
      agi: this.calculateAscensionMult(this.agi_asc_points + points.agi),
      cha: this.calculateAscensionMult(this.cha_asc_points + points.cha),
    };
  }

  getAscensionResults(): IMults {
    const postAscend = this.getAscensionMultsAfterAscend();
    const preAscend = this.getCurrentAscensionMults();

    return {
      hack: postAscend.hack / preAscend.hack,
      str: postAscend.str / preAscend.str,
      def: postAscend.def / preAscend.def,
      dex: postAscend.dex / preAscend.dex,
      agi: postAscend.agi / preAscend.agi,
      cha: postAscend.cha / preAscend.cha,
    };
  }

  getPostInstallPoints(): IMults {
    return {
      hack: this.hack_asc_points * GangConstants.InstallAscensionPenalty,
      str: this.str_asc_points * GangConstants.InstallAscensionPenalty,
      def: this.def_asc_points * GangConstants.InstallAscensionPenalty,
      dex: this.dex_asc_points * GangConstants.InstallAscensionPenalty,
      agi: this.agi_asc_points * GangConstants.InstallAscensionPenalty,
      cha: this.cha_asc_points * GangConstants.InstallAscensionPenalty,
    };
  }

  ascend(): IAscensionResult {
    const res = this.getAscensionResults();
    const points = this.getGainedAscensionPoints();
    this.hack_asc_points += points.hack;
    this.str_asc_points += points.str;
    this.def_asc_points += points.def;
    this.dex_asc_points += points.dex;
    this.agi_asc_points += points.agi;
    this.cha_asc_points += points.cha;

    // Remove upgrades. Then re-calculate multipliers and stats
    this.upgrades.length = 0;
    this.hack_mult = 1;
    this.str_mult = 1;
    this.def_mult = 1;
    this.dex_mult = 1;
    this.agi_mult = 1;
    this.cha_mult = 1;
    for (let i = 0; i < this.augmentations.length; ++i) {
      const aug = GangMemberUpgrades[this.augmentations[i]];
      this.applyUpgrade(aug);
    }

    // Clear exp and recalculate stats
    this.hack_exp = 0;
    this.str_exp = 0;
    this.def_exp = 0;
    this.dex_exp = 0;
    this.agi_exp = 0;
    this.cha_exp = 0;
    this.updateSkillLevels();

    const respectToDeduct = this.earnedRespect;
    this.earnedRespect = 0;
    return {
      respect: respectToDeduct,
      hack: res.hack,
      str: res.str,
      def: res.def,
      dex: res.dex,
      agi: res.agi,
      cha: res.cha,
    };
  }

  applyUpgrade(upg: GangMemberUpgrade): void {
    if (upg.mults.str != null) this.str_mult *= upg.mults.str;
    if (upg.mults.def != null) this.def_mult *= upg.mults.def;
    if (upg.mults.dex != null) this.dex_mult *= upg.mults.dex;
    if (upg.mults.agi != null) this.agi_mult *= upg.mults.agi;
    if (upg.mults.cha != null) this.cha_mult *= upg.mults.cha;
    if (upg.mults.hack != null) this.hack_mult *= upg.mults.hack;
  }

  buyUpgrade(upg: GangMemberUpgrade): boolean {
    if (!Player.gang) throw new Error("Tried to buy a gang member upgrade when no gang was present");

    // Prevent purchasing of already-owned upgrades
    if (this.augmentations.includes(upg.name) || this.upgrades.includes(upg.name)) return false;

    if (Player.money < Player.gang.getUpgradeCost(upg)) return false;
    Player.loseMoney(Player.gang.getUpgradeCost(upg), "gang_expenses");
    if (upg.type === "g") {
      this.augmentations.push(upg.name);
    } else {
      this.upgrades.push(upg.name);
    }
    this.applyUpgrade(upg);
    return true;
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("GangMember", this);
  }

  /** Initializes a GangMember object from a JSON save state. */
  static fromJSON(value: IReviverValue): GangMember {
    return Generic_fromJSON(GangMember, value.data);
  }
}

constructorsForReviver.GangMember = GangMember;
