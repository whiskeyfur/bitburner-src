import React from "react";
import { Player } from "@player";
import { AugmentationName, CityName, FactionName } from "@enums";
import { BitNodeMultipliers, replaceCurrentNodeMults } from "./BitNodeMultipliers";

class BitNode {
  // A short description, or tagline, about the BitNode
  tagline: string;

  // Overview of the BitNode
  description: JSX.Element;

  // SF description
  sfDescription: JSX.Element;

  // Full detail of this BitNode. This property is a combination of description and sfDescription.
  info: JSX.Element;

  // Name of BitNode
  name: string;

  // BitNode number
  number: number;

  difficulty: 0 | 1 | 2;

  constructor(
    n: number,
    difficulty: 0 | 1 | 2,
    name: string,
    tagline = "",
    description: JSX.Element,
    sfDescription: JSX.Element,
  ) {
    this.number = n;
    this.difficulty = difficulty;
    this.name = name;
    this.tagline = tagline;
    this.description = description;
    this.sfDescription = sfDescription;
    this.info = (
      <>
        {this.description} {this.sfDescription}
      </>
    );
  }
}

export const BitNodes: Record<string, BitNode> = {};
export function initBitNodes() {
  BitNodes.BitNode1 = new BitNode(
    1,
    0,
    "Source Genesis",
    "The original BitNode",
    (
      <>
        This is the first BitNode created by the Enders to imprison the minds of humans. It became the prototype and
        testing ground for all of the BitNodes that followed.
        <br />
        <br />
        This is the first BitNode that you play through. It has no special modifications or mechanics.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 1, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode and
        increases all of the player's multipliers by:
        <ul>
          <li>Level 1: 16%</li>
          <li>Level 2: 24%</li>
          <li>Level 3: 28%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode2 = new BitNode(
    2,
    0,
    "Rise of the Underworld",
    "From the shadows, they rose",
    (
      <>
        Organized crime groups quickly filled the void of power left behind from the collapse of Western government in
        the 2050s. As society and civilization broke down, people quickly succumbed to the innate human impulse of evil
        and savagery. The organized crime factions quickly rose to the top of the modern world.
        <br />
        <br />
        Certain factions ({FactionName.SlumSnakes}, {FactionName.Tetrads}, {FactionName.TheSyndicate},{" "}
        {FactionName.TheDarkArmy}, {FactionName.SpeakersForTheDead}, {FactionName.NiteSec}, and{" "}
        {FactionName.TheBlackHand}) give the player the ability to form and manage their own gang, which can earn the
        player money and reputation with the corresponding faction. The gang faction offers more augmentations than
        other factions, and in BitNode-2, it offers The Red Pill.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 2, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It
        also increases your crime success rate, crime money, and charisma multipliers by:
        <ul>
          <li>Level 1: 24%</li>
          <li>Level 2: 36%</li>
          <li>Level 3: 42%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode3 = new BitNode(
    3,
    2,
    "Corporatocracy",
    "The Price of Civilization",
    (
      <>
        Our greatest illusion is that a healthy society can revolve around a single-minded pursuit of wealth.
        <br />
        <br />
        Sometime in the early 21st century, economic and political globalization turned the world into a corporatocracy,
        and it never looked back. Now, the privileged elite will happily bankrupt their own countrymen, decimate their
        own community, and evict their neighbors from houses in their desperate bid to increase their wealth.
        <br />
        <br />
        In this BitNode, you can create and manage your own corporation. Running a successful corporation has the
        potential to generate massive profits.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 3, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this
        mechanic) and level 3 permanently unlocks the full API. This Source-File also increases your charisma and
        company salary multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode4 = new BitNode(
    4,
    1,
    "The Singularity",
    "The Man and the Machine",
    (
      <>
        The Singularity has arrived. The human race is gone, replaced by artificially super intelligent beings that are
        more machine than man.
        <br />
        <br />
        In this BitNode, you will gain access to a new set of Netscript functions known as Singularity functions. These
        functions allow you to control most aspects of the game through scripts, including working for
        factions/companies, purchasing/installing augmentations, and creating programs.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 4, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File lets you access and use the Singularity functions in other BitNodes. Each level of this
        Source-File reduces the RAM cost of singularity functions:
        <ul>
          <li>Level 1: 16x</li>
          <li>Level 2: 4x</li>
          <li>Level 3: 1x</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode5 = new BitNode(
    5,
    1,
    "Artificial Intelligence",
    "Posthuman",
    (
      <>
        They said it couldn't be done. They said the human brain, along with its consciousness and intelligence,
        couldn't be replicated. They said the complexity of the brain results from unpredictable, nonlinear interactions
        that couldn't be modeled by 1's and 0's. They were wrong.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 5, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and
        persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other
        stats. Higher Intelligence levels will boost your production for many actions in the game.
        <br />
        <br />
        In addition, this Source-File will unlock:
        <ul>
          <li>
            <code>getBitNodeMultipliers()</code> Netscript function
          </li>
          <li>Permanent access to Formulas.exe</li>
          <li>
            Access to BitNode multiplier information on the <b>Stats</b> page
          </li>
        </ul>
        It will also raise all of your hacking-related multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode6 = new BitNode(
    6,
    1,
    FactionName.Bladeburners,
    "Like Tears in Rain",
    (
      <>
        In the middle of the 21st century, {FactionName.OmniTekIncorporated} began designing and manufacturing advanced
        synthetic androids, or Synthoids for short. They achieved a major technological breakthrough in the sixth
        generation of their Synthoid design, called MK-VI, by developing a hyper-intelligent AI. Many argue that this
        was the first sentient AI ever created. This resulted in Synthoid models that were stronger, faster, and more
        intelligent than the humans that had created them.
        <br />
        <br />
        In this BitNode, you will be able to access the Bladeburner division at the NSA, which provides a new mechanic
        for progression.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 6, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. In addition, this
        Source-File will raise both the level and experience gain rate of all your combat stats by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode7 = new BitNode(
    7,
    2,
    `${FactionName.Bladeburners} 2079`,
    "More human than humans",
    (
      <>
        In the middle of the 21st century, you were doing cutting-edge work at {FactionName.OmniTekIncorporated} as part
        of the AI design team for advanced synthetic androids, or Synthoids for short. You helped achieve a major
        technological breakthrough in the sixth generation of the company's Synthoid design, called MK-VI, by developing
        a hyper-intelligent AI. Many argue that this was the first sentient AI ever created. This resulted in Synthoid
        models that were stronger, faster, and more intelligent than the humans that had created them.
        <br />
        <br />
        In this BitNode, you will be able to access the Bladeburner division at the NSA, which provides a new mechanic
        for progression.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 7, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. In addition, this
        Source-File will increase all of your Bladeburner multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>
            Level 3: 14% and immediately receive "{AugmentationName.BladesSimulacrum}" augmentation after joining the
            Bladeburner division
          </li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode8 = new BitNode(
    8,
    2,
    "Ghost of Wall Street",
    "Money never sleeps",
    (
      <>
        You are trying to make a name for yourself as an up-and-coming hedge fund manager on Wall Street.
        <br />
        <br />
        In this BitNode:
        <ul>
          <li>You start with $250 million.</li>
          <li>You start with a WSE membership and access to the TIX API.</li>
          <li>You can short stocks and place different types of orders (limit/stop).</li>
        </ul>
        Destroying this BitNode will give you Source-File 8, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: Permanent access to WSE and TIX API</li>
          <li>Level 2: Ability to short stocks in other BitNodes</li>
          <li>Level 3: Ability to use limit/stop orders in other BitNodes</li>
        </ul>
        This Source-File also increases your hacking growth multipliers by:
        <ul>
          <li>Level 1: 12%</li>
          <li>Level 2: 18%</li>
          <li>Level 3: 21%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode9 = new BitNode(
    9,
    2,
    "Hacktocracy",
    "Hacknet Unleashed",
    (
      <>
        When {FactionName.FulcrumSecretTechnologies} released their open-source Linux distro Chapeau, it quickly became
        the OS of choice for the underground hacking community. Chapeau became especially notorious for powering the
        Hacknet, which is a global, decentralized network used for nefarious purposes.{" "}
        {FactionName.FulcrumSecretTechnologies} quickly abandoned the project and dissociated themselves from it.
        <br />
        <br />
        This BitNode unlocks the Hacknet Server, which is an upgraded version of the Hacknet Node. Hacknet Servers
        generate hashes, which can be spent on a variety of different upgrades.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 9, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: Permanently unlocks the Hacknet Server in other BitNodes</li>
          <li>Level 2: You start with 128GB of RAM on your home computer when entering a new BitNode</li>
          <li>Level 3: Grants a highly-upgraded Hacknet Server when entering a new BitNode</li>
        </ul>
        (Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing
        augmentations)
        <br />
        <br />
        This Source-File also increases hacknet production and reduces hacknet costs by:
        <ul>
          <li>Level 1: 12%</li>
          <li>Level 2: 18%</li>
          <li>Level 3: 21%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode10 = new BitNode(
    10,
    2,
    "Digital Carbon",
    "Your body is not who you are",
    (
      <>
        In 2084, VitaLife unveiled to the world the Persona Core, a technology that allowed people to digitize their
        consciousness. Their consciousness could then be transferred into Synthoids or other bodies by transmitting the
        digitized data. Human bodies became nothing more than 'sleeves' for the human consciousness. Mankind had finally
        achieved immortality - at least for those that could afford it.
        <br />
        <br />
        This BitNode unlocks Sleeve and Grafting technology:
        <ul>
          <li>
            Sleeve: Duplicate your consciousness into Synthoids, allowing you to perform different tasks asynchronously.
            You cannot buy Sleeves outside this BitNode.
          </li>
          <li>
            Grafting: Visit VitaLife in New Tokyo to get access to this technology. It allows you to graft
            augmentations, which is an alternative way of installing augmentations.
          </li>
        </ul>
        Destroying this BitNode will give you Source-File 10, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File unlocks Sleeve and Grafting API in other BitNodes. Each level of this Source-File also grants
        you a Sleeve.
      </>
    ),
  );
  BitNodes.BitNode11 = new BitNode(
    11,
    1,
    "The Big Crash",
    "Okay. Sell it all.",
    (
      <>
        The 2050s was defined by the massive amounts of violent civil unrest and anarchic rebellion that rose all around
        the world. It was this period of disorder that eventually led to the governmental reformation of many global
        superpowers, most notably the USA and China. But just as the world was slowly beginning to recover from these
        dark times, financial catastrophes hit.
        <br />
        <br />
        In many countries, the high cost of trying to deal with the civil disorder bankrupted the governments. In all of
        this chaos and confusion, hackers were able to steal billions of dollars from the world's largest electronic
        banks, prompting an international banking crisis as governments were unable to bail out insolvent banks. Now,
        the world is slowly crumbling in the middle of the biggest economic crisis of all time.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 11, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File makes it so that company favor increases BOTH the player's salary and reputation gain rate at
        that company by 1% per favor (rather than just the reputation gain). This Source-File also increases the
        player's company salary and reputation gain multipliers by:
        <ul>
          <li>Level 1: 32%</li>
          <li>Level 2: 48%</li>
          <li>Level 3: 56%</li>
        </ul>
        It also reduces the price increase for every augmentation bought by:
        <ul>
          <li>Level 1: 4%</li>
          <li>Level 2: 6%</li>
          <li>Level 3: 7%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode12 = new BitNode(
    12,
    0,
    "The Recursion",
    "Repeat.",
    (
      <>
        To iterate is human; to recurse, divine.
        <br />
        <br />
        Every time this BitNode is destroyed, it becomes slightly harder. Destroying this BitNode will give you
        Source-File 12, or if you already have this Source-File, it will upgrade its level. There is no maximum level
        for Source-File 12.
      </>
    ),
    <>This Source-File lets you start any BitNodes with Neuroflux Governor equal to the level of this Source-File.</>,
  );
  BitNodes.BitNode13 = new BitNode(
    13,
    2,
    "They're lunatics",
    "1 step back, 2 steps forward",
    (
      <>
        With the invention of augmentations in the 2040s, a religious group known as the{" "}
        {FactionName.ChurchOfTheMachineGod} has rallied far more support than anyone would have hoped.
        <br />
        <br />
        Their leader, Allison "Mother" Stanek is said to have created her own augmentation whose power goes beyond any
        other. Find her in {CityName.Chongqing} and gain her trust.
        <br />
        <br />
        Destroying this BitNode will give you Source-File 13, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File lets the {FactionName.ChurchOfTheMachineGod} appear in other BitNodes.
        <br />
        <br />
        Each level of this Source-File increases the size of Stanek's Gift.
        <br />
        <br />
        Due to the effect of Source-File 7.3, you must accept Stanek's Gift before joining the Bladeburner division if
        you have that Source-File.
      </>
    ),
  );
  BitNodes.BitNode14 = new BitNode(
    14,
    1,
    "IPvGO Subnet Takeover",
    "Territory exists only in the 'net",
    (
      <>
        In late 2070, the .org bubble burst, and most of the newly-implemented IPvGO 'net collapsed overnight. Since
        then, various factions have been fighting over small subnets to control their computational power. These subnets
        are very valuable in the right hands, if you can wrest them from their current owners. You will be opposed by
        the other factions, but you can overcome them with careful choices. Prevent their attempts to destroy your
        networks by controlling the open space in the 'net!
        <br />
        <br />
        Destroying this BitNode will give you Source-File 14, or if you already have this Source-File, it will upgrade
        its level up to a maximum of 3.
      </>
    ),
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: 100% increased stat multipliers from Node Power</li>
          <li>Level 2: Permanently unlocks the go.cheat API</li>
          <li>Level 3: 25% additive increased success rate for the go.cheat API</li>
        </ul>
        This Source-File also increases the maximum favor you can gain for each faction from IPvGO to:
        <ul>
          <li>Level 1: 80</li>
          <li>Level 2: 100</li>
          <li>Level 3: 120</li>
        </ul>
      </>
    ),
  );
}

export const defaultMultipliers = new BitNodeMultipliers();
Object.freeze(defaultMultipliers);

export function getBitNodeMultipliers(n: number, lvl: number): BitNodeMultipliers {
  switch (n) {
    case 1: {
      return new BitNodeMultipliers();
    }
    case 2: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.8,

        ServerGrowthRate: 0.8,
        ServerMaxMoney: 0.08,
        ServerStartingMoney: 0.4,

        PurchasedServerSoftcap: 1.3,

        CrimeMoney: 3,

        FactionPassiveRepGain: 0,
        FactionWorkRepGain: 0.5,

        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        InfiltrationMoney: 3,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: -6,
        WorldDaemonDifficulty: 5,
      });
    }
    case 3: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.8,

        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.04,
        ServerStartingMoney: 0.2,

        HomeComputerRamCost: 1.5,

        PurchasedServerCost: 2,
        PurchasedServerSoftcap: 1.3,

        CompanyWorkMoney: 0.25,
        CrimeMoney: 0.25,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.2,

        RepToDonateToFaction: 0.5,

        AugmentationMoneyCost: 3,
        AugmentationRepCost: 3,

        GangSoftcap: 0.9,
        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -2,

        WorldDaemonDifficulty: 2,
      });
    }
    case 4: {
      return new BitNodeMultipliers({
        ServerMaxMoney: 0.1125,
        ServerStartingMoney: 0.75,

        PurchasedServerSoftcap: 1.2,

        CompanyWorkMoney: 0.1,
        CrimeMoney: 0.2,
        HacknetNodeMoney: 0.05,
        ScriptHackMoney: 0.2,

        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.4,

        FactionWorkRepGain: 0.75,

        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 1.5,
        StaneksGiftExtraSize: 0,

        WorldDaemonDifficulty: 3,
      });
    }
    case 5: {
      return new BitNodeMultipliers({
        ServerStartingSecurity: 2,
        ServerStartingMoney: 0.5,

        PurchasedServerSoftcap: 1.2,

        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.15,

        HackExpGain: 0.5,

        AugmentationMoneyCost: 2,

        InfiltrationMoney: 1.5,
        InfiltrationRep: 1.5,

        CorporationValuation: 0.75,
        CorporationDivisions: 0.75,

        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 1.3,
        StaneksGiftExtraSize: 0,

        WorldDaemonDifficulty: 1.5,
      });
    }
    case 6: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,

        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        PurchasedServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.75,

        HackExpGain: 0.25,

        InfiltrationMoney: 0.75,

        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,

        DaedalusAugsRequirement: 35,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,

        WorldDaemonDifficulty: 2,
      });
    }
    case 7: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,

        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        PurchasedServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.5,

        HackExpGain: 0.25,

        AugmentationMoneyCost: 3,

        InfiltrationMoney: 0.75,

        FourSigmaMarketDataCost: 2,
        FourSigmaMarketDataApiCost: 2,

        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,

        DaedalusAugsRequirement: 35,

        StaneksGiftPowerMultiplier: 0.9,
        StaneksGiftExtraSize: -1,

        WorldDaemonDifficulty: 2,
      });
    }
    case 8: {
      return new BitNodeMultipliers({
        PurchasedServerSoftcap: 4,

        CompanyWorkMoney: 0,
        CrimeMoney: 0,
        HacknetNodeMoney: 0,
        ManualHackMoney: 0,
        ScriptHackMoney: 0.3,
        ScriptHackMoneyGain: 0,
        CodingContractMoney: 0,

        RepToDonateToFaction: 0,

        InfiltrationMoney: 0,

        CorporationValuation: 0,
        CorporationSoftcap: 0,
        CorporationDivisions: 0,

        BladeburnerRank: 0,

        GangSoftcap: 0,
        GangUniqueAugs: 0,

        StaneksGiftExtraSize: -99,
      });
    }
    case 9: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.5,
        StrengthLevelMultiplier: 0.45,
        DefenseLevelMultiplier: 0.45,
        DexterityLevelMultiplier: 0.45,
        AgilityLevelMultiplier: 0.45,
        CharismaLevelMultiplier: 0.45,

        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerStartingSecurity: 2.5,

        HomeComputerRamCost: 5,

        PurchasedServerLimit: 0,

        CrimeMoney: 0.5,
        ScriptHackMoney: 0.1,

        HackExpGain: 0.05,

        FourSigmaMarketDataCost: 5,
        FourSigmaMarketDataApiCost: 4,

        CorporationValuation: 0.5,
        CorporationSoftcap: 0.75,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.9,
        BladeburnerSkillCost: 1.2,

        GangSoftcap: 0.8,
        GangUniqueAugs: 0.25,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,

        WorldDaemonDifficulty: 2,
      });
    }
    case 10: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,
        StrengthLevelMultiplier: 0.4,
        DefenseLevelMultiplier: 0.4,
        DexterityLevelMultiplier: 0.4,
        AgilityLevelMultiplier: 0.4,
        CharismaLevelMultiplier: 0.4,

        HomeComputerRamCost: 1.5,

        PurchasedServerCost: 5,
        PurchasedServerSoftcap: 1.1,
        PurchasedServerLimit: 0.6,
        PurchasedServerMaxRam: 0.5,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.5,
        ManualHackMoney: 0.5,
        ScriptHackMoney: 0.5,
        CodingContractMoney: 0.5,

        AugmentationMoneyCost: 5,
        AugmentationRepCost: 2,

        InfiltrationMoney: 0.5,

        CorporationValuation: 0.5,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        BladeburnerRank: 0.8,

        GangSoftcap: 0.9,
        GangUniqueAugs: 0.25,

        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -3,

        WorldDaemonDifficulty: 2,
      });
    }
    case 11: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.6,

        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerWeakenRate: 2,

        PurchasedServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 3,
        HacknetNodeMoney: 0.1,
        CodingContractMoney: 0.25,

        HackExpGain: 0.5,

        AugmentationMoneyCost: 2,

        InfiltrationMoney: 2.5,
        InfiltrationRep: 2.5,

        FourSigmaMarketDataCost: 4,
        FourSigmaMarketDataApiCost: 4,

        CorporationValuation: 0.1,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        GangUniqueAugs: 0.75,

        WorldDaemonDifficulty: 1.5,
      });
    }
    case 12: {
      const inc = Math.pow(1.02, lvl);
      const dec = 1 / inc;

      return new BitNodeMultipliers({
        DaedalusAugsRequirement: Math.floor(Math.min(defaultMultipliers.DaedalusAugsRequirement + inc, 40)),

        HackingLevelMultiplier: dec,
        StrengthLevelMultiplier: dec,
        DefenseLevelMultiplier: dec,
        DexterityLevelMultiplier: dec,
        AgilityLevelMultiplier: dec,
        CharismaLevelMultiplier: dec,

        ServerGrowthRate: dec,
        ServerMaxMoney: dec * dec,
        ServerStartingMoney: dec,
        ServerWeakenRate: dec,

        //Does not scale, otherwise security might start at 300+
        ServerStartingSecurity: 1.5,

        HomeComputerRamCost: inc,

        PurchasedServerCost: inc,
        PurchasedServerSoftcap: inc,
        PurchasedServerLimit: dec,
        PurchasedServerMaxRam: dec,

        CompanyWorkMoney: dec,
        CrimeMoney: dec,
        HacknetNodeMoney: dec,
        ManualHackMoney: dec,
        ScriptHackMoney: dec,
        CodingContractMoney: dec,

        ClassGymExpGain: dec,
        CompanyWorkExpGain: dec,
        CrimeExpGain: dec,
        FactionWorkExpGain: dec,
        HackExpGain: dec,

        FactionPassiveRepGain: dec,
        FactionWorkRepGain: dec,
        RepToDonateToFaction: inc,

        AugmentationMoneyCost: inc,
        AugmentationRepCost: inc,

        InfiltrationMoney: dec,
        InfiltrationRep: dec,

        FourSigmaMarketDataCost: inc,
        FourSigmaMarketDataApiCost: inc,

        CorporationValuation: dec,
        CorporationSoftcap: 0.8,
        CorporationDivisions: 0.5,

        BladeburnerRank: dec,
        BladeburnerSkillCost: inc,

        GangSoftcap: 0.8,
        GangUniqueAugs: dec,

        StaneksGiftPowerMultiplier: inc,
        StaneksGiftExtraSize: inc,

        WorldDaemonDifficulty: inc,
      });
    }
    case 13: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.25,
        StrengthLevelMultiplier: 0.7,
        DefenseLevelMultiplier: 0.7,
        DexterityLevelMultiplier: 0.7,
        AgilityLevelMultiplier: 0.7,

        PurchasedServerSoftcap: 1.6,

        ServerMaxMoney: 0.3375,
        ServerStartingMoney: 0.75,
        ServerStartingSecurity: 3,

        CompanyWorkMoney: 0.4,
        CrimeMoney: 0.4,
        HacknetNodeMoney: 0.4,
        ScriptHackMoney: 0.2,
        CodingContractMoney: 0.4,

        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.1,

        FactionWorkRepGain: 0.6,

        FourSigmaMarketDataCost: 10,
        FourSigmaMarketDataApiCost: 10,

        CorporationValuation: 0.001,
        CorporationSoftcap: 0.4,
        CorporationDivisions: 0.4,

        BladeburnerRank: 0.45,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.3,
        GangUniqueAugs: 0.1,

        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: 1,

        WorldDaemonDifficulty: 3,
      });
    }
    case 14: {
      return new BitNodeMultipliers({
        GoPower: 4,

        HackingLevelMultiplier: 0.4,
        HackingSpeedMultiplier: 0.3,

        ServerMaxMoney: 0.7,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        CrimeMoney: 0.75,
        CrimeSuccessRate: 0.4,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.3,

        StrengthLevelMultiplier: 0.5,
        DexterityLevelMultiplier: 0.5,
        AgilityLevelMultiplier: 0.5,
        DefenseLevelMultiplier: 0.5,

        AugmentationMoneyCost: 1.5,

        InfiltrationMoney: 0.75,

        FactionWorkRepGain: 0.2,
        CompanyWorkRepGain: 0.2,

        CorporationValuation: 0.4,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.4,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: -1,

        WorldDaemonDifficulty: 5,
      });
    }
    default: {
      throw new Error("Invalid BitNodeN");
    }
  }
}

export function initBitNodeMultipliers(): void {
  replaceCurrentNodeMults(getBitNodeMultipliers(Player.bitNodeN, Player.activeSourceFileLvl(Player.bitNodeN) + 1));
}
