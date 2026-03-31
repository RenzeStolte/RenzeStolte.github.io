export enum BattlePhase {
  START = 'start',
  HERO = 'hero',
  MOVEMENT = 'movement',
  SHOOTING = 'shooting',
  CHARGE = 'charge',
  ATTACK = 'attack',
  END = 'end',
  DEPLOYMENT = 'deployment',
}

interface PassiveAction {
  actionType: 'passive';
  effect: string;
}

interface ActivatedAction {
  actionType: 'activated';
  declare: string;
  effect: string;
}

export interface BattleAction {
  name: string;
  description: string;
  actionDetails: PassiveAction | ActivatedAction;
  phaseActivation: BattlePhase;
  phaseActivationTiming: 'opponent' | 'own' | 'any';
  numberOfTimes: 'once' | 'perRound' | 'unlimited';
  commandPointCost?: number;
  castingValue?: number;
  chantingValue?: number;
  isCommand?: boolean;
  armyWide?: boolean;
  unitFilter?: string[];
}

export interface WeaponProfile {
  name: string;
  type: 'melee' | 'ranged';
  range?: string;
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;
  abilities?: string[];
}

export interface UnitCharacteristics {
  move: string;
  save: string;
  health: string;
  control: string;
}

export interface Unit {
  name: string;
  keywords: string[];
  hasRangedWeapons?: boolean;
  characteristics: UnitCharacteristics;
  weapons: WeaponProfile[];
  actions: BattleAction[];
}

export interface Army {
  name: string;
  faction: string;
  units: Unit[];
  armyOptions?: ArmyOptions;
}

export type ArmyChoiceCategory =
  | 'battleTrait'
  | 'battleFormation'
  | 'heroicTrait'
  | 'artifactOfPower'
  | 'spellLore'
  | 'prayerLore';

export interface ArmyChoice {
  name: string;
  description: string;
  actions: BattleAction[];
}

export interface ArmyOptions {
  battleTraits: ArmyChoice[];
  battleFormations: ArmyChoice[];
  heroicTraits: ArmyChoice[];
  artifactsOfPower: ArmyChoice[];
  spellLore: ArmyChoice[];
  prayerLore: ArmyChoice[];
}

export interface ArmySelections {
  battleTrait: ArmyChoice | null;
  battleFormation: ArmyChoice | null;
  heroicTrait: ArmyChoice | null;
  heroicTraitBearer: string | null;
  artifactOfPower: ArmyChoice | null;
  artifactOfPowerBearer: string | null;
  spellLore: ArmyChoice | null;
  prayerLore: ArmyChoice | null;
}

export interface PhaseStep {
  phase: BattlePhase;
  label: string;
}

export const TURN_PHASES: PhaseStep[] = [
  { phase: BattlePhase.HERO, label: 'Hero Phase' },
  { phase: BattlePhase.MOVEMENT, label: 'Movement Phase' },
  { phase: BattlePhase.SHOOTING, label: 'Shooting Phase' },
  { phase: BattlePhase.CHARGE, label: 'Charge Phase' },
  { phase: BattlePhase.ATTACK, label: 'Combat Phase' },
];

export const PHASE_LABELS: Record<BattlePhase, string> = {
  [BattlePhase.DEPLOYMENT]: 'Deployment Phase',
  [BattlePhase.START]: 'Start of Battle Round',
  [BattlePhase.HERO]: 'Hero Phase',
  [BattlePhase.MOVEMENT]: 'Movement Phase',
  [BattlePhase.SHOOTING]: 'Shooting Phase',
  [BattlePhase.CHARGE]: 'Charge Phase',
  [BattlePhase.ATTACK]: 'Combat Phase',
  [BattlePhase.END]: 'End of Battle Round',
};
