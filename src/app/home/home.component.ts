import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FactionSelectComponent} from './faction-select/faction-select.component';
import {ActionCardComponent} from './shared/action-card/action-card.component';
import {UnitDetailsComponent} from './unit-details/unit-details.component';
import {ArmySetupComponent} from './army-setup/army-setup.component';
import {
  Army,
  ArmyOptions,
  ArmySelections,
  BattleAction,
  BattlePhase,
  PhaseStep,
  TURN_PHASES,
  Unit
} from './models/battle.models';

const CORE_ABILITIES: BattleAction[] = [
  {
    name: 'Rally',
    description: 'A core ability available to all units during your Hero Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick a friendly unit that is not in combat to use this ability.',
      effect: 'Make 6 rally rolls of D6. For each 4+, you receive 1 rally point. Rally points can be spent as follows: For each rally point spent, Heal (1) that unit. You can spend a number of rally points equal to the Health characteristic of that unit to return a slain model to that unit. You can spend the rally points in any combination. Unspent rally points are then lost.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.HERO,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Move',
    description: 'A core ability available to all units during your Movement Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Declare this unit will use the Move ability.',
      effect: 'This unit can make a normal move up to its Move characteristic.',
    },
    phaseActivation: BattlePhase.MOVEMENT,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Run',
    description: 'A core ability available to all units during your Movement Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Declare this unit will use the Run ability.',
      effect: 'This unit can move and add D6 to the distance moved this phase. It cannot charge later this turn.',
    },
    phaseActivation: BattlePhase.MOVEMENT,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Retreat',
    description: 'A core ability available to all units during your Movement Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Declare this unit will use the Retreat ability.',
      effect: 'This unit can move while in combat, ending outside combat range if possible. It cannot charge later this turn.',
    },
    phaseActivation: BattlePhase.MOVEMENT,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Charge',
    description: 'A core ability available to all units during your Charge Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Declare this unit will use the Charge ability and pick an eligible enemy unit as target.',
      effect: 'Make a charge roll and move this unit into combat if the roll is sufficient.',
    },
    phaseActivation: BattlePhase.CHARGE,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Shoot',
    description: 'A core ability available to all units during your Shooting Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick an eligible enemy unit within range of this unit\'s missile weapon.',
      effect: 'Resolve this unit\'s missile weapon attacks against the picked unit.',
    },
    phaseActivation: BattlePhase.SHOOTING,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Core: Fight',
    description: 'A core ability available to all units during your Combat Phase.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick an eligible enemy unit within combat range.',
      effect: 'Resolve this unit\'s melee weapon attacks against the picked unit.',
    },
    phaseActivation: BattlePhase.ATTACK,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Redeploy',
    description: 'Taking initiative, the warriors hastily reposition to respond to enemy movements.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick a friendly unit that is not in combat to use this ability.',
      effect: 'Each model in that unit can move up to D6". That move cannot pass through or end within the combat range of an enemy unit.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.MOVEMENT,
    phaseActivationTiming: 'opponent',
    numberOfTimes: 'perRound',
  },
  {
    name: 'At the Double',
    description: 'Reaction: You declared a Run ability. The unit pushes harder, covering ground at maximum speed.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Used by a unit that has already been picked to use the Run command.',
      effect: 'Do not make a run roll as part of that Run ability. Instead, add 6" to that unit\'s Move characteristic to determine the distance each model in that unit can move as part of that Run ability.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.MOVEMENT,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Covering Fire',
    description: 'Allies lay down suppressive fire to protect the unit from enemy attack.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick a friendly unit that did not use a Run ability this turn and that is not in combat to use this ability, then pick the closest enemy unit (to that unit) that can be picked as the target of shooting attacks to be the target. You cannot pick Manifestation or faction terrain features as the target of this ability.',
      effect: 'Resolve shooting attacks for the unit using this ability against the target. You must subtract 1 from the hit rolls for those attacks.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.SHOOTING,
    phaseActivationTiming: 'opponent',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Counter-charge',
    description: 'Warriors seize the initiative and slam into the advancing foe.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick a friendly unit that is not in combat to use this ability.',
      effect: 'That unit can use a Charge ability as if it were your charge phase.',
    },
    isCommand: true,
    commandPointCost: 2,
    phaseActivation: BattlePhase.CHARGE,
    phaseActivationTiming: 'opponent',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Forward to Victory',
    description: 'Emboldened by their charge, the warriors press forward with renewed vigour.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Reaction: You declared a Charge ability. Used by the unit using that Charge ability.',
      effect: 'You can re-roll the charge roll.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.CHARGE,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
  },
  {
    name: 'All-out Attack',
    description: 'With a final effort, the warriors commit fully to the assault.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Reaction: You declared an Attack ability. Used by the unit using that Attack ability.',
      effect: 'Add 1 to hit rolls for attacks made as part of that Attack ability. This also affects weapons that have the Companion weapon ability.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.ATTACK,
    phaseActivationTiming: 'any',
    numberOfTimes: 'perRound',
  },
  {
    name: 'All-out Defence',
    description: 'The warriors brace themselves and raise their shields against the onslaught.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Reaction: Opponent declared an Attack ability. Used by a unit targeted by that Attack ability.',
      effect: 'Add 1 to save rolls for that unit in this phase.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.ATTACK,
    phaseActivationTiming: 'any',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Power Through',
    description: 'The warriors smash through enemy lines, refusing to be held in place.',
    actionDetails: {
      actionType: 'activated',
      declare: 'Pick a friendly unit that charged this turn to use this ability, then you must pick an enemy unit in combat with it to be the target. The target must have a lower Health characteristic than the unit using this ability.',
      effect: 'Inflict D3 mortal damage on the target. Then, the unit using this ability can move a distance up to its Move characteristic. It can pass through and end that move within the combat ranges of enemy units that were in combat with it at the start of the move, but not those of other enemy units. It does not have to end the move in combat.',
    },
    isCommand: true,
    commandPointCost: 1,
    phaseActivation: BattlePhase.END,
    phaseActivationTiming: 'any',
    numberOfTimes: 'perRound',
  },
  {
    name: 'Tactical Gambit',
    description: '',
    actionDetails: {
      actionType: 'activated',
      declare: 'You cannot use this ability if you went second in the previous battle round and chose to go first in the current battle round',
      effect: 'Pick 1 battle tactic that you have not yet attempted. You can attempt to complete that battle tactic this turn.',
    },
    phaseActivation: BattlePhase.START,
    phaseActivationTiming: 'own',
    numberOfTimes: 'perRound',
    armyWide: true,
  },
];

function cloneAction(action: BattleAction): BattleAction {
  return {
    ...action,
    actionDetails: action.actionDetails.actionType === 'activated'
      ? {...action.actionDetails}
      : {...action.actionDetails},
  };
}

function unitHasRangedWeapons(unit: Unit): boolean {
  if (unit.hasRangedWeapons !== undefined) return unit.hasRangedWeapons;

  if (unit.weapons.some(weapon => weapon.type === 'ranged')) return true;

  // Infer ranged capability from non-core, own-turn Shooting phase activated actions.
  return unit.actions.some(action =>
    action.phaseActivation === BattlePhase.SHOOTING &&
    action.phaseActivationTiming === 'own' &&
    action.actionDetails.actionType === 'activated' &&
    !action.name.startsWith('Core:')
  );
}

const MUSICIAN_ABILITY: BattleAction = {
  name: 'Musician',
  description: 'While this unit contains any musicians, if it uses the Rally ability, you can make one additional rally roll of D6.',
  actionDetails: {
    actionType: 'passive',
    effect: 'While this unit contains any musicians, if it uses the \'Rally\' ability, you can make one additional rally roll of D6.',
  },
  phaseActivation: BattlePhase.HERO,
  phaseActivationTiming: 'own',
  numberOfTimes: 'unlimited',
};

const STANDARD_BEARER_ABILITY: BattleAction = {
  name: 'Standard Bearer',
  description: '',
  actionDetails: {
    actionType: 'passive',
    effect: 'While this unit contains any standard bearers, add 1 to this unit\'s control score.',
  },
  phaseActivation: BattlePhase.END,
  phaseActivationTiming: 'any',
  numberOfTimes: 'unlimited',
};

const CHAMPION_ABILITY: BattleAction = {
  name: 'Champion',
  description: '',
  actionDetails: {
    actionType: 'passive',
    effect: 'Add 1 to the attack characteristics of weapons used by champions in this unit.',
  },
  phaseActivation: BattlePhase.END,
  phaseActivationTiming: 'any',
  numberOfTimes: 'unlimited',
};

const GUARDED_HERO_ABILITY: BattleAction = {
  name: 'Guarded Hero',
  description: '',
  actionDetails: {
    actionType: 'passive',
    effect: 'If this Hero is within the combat range of a friendly unit that is not a Hero: subtract 1 from hit rolls for shooting attacks that target this Hero. If this Hero is Infantry, they cannot be picked as the target of shooting attacks made by units more than 12" from them.',
  },
  phaseActivation: BattlePhase.SHOOTING,
  phaseActivationTiming: 'any',
  numberOfTimes: 'unlimited',
};

const UNBIND_ABILITY: BattleAction = {
  name: 'Unbind',
  description: 'Reaction: Your opponent declared a spell ability.',
  actionDetails: {
    actionType: 'activated',
    declare: 'Used by a friendly Wizard within 30" of the enemy Wizard casting the spell.',
    effect: 'Make an unbinding roll of 2D6. If the roll exceeds the casting roll for the spell, then the spell is unbound and its effect is not resolved. This reaction cannot be used more than once per casting roll.',
  },
  phaseActivation: BattlePhase.HERO,
  phaseActivationTiming: 'opponent',
  numberOfTimes: 'unlimited',
};

const MAGICAL_INTERVENTION: BattleAction = {
  name: 'Magical Intervention',
  description: 'Enemy hero phase.',
  isCommand: true,
  commandPointCost: 1,
  actionDetails: {
    actionType: 'activated',
    declare: 'Pick a friendly Wizard or Priest to use this ability.',
    effect: 'That friendly unit can use a Spell or Prayer ability (as appropriate) as if it were your hero phase. If you do so, subtract 1 from casting rolls or chanting rolls made as part of that ability.',
  },
  phaseActivation: BattlePhase.HERO,
  phaseActivationTiming: 'opponent',
  numberOfTimes: 'perRound',
};

function unitIsWizard(unit: Unit): boolean {
  return unit.keywords.some(k => k === 'Wizard' || k.startsWith('Wizard ('));
}

function unitIsPriest(unit: Unit): boolean {
  return unit.keywords.some(k => k === 'Priest' || k.startsWith('Priest ('));
}

function unitIsWizardOrPriest(unit: Unit): boolean {
  return unitIsWizard(unit) || unitIsPriest(unit);
}

function withCoreAbilities(army: Army): Army {
  return {
    ...army,
    units: army.units.map(unit => {
      const existing = new Set(unit.actions.map(action => action.name.toLowerCase()));
      const missingCore = CORE_ABILITIES
        .filter(action => action.name !== 'Core: Shoot' || unitHasRangedWeapons(unit))
        .filter(action => action.name !== 'Covering Fire' || unitHasRangedWeapons(unit))
        .filter(action => !existing.has(action.name.toLowerCase()))
        .map(cloneAction);

      const extras: BattleAction[] = [];
      if (unit.keywords.includes('Musician') && !existing.has('musician')) {
        extras.push(cloneAction(MUSICIAN_ABILITY));
      }
      if (unit.keywords.includes('Standard Bearer') && !existing.has('standard bearer')) {
        extras.push(cloneAction(STANDARD_BEARER_ABILITY));
      }
      if (unit.keywords.includes('Champion') && !existing.has('champion')) {
        extras.push(cloneAction(CHAMPION_ABILITY));
      }
      if (unitIsWizard(unit) && !existing.has('unbind')) {
        extras.push(cloneAction(UNBIND_ABILITY));
      }
      if (unit.keywords.includes('Hero') && !existing.has('guarded hero')) {
        extras.push(cloneAction(GUARDED_HERO_ABILITY));
      }
      if (unitIsWizardOrPriest(unit) && !existing.has('magical intervention')) {
        extras.push(cloneAction(MAGICAL_INTERVENTION));
      }

      return {
        ...unit,
        actions: [...missingCore, ...extras, ...unit.actions],
      };
    }),
  };
}

type RoundStage =
  | { type: 'deployment' }
  | { type: 'start' }
  | { type: 'startActions' }
  | { type: 'turn'; playerIndex: 0 | 1; phaseIndex: number }
  | { type: 'end' };

const ASTERISM_NAMES = new Set([
  'Itzl the Tamer',
  'Quetzl the Preserver',
  'Sotek the deliverer',
  'Tepok the Seer',
]);

const STORMCAST_ARMY: Army = {
  name: 'Hammers of Sigmar',
  faction: 'Stormcast Eternals',
  units: [
    {
      name: 'Knight-Questor',
      keywords: ['Hero', 'Infantry', 'Order', 'Stormcast Eternals', 'Warrior Chamber'],
      characteristics: {move: '5"', save: '3+', health: '6', control: '2'},
      weapons: [
        {
          name: 'Questor Relic Blade',
          type: 'melee',
          attacks: '5',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '2',
        },
      ],
      actions: [
        {
          name: 'Heroic Retribution',
          description: 'Should the need arise, the Knight-Questor will call upon their Soulsworn brethren to make the God-King\'s justice a reaility.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: You declared a Fight ability for this unit. Pick a friendly Questor Soulsworn unit that has not used a Fight ability this turn and is within this unit\'s combat range to be the target.',
            effect: 'The target can be picked to use a Fight ability immediately after the Fight ability used by this unit has been resolved.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Ordained Quest',
          description: 'Questors travel deep into enemy territory to gain control of vital landmarks with hidden secrets.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once Per Battle (Army), Deployment Phase. Pick an objective wholly outside friendly territory.',
            effect: 'That objective is considered by you to be questmarked.',
          },
          phaseActivation: BattlePhase.DEPLOYMENT,
          phaseActivationTiming: 'own',
          numberOfTimes: 'once',
        },
        {
          name: 'His Will Be Done',
          description: 'Questors will stop at nothing to fulfil the sacred task given to them by the God-King himself.',
          actionDetails: {
            actionType: 'passive',
            effect: 'While this unit is contesting a questmarked objective: Add 3 to this unit\'s control score and this unit has Ward (5+).',
          },
          phaseActivation: BattlePhase.END,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Lord-Veritant',
      keywords: ['Hero', 'Priest (1)', 'Infantry', 'Order', 'Stormcast Eternals', 'Ruination Chamber'],
      characteristics: {move: '5"', save: '3+', health: '6', control: '2'},
      weapons: [
        {
          name: 'Staff of Abjuration',
          type: 'melee',
          attacks: '1',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '3',
        },
        {
          name: 'Judgement Blade',
          type: 'melee',
          attacks: '3',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: 'D3',
          abilities: ['Anti-Priest (+1 Rend)', 'Anti-Wizard (+1 Rend)']
        },
      ],
      actions: [
        {
          name: 'Ruination Chamber',
          description: 'These veterans march where others cannot tread, fighting upon battlefields transformed into scenes of apocalypse. Even the most corrosive magics find no purchase on their souls.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: This unit was picked as the target of a non-Core ability.',
            effect: 'Make a resistance roll of D6. On a 4+, that ability has no effect on this unit.',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          showAllPhases: true,
          linkedGroup: 'ruination-chamber',
        },
        {
          name: 'Sense Unholy Sorcery',
          description: 'Gryph-crows are sensitive to corruption and immediately alert their masters whenever unholy energies are nearby.',
          actionDetails: {
            actionType: 'passive',
            effect: 'This unit\'s Gryph-crow is a token. Subtract 1 from casting rolls and chanting rolls for enemy units within 12" of this unit while its Gryph-crow is on the battlefield. If you make an unmodified save roll of 1 for this unit, remove its Gryph-crow from the battlefield after the Attack ability has been resolved. (the damage point is still inflicted).',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'opponent',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Staff of Abjuration (Unbind)',
          description: 'The blessed light that shines from this staff can banish even the most potent sorceries.',
          actionDetails: {
            actionType: 'passive',
            effect: 'This unit can use Unbind abilities as if it had Wizard (1).',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'opponent',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Lord-Terminos',
      keywords: ['Hero', 'Infantry', 'Order', 'Stormcast Eternals', 'Ruination Chamber'],
      characteristics: {move: '5"', save: '3+', health: '6', control: '2'},
      weapons: [
        {
          name: 'Terminos Greatblade',
          type: 'melee',
          attacks: '4',
          hit: '3+',
          wound: '2+',
          rend: '2',
          damage: '3',
          abilities: ['Crit (Mortal)']
        },
      ],
      actions: [
        {
          name: 'Ruination Chamber',
          description: 'These veterans march where others cannot tread, fighting upon battlefields transformed into scenes of apocalypse. Even the most corrosive magics find no purchase on their souls.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: This unit was picked as the target of a non-Core ability.',
            effect: 'Make a resistance roll of D6. On a 4+, that ability has no effect on this unit.',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          showAllPhases: true,
          linkedGroup: 'ruination-chamber',
        },
        {
          name: 'Memorian',
          description: 'Memorians serve to remind soul-damaged Stormcasts of their humanity.',
          actionDetails: {
            actionType: 'passive',
            effect: 'This unit\'s Memorion is a token. Add 3 to the control scores of friendly Ruination Chamber units wholly within 12" of this unit while its Memorian is on the battlefield. If you make an unmodified save roll of 1 for this unit, remove its Memorian from the battlefield after the Attack ability has been resolved (the damage point is still inflicted).',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Earn an Honourable Death',
          description: 'The Lord-Terminos leads the Ruination Chamber into battle, seeking a final glorious end.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: You declared a Fight ability for this unit. Pick a friendly non-Hero Ruination Chamber Infantry unit that has not used a Fight ability this turn and si within this unit\'s combat range to be the target.',
            effect: 'The target can be picked to use a Fight ability immediately after the Fight ability used by this unit has been resolved. If it is picked to do so, add 1 to hit rolls for the target\'s attacks for the rest of the turn.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Lord-Vigilant on Gryph-Stalker',
      keywords: ['Hero', 'Cavalry', 'Order', 'Stormcast Eternals', 'Ruination Chamber'],
      characteristics: {move: '12"', save: '3+', health: '8', control: '2'},
      weapons: [
        {
          name: 'Vigilant Blade',
          type: 'melee',
          attacks: '5',
          hit: '3+',
          wound: '3+',
          rend: '2',
          damage: '2',
        },
        {
          name: 'Gryph-stalker Claws',
          type: 'melee',
          attacks: '3',
          hit: '4+',
          wound: '3+',
          rend: '1',
          damage: '2',
          abilities: ['Companion']
        },
      ],
      actions: [
        {
          name: 'Ruination Chamber',
          description: 'These veterans march where others cannot tread, fighting upon battlefields transformed into scenes of apocalypse. Even the most corrosive magics find no purchase on their souls.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: This unit was picked as the target of a non-Core ability.',
            effect: 'Make a resistance roll of D6. On a 4+, that ability has no effect on this unit.',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          showAllPhases: true,
          linkedGroup: 'ruination-chamber',
        },
        {
          name: 'Deliver Judgement',
          description: 'This warrior orders Sigmar\'s wrath to be delivered unto their enemies.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once Per Battle (Army). Pick a friendly non-Hero Ruination Chamber unit wholly within 12" of this unit.',
            effect: 'That unit can use 2 Fight abilities this phase. After the first is used, however, that unit has Strike-last for the rest of the turn.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'once',
        },
      ],
    },
    {
      name: 'Liberators',
      keywords: ['Infantry', 'Champion', 'Order', 'Stormcast Eternals', 'Warrior Chamber'],
      characteristics: {move: '5"', save: '3+', health: '2', control: '1'},
      weapons: [
        {
          name: 'Warhammer',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          abilities: ['Crit (Mortal)']
        },
        {
          name: 'Grandhammer',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '2',
          abilities: ['Crit (Mortal)']
        },
      ],
      actions: [
        {
          name: 'Stalwart Defenders',
          description: 'Liberators fiercely guard the lands brought into Sigmar\'s domain.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 3 to this unit\'s control score while it is contesting an objective wholly within friendly territory.',
          },
          phaseActivation: BattlePhase.END,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Prosecutors',
      keywords: ['Infantry', 'Champion', 'Fly', 'Order', 'Stormcast Eternals', 'Ruination Chamber'],
      characteristics: {move: '12"', save: '3+', health: '2', control: '1'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Celestial Javelin',
          type: 'ranged',
          attacks: '1',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: 'D3',
          range: '10"'
        },
        {
          name: 'Stormcall Javelin',
          type: 'melee',
          attacks: '3',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          abilities: ['Charge (1+ Damage)']
        },
      ],
      actions: [
        {
          name: 'Ruination Chamber',
          description: 'These veterans march where others cannot tread, fighting upon battlefields transformed into scenes of apocalypse. Even the most corrosive magics find no purchase on their souls.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: This unit was picked as the target of a non-Core ability.',
            effect: 'Make a resistance roll of D6. On a 4+, that ability has no effect on this unit.',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          showAllPhases: true,
          linkedGroup: 'ruination-chamber',
        },
        {
          name: 'Heralds of Righteousness',
          description: 'Prosecutors cross the battlefield in a blur of light.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to the number of dice rolled when making charge rolls for this unit, to a maximum of 3.',
          },
          phaseActivation: BattlePhase.CHARGE,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Dispersed Formation',
          description: 'These warriors maintain a wide formation, enabling more precise strikes and greater battlefield control.',
          actionDetails: {
            actionType: 'passive',
            effect: 'This unit has a coherency range of 2".',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Reclusians',
      keywords: ['Infantry', 'Champion', 'Order', 'Stormcast Eternals', 'Ruination Chamber'],
      characteristics: {move: '5"', save: '3+', health: '3', control: '1'},
      weapons: [
        {
          name: 'Rune-blessed Weapons',
          type: 'melee',
          attacks: '3',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '2',
          abilities: ['Crit (Mortal)']
        },
      ],
      actions: [
        {
          name: 'Ruination Chamber',
          description: 'These veterans march where others cannot tread, fighting upon battlefields transformed into scenes of apocalypse. Even the most corrosive magics find no purchase on their souls.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: This unit was picked as the target of a non-Core ability.',
            effect: 'Make a resistance roll of D6. On a 4+, that ability has no effect on this unit.',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          showAllPhases: true,
          linkedGroup: 'ruination-chamber',
        },
        {
          name: 'Memorian Descendants',
          description: 'Reclusians are accompanied by Memorians who serve to remind them of their humanity.',
          actionDetails: {
            actionType: 'passive',
            effect: 'This unit\'s Memorians are tokens. There are 2 Memorians for every 3 models in this unit. While any of this unit\'s Memorians are on the battlefield, add 1 to this unit\'s resistance rolls when using the \'Ruination Chamber\' ability. Each time you make an unmodified save roll of 1 for this unit, remove 1 of its Memorians from the battlefield after the Attack ability has been resolved (the damage point is still inflicted).',
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
  ],
};

const SKAVEN_ARMY: Army = {
  name: 'Skaven Raiding Party',
  faction: 'Skaven',
  units: [
    {
      name: 'Grey Seer',
      keywords: ['Hero', 'Wizard (1)', 'Infantry', 'Chaos', 'Skaven', 'Masterclan'],
      characteristics: {move: '6"', save: '6+', health: '5', control: '2'},
      weapons: [
        {
          name: 'Warstone Staff',
          type: 'melee',
          attacks: '3',
          hit: '4+',
          wound: '4+',
          rend: '1',
          damage: 'D3',
        },
      ],
      actions: [
        {
          name: 'Warpstone Shards',
          description: 'Grey Seers consume potentially lethal shards of warpstone to enhance their spellcasting.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Your Hero Phase. Make a casting roll and roll 3D6 instead of 2D6. This roll cannot be re-rolled or modified.',
            effect: 'If the casting roll is 13, the spell is successfully cast and cannot be unbound. After the effect resolves, inflict D3 mortal damage on this unit. If the casting roll is not 13, remove 1 die of your choice from the casting roll and use the remaining 2D6 as the casting roll.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
      ],
    },
    {
      name: 'Warlock Engineer',
      keywords: ['Hero', 'Infantry', 'Chaos', 'Skaven', 'Scryre'],
      characteristics: {move: '6"', save: '5+', health: '5', control: '2'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Warplock Musket',
          type: 'ranged',
          range: '24"',
          attacks: '2',
          hit: '3+',
          wound: '3+',
          rend: '2',
          damage: 'D3',
          abilities: ['Crit (Auto-wound)'],
        },
        {
          name: 'Warpforged Dagger',
          type: 'melee',
          attacks: '3',
          hit: '4+',
          wound: '4+',
          rend: '-',
          damage: '2',
        },
      ],
      actions: [
        {
          name: 'More-more Warp Energy!',
          description: 'The Engineer overcharges their weapon with volatile energy.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Reaction: You declared a Shoot ability for this unit, it was not set up this turn and it has not used a Move ability this turn.',
            effect: 'Roll a dice. On a 2+, set the Damage characteristic of this unit\'s Warplock Musket to 3 for the rest of the turn. On a 1, inflict D3 mortal damage on this unit.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Sniper-Master',
          description: 'No enemy is safe from the warp-fueled bullets of a Warlock Engineer.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once Per Battle (Army). Your Shooting Phase. Pick a visible enemy Hero to be the target.',
            effect: 'For the rest of the turn, this unit and friendly Warplock Jezzails units wholly within 13" of this unit can ignore the effects of the "Guarded Hero" ability when picking the target for their shooting attacks.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'once',
        },
      ],
    },
    {
      name: 'Warplock Jezzails',
      keywords: ['Infantry', 'Chaos', 'Skaven', 'Scryre'],
      characteristics: {move: '6"', save: '4+', health: '2', control: '1'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Warplock Jezzail',
          type: 'ranged',
          range: '24"',
          attacks: '2',
          hit: '4+',
          wound: '3+',
          rend: '2',
          damage: '2',
          abilities: ['Crit (Auto-wound)'],
        },
        {
          name: 'Rusty Knives',
          type: 'melee',
          attacks: '2',
          hit: '4+',
          wound: '5+',
          rend: '-',
          damage: '1',
        },
      ],
      actions: [
        {
          name: 'Warpstone Snipers',
          description: 'Having set up the Warplock Jezzail in position, the gunner can wait for the perfect moment to fire their shot.',
          actionDetails: {
            actionType: 'passive',
            effect: 'If this unit has not used a Move ability this turn and was not set up this turn, add 1 to hit rolls for this unit\'s shooting attacks for the rest of the turn.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Clanrats',
      keywords: ['Battleline', 'Infantry', 'Champion', 'Musician', 'Standard Bearer', 'Chaos', 'Skaven', 'Verminus'],
      characteristics: {move: '6"', save: '5+', health: '1', control: '1'},
      weapons: [
        {
          name: 'Rusty Weapons',
          type: 'melee',
          attacks: '2',
          hit: '4+',
          wound: '5+',
          rend: '-',
          damage: '1',
          abilities: ['Crit (Auto-wound)'],
        },
      ],
      actions: [
        {
          name: 'Seething Swarm',
          description: 'Clanrats overwhelm their enemies with their seemingly endless numbers – biting, stabbing and trampling their own fallen beneath their bloody claws.',
          actionDetails: {
            actionType: 'activated',
            declare: 'End Of Any Turn.',
            effect: 'You can return D3 slain models to this unit.',
          },
          phaseActivation: BattlePhase.END,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Rat Ogors',
      keywords: ['Infantry', 'Mould', 'Chaos', 'Skaven'],
      characteristics: {move: '6"', save: '5+', health: '4', control: '1'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Warfire Gun',
          type: 'ranged',
          range: '10"',
          attacks: '2D6',
          hit: '2+',
          wound: '4+',
          rend: '2',
          damage: '1',
          abilities: ['Shoot in Combat'],
        },
        {
          name: 'Claws, Blades and Fangs',
          type: 'melee',
          attacks: '5',
          hit: '4+',
          wound: '3+',
          rend: '1',
          damage: '2',
        },
      ],
      actions: [
        {
          name: 'Unleashed Warp-Fury',
          description: 'The warpstone hammered into the flesh of these creatures crackles with volatile energies, driving them into a frenzy.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Any Combat Phase.',
            effect: 'Inflict D3 mortal damage on this unit. Then, add 1 to the Attacks characteristic of this unit\'s melee weapons for the rest of the turn.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Ratling Warblaster',
      keywords: ['War Machine', 'Chaos', 'Skaven', 'Skryre'],
      characteristics: {move: '6"', save: '4+', health: '7', control: '2'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Hail of Warpstone Bullets',
          type: 'ranged',
          range: '20"',
          attacks: '3D6+3',
          hit: '4+',
          wound: '3+',
          rend: '1',
          damage: '1',
          abilities: ['Crit (Auto-wound)'],
        },
        {
          name: 'Thrall-rat\'s Claws',
          type: 'melee',
          attacks: '4',
          hit: '4+',
          wound: '5+',
          rend: '-',
          damage: '1',
        },
      ],
      actions: [
        {
          name: 'Overwhelming Fire',
          description: 'Large enemy formations are decimated by the sheer volume of fire a Ratling Warblaster unleashes upon them.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to hit rolls for this unit\'s shooting attacks that target an enemy unit that has 10 or more models.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'More-more Warpstone Bullets!',
          description: 'Under the dubious supervision of the Warlocks of Clans Skryre, the gunner cranks up the Ratling Warblaster\'s velocity to the max.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once Per Turn (Army). Your Shooting Phase. If this unit is within the combat range of a friendly Skryre Hero, add 3D6 to the Hail of Warpstone Bullets attack roll.',
            effect: 'For each unmodified roll of 1, inflict 1 mortal damage on this unit after the Shoot ability has been resolved. Otherwise, roll 1D6 additional attacks.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
      ],
    },
  ],
};

const DAUGHTERS_ARMY: Army = {
  name: '',
  faction: 'Daughters of Khaine',
  units: [
    {
      name: 'Hag Queen on Cauldron of Blood',
      keywords: ['Hero', 'Priest (1)', 'War Machine', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf', 'Cauldron of Blood'],
      characteristics: {move: '6"', save: '4+', health: '12', control: '5'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Torrent of Burning Blood',
          type: 'ranged',
          attacks: '6',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          range: '10"',
          abilities: ['Shoot in combat']
        },
        {
          name: 'Blade of Khaine',
          type: 'melee',
          attacks: '4',
          hit: '3+',
          wound: '4+',
          rend: '1',
          damage: '2',
          abilities: ['Crit (Mortal)']
        },
        {
          name: 'Avatar\'s Sword',
          type: 'melee',
          attacks: '5',
          hit: '3+',
          wound: '3+',
          rend: '2',
          damage: '3',
        },
        {
          name: 'Witch Aelves\' Sciansa',
          type: 'melee',
          attacks: '6',
          hit: '3+',
          wound: '4+',
          rend: '-',
          damage: '1',
        },
      ],
      actions: [
        {
          name: 'Altar of Khaine',
          description: '',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to save rolls for friendly DoK Priests while they are wholly within 9" of this unit.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Bladed Impact',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'If this unit charged this phase, pick an enemy unit within 1" of it to be the target.',
            effect: 'Roll a D3. On a 2+, inflict an amount of mortal damage on the target equal to the roll.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Witchbrew',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK unit wholly within 12" of this unit to be the target.',
            effect: 'Roll a dice. On a 3+, the target has Ward (5+) for the rest of the turn',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
      ],
    },
    {
      name: 'Witch Aelves with Bladed Bucklers',
      keywords: ['Infantry', 'Champion', 'Musician', 'Standard Bearer', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf'],
      characteristics: {move: '6"', save: '5+', health: '1', control: '1'},
      weapons: [
        {
          name: 'Sciansa',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '4+',
          rend: '-',
          damage: '1',
          abilities: ['Crit (Auto-wound)']
        },
      ],
      actions: [
        {
          name: 'Bladed Bucklers',
          description: '',
          actionDetails: {
            actionType: 'passive',
            effect: 'Each time you make an unmodified save roll of 6 for a combat attack that targets this unit, inflict 1 mortal damage on the attacking unit after the Fight ability has been resolved.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Krethusa the Croneseer',
      keywords: ['Unique', 'Hero', 'Priest (1)', 'Infantry', 'Fly', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf'],
      characteristics: {move: '12"', save: '5+', health: '6', control: '2'},
      weapons: [
        {
          name: 'Staff of Morai-Heg',
          type: 'melee',
          attacks: '4',
          hit: '3+',
          wound: '4+',
          rend: '1',
          damage: 'D3',
        },
      ],
      actions: [
        {
          name: 'Burnt Offerings',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'If this unit is within combat range of a friendly Cauldron of Blood, pick a visible friendly DoK Aelf non-Hero Infantry unit wholly within 18" of this unit to be the target.',
            effect: 'Roll a dice. On a 2+, pick 1 of the following effects to apply to the target. (Until the start of your next turn, enemy units cannot use commands while they are in combat with the target) (The target can use the Normal Move ability as if it were your movement phase. That unit caounts as having used a Run ability this turn.) (For the rest of the turn, while the target is contesting an objective, subtract 10 from the control scores of enemy units contesting that objective that do not have the Hero or Monster keyword)',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Murder of Crows',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a visible enemy unit within 18" of this unit to be the target, then make a chanting roll of D6.',
            effect: 'Roll a D3. If the chanting roll was 8+, roll a D6 instead. Inflict an amount of mortal damage on the target equal to the roll. In addition, if the roll exceeds the target\'s Health characteristic, subtract 1 from hit rolls for the target\'s attacks until the start of your next turn.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          chantingValue: 4
        },
      ],
    },
    {
      name: 'Slaughter Queen',
      keywords: ['Hero', 'Priest (1)', 'Infantry', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf'],
      characteristics: {move: '6"', save: '5+', health: '5', control: '2'},
      weapons: [
        {
          name: 'Deathsword and Blade of Khaine',
          type: 'melee',
          attacks: '6',
          hit: '3+',
          wound: '4+',
          rend: '1',
          damage: '2',
        },
      ],
      actions: [
        {
          name: 'Orgy of Slaughter',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Aelf Infantry unit wholly within 12" of this unit to be the target',
            effect: 'Roll a dice. On a 3+, add 1 to the Attacks characteristic of the target\'s melee weapons for the rest of the turn.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
      ],
    },
    {
      name: 'Doomfire Warlocks',
      keywords: ['Wizard (1)', 'Cavalry', 'Champion', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf'],
      characteristics: {move: '14"', save: '5+', health: '3', control: '1'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Doomfire Crossbow',
          type: 'ranged',
          attacks: '2',
          hit: '3+',
          wound: '4+',
          rend: '-',
          damage: '1',
          range: '10"'
        },
        {
          name: 'Cursed Scimitar',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '4+',
          rend: '1',
          damage: '1',
        },
        {
          name: 'Dark Steed\'s Vicious Bite',
          type: 'melee',
          attacks: '2',
          hit: '5+',
          wound: '3+',
          rend: '-',
          damage: '1',
          abilities: ['Companion']
        },
      ],
      actions: [
        {
          name: 'Outmanoeuvre',
          description: '',
          actionDetails: {
            actionType: 'passive',
            effect: 'When this unit uses the \'Redeploy\' command, if you roll a 1-3 when determining the distance this unt can move, you can use a value of 4 instead.',
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'opponent',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Khainite Shadowstalkers',
      keywords: ['Infantry', 'Champion', 'Ward (6+)', 'Order', 'Daughters of Khaine', 'Aelf'],
      characteristics: {move: '6"', save: '5+', health: '1', control: '1'},
      hasRangedWeapons: true,
      weapons: [
        {
          name: 'Cursed Missiles',
          type: 'ranged',
          attacks: '1',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          range: '10"'
        },
        {
          name: 'Shadowstalker Blades',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '4+',
          rend: '-',
          damage: '1',
        },
      ],
      actions: [
        {
          name: 'Shadow Leap',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: '',
            effect: 'Remove this unit from the battlefield and set it up again on the battlefield more than 9" from all enemy units.',
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
      ],
    },
  ],
};

const SERAPHON_ARMY: Army = {
  name: 'Thunder Lizards',
  faction: 'Seraphon',
  units: [
    {
      name: 'Slann Starmaster',
      keywords: ['Warmaster', 'Hero', 'Wizard (3)', 'Infantry', 'Fly', 'Ward (6+)'],
      characteristics: {move: '5"', save: '5+', health: '9', control: '2'},
      weapons: [
        {
          name: 'Azure Lightning',
          type: 'melee',
          attacks: '6',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          abilities: ['Crit (Mortal)']
        },
      ],
      actions: [
        {
          name: 'Masters of Order',
          description: 'Add 1 to casting rolls and can use unbind with extra range',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to casting rolls for this unit. In addition, this unit can use an Unbind ability if an enemy Wizard anywhere on the battlefield uses a Spell ability instead of an enemy Wizard within 30" of this unit, and when using the \'Banish Manifestation\' ability, this unit can pick a manifestation anywhere on the battlefield instead of within 30" of it.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Celestial Equilibrium',
          description: 'Buff casting rolls of other nearby units.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Make a casting roll of 2D6',
            effect: 'For the rest of the turn, add 1 to casting rolls made for other friendly Seraphon Wizards while they are wholly within 12" of this unit.',
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Arcane Vassal',
          description: 'Cast from a Skink Wizard\'s position.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skink Wizard wholly within 18" of this unit to be the target.',
            effect: 'Measure the range and visibility of the next Spell ability used by this unit this phase from the target instead of from this unit. The target is treated as the caster for the purpose of other abilities or spell effects, such as \'Unbind\' or \'The Earth Trembles\'.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Celestial Reinforcements',
          description: 'Revive a dead unit with 3 models or more',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon unit that started the battle with 3 ore more models and that has been destroyed to be the target.',
            effect: 'Roll a dice. On a 4+, set up a replacement unit with half the number of models from the target unit (rounding up) wholly within 12" of this unit and more than 9" from all enemy units.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
        },
      ],
    },
    // Lord Kroak warscroll
    // {
    //   name: 'Lord Kroak',
    //   keywords: [
    //     'Warmaster', 'Unique', 'Hero', 'Wizard (3)', 'Fly', 'Ward (4+)',
    //     'Order', 'Seraphon', 'Slann'
    //   ],
    //   characteristics: { move: '5"', save: '4+', health: '18', control: '5' },
    //   weapons: [
    //     {
    //       name: 'Gaze of Kroak',
    //       type: 'ranged',
    //       range: '12"',
    //       attacks: '1',
    //       hit: '2+',
    //       wound: '3+',
    //       rend: '2',
    //       damage: 'D6',
    //       abilities: ['Shoot in Combat'],
    //     },
    //     {
    //       name: 'Azyrite Force Barrier',
    //       type: 'melee',
    //       attacks: '2D6',
    //       hit: '3+',
    //       wound: '3+',
    //       rend: '1',
    //       damage: '1',
    //       abilities: ['Crit (Mortal)'],
    //     },
    //   ],
    //   actions: [
    //     {
    //       name: 'Supreme Master of Order',
    //       description: 'The slann are amongst the greatest wizards in existence, but Lord Kroak is mighty even in comparison to others of his kind.',
    //       actionDetails: {
    //         actionType: 'passive',
    //         effect: 'Add 2 to casting rolls for this unit. In addition, this unit can use an Unbind ability if an enemy Wizard anywhere on the battlefield uses a Spell ability instead of an enemy Wizard within 30" of this unit, and when using the \'Banish Manifestation\' ability, this unit can pick a manifestation anywhere on the battlefield instead of within 30" of it.',
    //       },
    //       phaseActivation: BattlePhase.HERO,
    //       phaseActivationTiming: 'own',
    //       numberOfTimes: 'unlimited',
    //     },
    //     {
    //       name: 'Arcane Vassal',
    //       description: 'A Slann Starmaster can channel the power of a spell through one of their followers.',
    //       actionDetails: {
    //         actionType: 'activated',
    //         declare: 'Once Per Turn, Any Hero Phase. Pick a friendly Skink Wizard wholly within 18" of this unit to be the target.',
    //         effect: 'Measure the range and visibility of the next Spell ability used by this unit this phase from the target instead from this unit. The target is treated as the caster for the purpose of other abilities or spell effects, such as \'Unbind\' or \'The Earth Trembles\'',
    //       },
    //       phaseActivation: BattlePhase.HERO,
    //       phaseActivationTiming: 'any',
    //       numberOfTimes: 'perRound',
    //     },
    //     {
    //       name: 'Dead for Innumerable Ages',
    //       description: 'Lord Kroak is no longer truly alive; his form is preserved only by his indomitable spirit. As a result, he is immune to all but the most devastating attacks.',
    //       actionDetails: {
    //         actionType: 'activated',
    //         declare: 'End of Any Turn.',
    //         effect: 'This unit must use this ability each turn while it is damaged. Roll 3D6 and add the number of damage points this unit has to the roll. On a 20+ this unit is destroyed. Otherwise, Heal (18) this unit.',
    //       },
    //       phaseActivation: BattlePhase.END,
    //       phaseActivationTiming: 'any',
    //       numberOfTimes: 'perRound',
    //     },
    //     {
    //       name: 'Celestial Deliverance',
    //       description: 'Lord Kroak\'s palanquin quivers with barely contained force before unleashing ruination on the enemies of the Seraphon.',
    //       actionDetails: {
    //         actionType: 'activated',
    //         declare: 'Your Hero Phase. This unit can cast this spell more than once per phase. Pick up to 3 different visible enemy units within 12" of this unit to be the targets, then make a casting roll of 2D6.',
    //         effect: 'Roll a D3 for each target. On a 2+, inflict an amount of mortal damage on the target equal to the roll.'
    //       },
    //       castingValue: 7,
    //       phaseActivation: BattlePhase.HERO,
    //       phaseActivationTiming: 'own',
    //       numberOfTimes: 'perRound',
    //     },
    //   ],
    // },
    {
      name: 'Aggradon Lancers',
      keywords: ['Cavalry', 'Champion', 'Musician', 'Standard Bearer'],
      characteristics: {move: '10"', save: '4+', health: '5', control: '2'},
      weapons: [
        {
          name: 'Celestite Spear and Club',
          type: 'melee',
          attacks: '3',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
          abilities: ['Charge (+1 Damage)', 'Anti-Monster (+1 Rend)']
        },
        {
          name: 'Aggradon\'s Rending Bites and Striking Talons',
          type: 'melee',
          attacks: '3',
          hit: '4+',
          wound: '3+',
          rend: '2',
          damage: '2',
          abilities: ['Companion']
        },
      ],
      actions: [
        {
          name: 'Primal Rage',
          description: 'If fighting, get stacks of rage which gives more damage.',
          actionDetails: {
            actionType: 'activated',
            declare: 'This unit must use this ability each turn',
            effect: 'If this unit used any Fight abilities this turn, place a rage token next to it, to a maximum of 3. If this unit did not use any Fight abilities this turn, remove all rage tokens it has. Add 1 to the attacks characteristics of this unit\'s Companion weapons for each rage token it has until the end of the next turn.',
          },
          phaseActivation: BattlePhase.END,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Saurus Warriors',
      keywords: ['Infantry', 'Champion', 'Musician', 'Standard Bearer', 'Order', 'Seraphon', 'Saurus'],
      characteristics: {move: '5"', save: '4+', health: '2', control: '1'},
      weapons: [
        {
          name: 'Celestite Weapon',
          type: 'melee',
          attacks: '2',
          hit: '3+',
          wound: '3+',
          rend: '1',
          damage: '1',
        },
      ],
      actions: [
        {
          name: 'Ordered Cohorts',
          description: 'Better save when contesting an objective you control',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to save rolls for this unit while each model in this unit is contesting an objective you control',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
    {
      name: 'Skink Starseer',
      keywords: ['Hero', 'Wizard (2)', 'Infantry', 'Fly', 'Order', 'Seraphon', 'Skink'],
      characteristics: {move: '5"', save: '4+', health: '6', control: '2'},
      weapons: [
        {
          name: 'Astromancer\'s staff',
          type: 'melee',
          attacks: '2',
          hit: '4+',
          wound: '3+',
          rend: '1',
          damage: 'D3',
        },
      ],
      actions: [
        {
          name: 'Celestial Doom',
          description: 'Disable ward on an enemy unit.',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a visible enemy unit within 18" to be the target, then make a casting roll of 2D6.',
            effect: 'Ward rolls cannot be made for the target for the rest of the turn.',
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
          castingValue: 7,
        },
      ],
    },
    {
      name: 'Kroxigor Warspawned',
      keywords: ['Infantry', 'Order', 'Seraphon', 'Kroxigor'],
      characteristics: {
        move: '5"',
        save: '4+',
        health: '6',
        control: '2'
      },
      weapons: [
        {
          name: 'Drakefang Warpick',
          type: 'melee',
          attacks: '4',
          hit: '4+',
          wound: '2+',
          rend: '1',
          damage: '2',
          abilities: ['Anti-Monster (+1 Rend)']
        },
        {
          name: 'Starfang Warpick',
          type: 'melee',
          attacks: '4',
          hit: '4+',
          wound: '2+',
          rend: '1',
          damage: '3',
          abilities: ['Anti-Monster (+1 Rend)']
        },
      ],
      actions: [
        {
          name: 'Spawn of Sotek',
          description: 'Gets Damage boost when fighting with skinks.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to the Damage characteristic of this unit\'s melee weapons while this unit is wholly within 12" of any friendly Skink Infantry or Skink Cavalry units in combat.',
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
        {
          name: 'Heavy-Scaled Skin',
          description: 'Defense against ranged weapons.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Subtract 1 from the Rend characteristic of ranged weapons used for shooting attacks that target this unit.',
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        },
      ],
    },
  ],
};

// ── Faction Army Options ──

const STORMCAST_OPTIONS: ArmyOptions = {
  battleTraits: [
    {
      name: 'The Celestial Realm',
      description: '',
      actions: [
        {
          name: 'The Celestial Realm',
          description: 'Set a unit in the Celestial Realm',
          actionDetails: {
            actionType: 'activated',
            declare: 'If there are more friendly Stormcast Eternals units on the battlefield than there are set up in reserve, pick a friendly Stormcast Eternals unit that has not been deployed.',
            effect: 'Set up that unit in reserve in the Celestial Realm. It has now been deployed.'
          },
          phaseActivation: BattlePhase.DEPLOYMENT,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true
        },
        {
          name: 'Scions of the Storm',
          description: 'Deploy a unit from the Celestial Realm',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Stormcast Eternals unit that is in the Celestial Realm.',
            effect: 'Set up that unit anywhere on the battlefield more than 9" from all enemy units.'
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
          armyWide: true
        },
        {
          name: 'Heavens-sent',
          description: 'Resummon unit that has been destroyed',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly non-Unique Stormcast Eternals Infantry or Cavalry unit that started the battle with 2 or more models and that has been destroyed to be the target.',
            effect: 'Set up a replacement unit with half the numbers of models from the target unit (rounding up) more than 9" from all enemy units.'

          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'own',
          numberOfTimes: 'once',
          commandPointCost: 1
        },
        {
          name: 'Their finest hour',
          description: 'Buff a unit',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once per turn (Army), pick a friendly Stormcast Eternals unit that has not used this ability this battle to use this ability.',
            effect: 'For the rest of the turn, add 1 to wound rolls for that unit\'s combat attacks and add 1 to save rolls for that unit.'
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'unlimited',
          armyWide: true
        },
      ],
    },
  ],
  battleFormations: [
    {
      name: 'Sentinels of the Bleak Citadels',
      description: 'Give ward to Ruination Chamber units during hero phase.',
      actions: [
        {
          name: 'Ancient Aura',
          description: 'Give ward to Ruination Chamber units during hero phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Once per turn (Army), pick a friendly Ruination Chamber unit.',
            effect: 'That unit has Ward (5+) for the rest of the turn.'
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true
        },
      ],
    },
    {
      name: 'Thunderhead Host',
      description: 'Boost hit rolls of Warrior Chamber units next to other allies.',
      actions: [
        {
          name: 'Synchronized Strikes',
          description: 'Boost hit rolls of Warrior Chamber units next to other allies.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to hit rolls for combat attacks made by friendly Warrior Chamber units while they are wholly within 12" of any friendly non-Hero Stormcast Eternals units that do not have the Warrior Chamber keyword.'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true
        },
      ],
    },
    {
      name: 'Vanguard Wing',
      description: 'Dont pick this.',
      actions: [{
        name: 'Peerless Manoeuvres',
        description: 'Dont pick this.',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick a friendly Vanguard Chamber unit that is not in combat.',
          effect: 'Roll a dice. On a 3+, remove that unit from the battlefield and set it up again anywhere on the battlefield more than 9" from all enemy units.'
        },
        phaseActivation: BattlePhase.MOVEMENT,
        phaseActivationTiming: 'own',
        numberOfTimes: 'perRound',
        armyWide: true
      },
      ],
    },
    {
      name: 'Lightning Echelon',
      description: 'Dont pick this.',
      actions: [{
        name: 'Oncoming Storm',
        description: 'Dont pick this.',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick a friendly Extremis Chamber unit that has charged this turn.',
          effect: 'Roll a dice. On a 3+, that unit has Strike-First for the rest of the turn.'
        },
        phaseActivation: BattlePhase.ATTACK,
        phaseActivationTiming: 'any',
        numberOfTimes: 'perRound',
        armyWide: true
      },
      ],
    },
  ],
  heroicTraits: [
    {
      name: 'Staunch Defender',
      description: 'Buff allied control score.',
      actions: [{
        name: 'Staunch Defender',
        description: 'Buff allied control score.',
        actionDetails: {
          actionType: 'passive',
          effect: 'While this unit is contesting an objective in friendly territory, add 3 to the control scores of all friendly Stormcast Eternals units contesting that objective.'
        },
        phaseActivation: BattlePhase.END,
        phaseActivationTiming: 'any',
        numberOfTimes: 'unlimited'
      },
      ],
    },
    {
      name: 'Shock and Awe',
      description: 'Dont pick this?.',
      actions: [{
        name: 'Shock and Awe',
        description: 'Dont pick this?',
        actionDetails: {
          actionType: 'passive',
          effect: 'Each time a friendly Stormcast Eternals unit is set up wholly within 12" of this unit using the \'Scions of the Storm\' ability, subtract 1 from hit rolls for attacks that target that unit for the rest of the battle round.'
        },
        phaseActivation: BattlePhase.ATTACK,
        phaseActivationTiming: 'any',
        numberOfTimes: 'unlimited'
      },
      ],
    },
    {
      name: 'Envoy of the Heavens',
      description: 'Buff ally after ally dies.',
      actions: [{
        name: 'Envoy of the Heavens',
        description: 'Buff ally after ally dies.',
        actionDetails: {
          actionType: 'activated',
          declare: 'If a friendly unit was destroyed in the previous turn, pick a visible friendly Stormcast Eternals unit wholly within 12" of this unit to be the target',
          effect: 'The target has Ward (5+) until the start of your next turn'
        },
        phaseActivation: BattlePhase.HERO,
        phaseActivationTiming: 'own',
        numberOfTimes: 'unlimited'
      },
      ],
    },
  ],
  artifactsOfPower: [
    {
      name: 'Null Pendant',
      description: 'Debuff control score of opponent.',
      actions: [{
        name: 'Null Pendant',
        description: 'Buff ally after ally dies.',
        actionDetails: {
          actionType: 'activated',
          declare: 'Once per battle, pick an enemy unit in combat with this unit to be the target',
          effect: 'Subtract 5 from the target\'s control score for the rest of the turn'
        },
        phaseActivation: BattlePhase.END,
        phaseActivationTiming: 'any',
        numberOfTimes: 'once'
      },
      ],
    },
    {
      name: 'Quicksilver Draught',
      description: 'Buff unit once.',
      actions: [{
        name: 'Quicksilver Draught',
        description: 'Artifact of Power',
        actionDetails: {
          actionType: 'activated',
          declare: 'Once per Battle.',
          effect: 'This unit has Strike-First for the rest of the turn.'
        },
        phaseActivation: BattlePhase.ATTACK,
        phaseActivationTiming: 'any',
        numberOfTimes: 'once',
      }],
    },
    {
      name: 'Mirrorshield',
      description: 'Against shooting attacks.',
      actions: [{
        name: 'Mirrorshield',
        description: 'Artifact of Power',
        actionDetails: {
          actionType: 'passive',
          effect: 'This unit cannot be targeted by shooting attacks unless the attacking model is within 9" of it.'
        },
        phaseActivation: BattlePhase.SHOOTING,
        phaseActivationTiming: 'any',
        numberOfTimes: 'unlimited',
      }],
    },
  ],
  spellLore: [
    {
      name: 'Lore of the Storm',
      description: 'Harness Sigmar\'s lightning to smite the enemy.',
      actions: [
        {
          name: 'Lightning Blast',
          description: 'Spell Lore: Deal damage to closest enemy',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Wizard to cast this spell, then pick the closest visible enemy unit to them that has not been picked to be the target of this ability this turn to be the target. If 2 or more visible enemy units are tied to be the closest, you can pick which is the target. Then, make a casting roll of 2D6.',
            effect: 'Inflict D3 mortal damage on the target.'
          },
          castingValue: 5,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Thundershock',
          description: 'Spell Lore: Debuff enemies attacks',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Wizard to cast this spell, pick a visible enemy unit within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Subtract 1 from wound rolls for the target\'s attacks until the start of your next turn.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Starfall',
          description: 'Spell Lore: Reduce number of charge rolls of enemy',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Wizard to cast this spell, pick a visible enemy Infantry or Cavalry unit within 18" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Until the start of your next turn, subtract 1 from the number of dice rolled when making charge rolls for the target, to a minimum of 1.'
          },
          castingValue: 7,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        }
      ],
    },
  ],
  prayerLore: [
    {
      name: 'Prayers of the Stormhost',
      description: '',
      actions: [
        {
          name: 'Healing Storm',
          description: 'Prayer Lore: Heal one unit (+ heal everyone if crit)',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Priest to chant this prayer, pick a visible friendly Stormcast Eternal unit wholly within 12" of them to be the target, then make a chanting roll of D6',
            effect: 'Heal (D3) the target. If the chanting roll was 8+, Heal (D3) each visible friendly Stormcast Eternal unit wholly within 12" of the chanter instead.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Bless Weapons',
          description: 'Prayer Lore: Buff one units attack (+ everyone if crit)',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly priest to chant this prayer, pick a visible friendly Stormcast Eternal Infantry unit wholly within 12" of them to be the target, then make a chanting roll of D6.',
            effect: 'Add 1 to the Attacks characteristic of the target\'s melee weapons until the start of your next turn. If the chanting roll was 12+, this ability affects all visible friendly Stormcast Eternals units wholly within 12" of the chanter.'
          },
          chantingValue: 6,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Translocation',
          description: 'Prayer Lore: Teleport one unit (+ buff defense if crit)',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly priest to chant this prayer, pick a visible friendly Stormcast Eternal unit wholly within 12" of them to be the target, then make a chanting roll of D6.',
            effect: 'Remove the target from the battlefield and set it up again on the battlefield more than 9" from all enemy units. In addition, if the chanting roll was 8+, subtract 1 from hit rolls for attacks that target that unit for the rest of the battle round.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        }
      ],
    },
  ],
};

const SKAVEN_OPTIONS: ArmyOptions = {
  battleTraits: [
    {
      name: 'Skaven Battle Traits',
      description: 'The cunning and treacherous abilities available to all Skaven armies.',
      actions: [
        {
          name: 'The Lurking Vermintide',
          description: 'Battle Trait — Deployment Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven unit that has not been deployed.',
            effect: 'Set up that unit in reserve in the tunnels below. It has now been deployed.'
          },
          phaseActivation: BattlePhase.DEPLOYMENT, phaseActivationTiming: 'own', numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Gnawhole Ambush',
          description: 'Battle Trait — Your Movement Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven unit that is in the tunnels below to use this ability.',
            effect: 'Set up that unit wholly within 6" of a friendly Gnawhole and more than 9" from all enemy units.'
          },
          phaseActivation: BattlePhase.MOVEMENT, phaseActivationTiming: 'own', numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Splinters of the Vermindoom',
          description: 'Battle Trait — Once Per Battle Round (Army), Start of Battle Round',
          actionDetails: {
            actionType: 'activated',
            declare: 'You can use this ability if there are fewer than 3 friendly Gnawholes on the battlefield.',
            effect: 'Set up a Gnawhole on the battlefield more than 9" from all enemy units, more than 1" from all friendly units and more than 3" from all objectives and other terrain features.'
          },
          phaseActivation: BattlePhase.START, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
          armyWide: true,
        },
        {
          name: 'Always Three Clawsteps Ahead',
          description: 'Battle Trait — Once Per Turn (Army), Enemy Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly non-Monster Skaven unit that is not in combat and was not set up this turn to use this ability.',
            effect: 'That unit can use the \'Normal Move\' ability as if it were your movement phase.'
          },
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'opponent', numberOfTimes: 'perRound',
          armyWide: true,
        },
        {
          name: 'Too Quick to Hit-Hit',
          description: 'Battle Trait — Passive',
          actionDetails: {
            actionType: 'passive',
            effect: 'No mortal damage is inflicted on friendly Skaven Infantry and Cavalry units by Retreat abilities.'
          },
          phaseActivation: BattlePhase.MOVEMENT, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
          unitFilter: ['Infantry', 'Cavalry'],
        },
      ],
    },
  ],
  battleFormations: [
    {
      name: 'Warpcog Convocation',
      description: 'The fell contraptions wielded by these ratmen were created by the Clans Skryre\'s most ingenious weaponsmiths.',
      actions: [{
        name: 'Skryre Prototypes',
        description: 'Battle Formation: Warpcog Convocation — Once Per Turn (Army), Your Shooting Phase',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick up to 3 friendly Skryre units to be the targets.',
          effect: 'Roll a dice for each target and apply the corresponding effect: 1 — Kaboom!: Inflict D3 mortal damage on the target. 2-5 — More Power!: Add 1 to wound rolls for the target\'s shooting attacks for the rest of the turn. 6 — More-more Power!: In addition to the effect of \'More Power!\', add 1 to the Rend characteristic of the target\'s ranged weapons for the rest of the turn.'
        },
        phaseActivation: BattlePhase.SHOOTING, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        armyWide: true,
      }],
    },
    {
      name: 'Fleshmeld Menagerie',
      description: 'Moulder warbeasts are studded with warpstone crystals and pumped full of vile serums that spur their battle-rage — at the occasional cost of overtaxing their forms.',
      actions: [{
        name: 'Prized Creations',
        description: 'Battle Formation: Fleshmeld Menagerie — Once Per Turn (Army), Your Hero Phase',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick up to 3 friendly non-Hero Moulder units to be the targets.',
          effect: 'Roll a dice for each target and apply the corresponding effect: 1-2 — Self-destructive Fury: Inflict D3 mortal damage on the target. 3-4 — Rabid Infusion: Add 1 to the Attacks characteristic of the target\'s melee weapons until the start of your next turn. 5-6 — Blinded by Frenzy: In addition to the effect of \'Rabid Infusion\', the target has Ward (5+) until the start of your next turn.'
        },
        phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        armyWide: true,
      }],
    },
    {
      name: 'Virulent Procession',
      description: 'The Clans Pestilens are relentless in advancing the spread of plague and corruption.',
      actions: [{
        name: 'Corrupted Earth',
        description: 'Battle Formation: Virulent Procession — Once Per Turn (Army), End of Any Turn',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick up to 3 friendly Pestilens units to be the targets.',
          effect: 'For each target: Make a pile-in move. Then, pick an enemy unit in combat with the target and roll a D3. On a 2+, inflict an amount of mortal damage on that enemy unit equal to the roll.'
        },
        phaseActivation: BattlePhase.END, phaseActivationTiming: 'any', numberOfTimes: 'perRound',
        armyWide: true,
      }],
    },
    {
      name: 'Claw-Horde',
      description: 'The Stormvermin and Clanrats of a Verminus Claw-horde are amongst the most ferocious of all ratmen.',
      actions: [{
        name: 'Claw-Picked',
        description: 'Battle Formation: Claw-Horde — Once Per Turn (Army), Your Combat Phase',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick up to 3 friendly Verminus units that charged this turn to be the targets.',
          effect: 'Add 1 to the Rend characteristic of the targets\' melee weapons for the rest of the turn.'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        armyWide: true,
      }],
    },
  ],
  heroicTraits: [
    {
      name: 'Cunning Deceiver',
      description: 'This hero is a master of treachery.',
      actions: [{
        name: 'Cunning Deceiver',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick this unit after it is targeted by an attack.',
          effect: 'Pick a friendly unit within 3" of this unit. That unit becomes the target instead.'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'opponent', numberOfTimes: 'once',
      }],
    },
    {
      name: 'Verminous Valour',
      description: 'This hero uses underlings as living shields.',
      actions: [{
        name: 'Verminous Valour',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'passive',
          effect: 'Roll a dice each time this unit would be allocated a wound or mortal wound while within 3" of a friendly Skaven unit with 3+ models. On a 4+, that wound is allocated to that unit instead.'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
  ],
  artifactsOfPower: [
    {
      name: 'Foulhide',
      description: 'Fashioned from the flensed flesh of Rat Ogors and soaked in cloying alchemical agents, this stinking armour regrows as fast as it can be hacked apart.',
      actions: [{
        name: 'Foulhide',
        description: 'Artifact of Power — End of Any Turn',
        actionDetails: {actionType: 'passive', effect: 'Heal (D3) this unit.'},
        phaseActivation: BattlePhase.END, phaseActivationTiming: 'any', numberOfTimes: 'perRound',
      }],
    },
    {
      name: 'Warpstone Charm',
      description: 'This foul talisman radiates mutating energy that can be directed at an enemy unit to erode their armour.',
      actions: [{
        name: 'Warpstone Charm',
        description: 'Artifact of Power — Any Combat Phase',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick an enemy unit in combat with this unit to be the target.',
          effect: 'Roll a dice. On a 3+, subtract 1 from save rolls for the target for the rest of the turn.'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'any', numberOfTimes: 'perRound',
      }],
    },
    {
      name: 'Skavenbrew',
      description: 'This foul concoction, brewed from blood and warpstone, is dispensed to expendable underlings to drive them into a devastating killing frenzy.',
      actions: [{
        name: 'Skavenbrew',
        description: 'Artifact of Power — Once Per Battle, Any Combat Phase',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick a friendly non-Hero Skaven Infantry unit wholly within 13" of this unit to be the target.',
          effect: 'Inflict D3 mortal damage on the target. Then, add 1 to the Attacks characteristic of the target\'s melee weapons for the rest of the turn.'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'any', numberOfTimes: 'once',
      }],
    },
  ],
  spellLore: [
    {
      name: 'Lore of Ruin',
      description: 'Dark sorceries channelled through the malevolent will of Skaven Wizards.',
      actions: [
        {
          name: 'Wither',
          description: 'Spell — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Wizard to cast this spell, pick a visible enemy unit within 13" to be the target, then make a casting roll of 2D6.',
            effect: 'Inflict D3 mortal damage on the target.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'unlimited',
        },
        {
          name: 'Skitterleap',
          description: 'Spell — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Wizard to cast this spell, pick a visible friendly Skaven Hero wholly within 13" to be the target, then make a casting roll of 2D6.',
            effect: 'Remove the target from the battlefield and set it up again on the battlefield more than 9" from all enemy units.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Warpgale',
          description: 'Spell — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Wizard to cast this spell, pick a visible enemy unit within 18" to be the target, then make a casting roll of 2D6.',
            effect: 'The target has Strike-last for the rest of the turn.'
          },
          castingValue: 7,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
      ],
    },
  ],
  prayerLore: [
    {
      name: 'Noxious Prayers',
      description: 'Dark invocations to the Great Horned Rat, granting blessings of filth, bile, and unnatural resilience.',
      actions: [
        {
          name: 'Filth-Crust',
          description: 'Prayer — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Priest to chant this prayer, pick a visible friendly Skaven Infantry unit wholly within 13" to be the target, then make a chanting roll of D6.',
            effect: 'Add 1 to wound rolls for the target\'s combat attacks until the start of your next turn. In addition, if the chanting roll was 8+, the target\'s melee weapons have Crit (Mortal) until the start of your next turn.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'unlimited',
        },
        {
          name: 'Bile-Torrent',
          description: 'Prayer — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Priest to chant this prayer, pick a visible enemy unit within 13" to be the target, then make a chanting roll of D6.',
            effect: 'Roll a number of dice equal to the number of models in the target unit. For each 5+, inflict 1 mortal damage on the target. If the chanting roll was 8+, inflict 1 mortal damage on the target for each 4+ instead.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Rabid-Tough',
          description: 'Prayer — Your Hero Phase',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Skaven Priest to chant this prayer, pick a visible friendly Skaven Infantry unit wholly within 13" to be the target, then make a chanting roll of D6.',
            effect: 'Subtract 1 from wound rolls for attacks that target that unit until the start of your next turn. In addition, if the chanting roll was 8+, add 1 to save rolls for the target until the start of your next turn.'
          },
          chantingValue: 5,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
      ],
    },
  ],
};

const DAUGHTERS_OPTIONS: ArmyOptions = {
  battleTraits: [
    {
      name: 'All-out Slaughter',
      description: '',
      actions: [
        {
          name: 'All-out Slaughter',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Infantry unit that is in combat to use this ability.',
            effect: 'That unit can use 2 Fight abilities this phase. After the first is used, this unit has Strike-last for the rest of the turn.'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'once',
          armyWide: true,
          commandPointCost: 1
        },
        {
          name: 'Blood Rites',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'A different effect applies to friendly DoK units each battle round, as shown below. The effects of all previous battle rounds also apply to those units.'
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Blood Rites: 1',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to run rolls for all DoK units'
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Blood Rites: 2',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to charge rolls for all DoK units'
          },
          phaseActivation: BattlePhase.CHARGE,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Blood Rites: 3',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to hit rolls for all DoK units'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Blood Rites: 4',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to wound rolls for all DoK units'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Blood Rites: 5',
          description: 'Battle Trait: Daughters of Khaine',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 1 to the Attacks characteristic of all DoK units melee weapons'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        }
      ],
    },
  ],
  battleFormations: [
    {
      name: 'Scathcoven',
      description: '',
      actions: [{
        name: 'Speed of the Scathborn',
        description: 'Battle Formation: Scathcoven',
        actionDetails: {
          actionType: 'passive',
          effect: 'If the unmodified charge roll for a friendly Melusai or Khinerai unit is 8+, that unit has Strike-First for the rest of the turn.'
        },
        phaseActivation: BattlePhase.CHARGE,
        phaseActivationTiming: 'any',
        numberOfTimes: 'unlimited',
        armyWide: true,
      }],
    },
    {
      name: 'Shadow Patrol',
      description: '',
      actions: [{
        name: 'Shadowpaths',
        description: 'Battle Formation: Shadow Patrol',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick a friendly DoK infantry unit that is not in combat to use this ability.',
          effect: 'Roll a dice. On a 3+, remove that unit from the battlefield and set it up again on the battlefield more than 9" from all enemy units.'
        },
        phaseActivation: BattlePhase.MOVEMENT,
        phaseActivationTiming: 'own',
        numberOfTimes: 'perRound',
        linkedGroup: 'Shadowpaths',
        armyWide: true,
      }],
    },
    {
      name: 'Cauldron Guard',
      description: '',
      actions: [{
        name: 'Frenzied Devotees',
        description: 'Battle Formation: Cauldron Guard',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick up to 3 friendly DoK Infantry or War Machine units that are in combat to be the targets.',
          effect: 'For each target: Make a pile-in move. Then, pick an enemy unit in combat with the target and roll a D3. On a 2+, inflict an amount of mortal damage on that enemy unit equal to the roll.'
        },
        phaseActivation: BattlePhase.END,
        phaseActivationTiming: 'any',
        numberOfTimes: 'perRound',
        linkedGroup: 'Frenzied Devotees',
        armyWide: true,
      }],
    },
    {
      name: 'Slaughter Troupe',
      description: '',
      actions: [{
        name: 'Gladiatorial Acrobatics',
        description: 'Battle Formation: Slaughter Troupe',
        actionDetails: {
          actionType: 'activated',
          declare: 'Reaction: You declared a Charge ability for a friendly DoK Aelf unit',
          effect: 'Change one of the dice in the charge roll to a 4'
        },
        phaseActivation: BattlePhase.CHARGE,
        phaseActivationTiming: 'any',
        numberOfTimes: 'perRound',
        linkedGroup: 'Gladiatorial Acrobatics',
        armyWide: true,
      }],
    },
  ],
  heroicTraits: [
    {
      name: 'Master of Poisons',
      description: '',
      actions: [{
        name: 'Master of Poisons',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick an enemy unit that had any damage points allocated to it this turn by this unit\'s combat attacks to be the target.',
          effect: 'For the rest of the battle: The target cannot be healed. Slain models cannot be returned to the target unit.'
        },
        phaseActivation: BattlePhase.END, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
    {
      name: 'Bathed in Blood',
      description: '',
      actions: [{
        name: 'Bathed in Blood',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'activated',
          declare: '',
          effect: 'Heal (3) this unit if it is in combat.'
        },
        phaseActivation: BattlePhase.END, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
    {
      name: 'Zealous Orator',
      description: '',
      actions: [{
        name: 'Zealous Orator',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'passive',
          effect: 'If a friendly unit wholly within 12" of this unit uses the \'Rally\' command, you can make 3 additional rally rolls of D6.'
        },
        phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
  ],
  artifactsOfPower: [
    {
      name: 'Khainite Pendant',
      description: '',
      actions: [{
        name: 'Khainite Pendant',
        description: '',
        actionDetails: {
          actionType: 'activated',
          declare: 'Pick a friendly DoK Priest wholly within 12" of this unit.',
          effect: 'Give that unit D6 ritual points.'
        },
        phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'once',
      }],
    },
    {
      name: 'Sevenfold Shadows',
      description: '',
      actions: [{
        name: 'Sevenfold Shadows',
        description: '',
        actionDetails: {
          actionType: 'activated',
          declare: '',
          effect: 'If this unit is not in combat, remove it from the battlefield and set it up again on the battlefield more than 9" from all enemy units.'
        },
        phaseActivation: BattlePhase.MOVEMENT, phaseActivationTiming: 'own', numberOfTimes: 'once',
      }],
    },
    {
      name: 'Crown of Woe',
      description: '',
      actions: [{
        name: 'Crown of Woe',
        description: '',
        actionDetails: {
          actionType: 'passive',
          effect: 'Subtract 2 from the control scores of enemy units while they are within 9" of this unit.'
        },
        phaseActivation: BattlePhase.END, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
  ],
  spellLore: [
    {
      name: 'Lore of Shadows',
      description: '',
      actions: [
        {
          name: 'Steed of Shadows',
          description: 'Spell Lore: Lore of Shadows',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Wizard to cast this spell, pick a visible friendly DoK unit wholly within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'The target can use Charge abilities this turn even if it used a Run ability in the same turn.'
          },
          castingValue: 5,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Doomfire',
          description: 'Spell Lore: Lore of Shadows',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Wizard to cast this spell, pick a visible enemy unit within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'If the target unit has fewer than 10 models, inflict D3 mortal damage on the target. If the target unit has 10-19 models, inflict D6 mortal damage on the target. If the target unit has 10-19 models, inflict D6 mortal damage on the target. If the target unit has 20 or more models, inflict 6 mortal damage on the target.'
          },
          castingValue: 7,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Mindrazor',
          description: 'Spell Lore: Lore of Shadows',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Wizard to cast this spell, pick a visible friendly DoK unit wholly within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Add 1 to the Rend characteristics of the target\'s melee weapons until the start of your next turn. In addition, if the target charged this turn, add 1 to the Damage characteristic of its melee weapons until the start of your next turn.'
          },
          castingValue: 7,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        }
      ],
    },
  ],
  prayerLore: [
    {
      name: 'Prayers of the Khainite Cult',
      description: '',
      actions: [
        {
          name: 'Sacrament of Blood',
          description: 'Prayer Lore: Prayers of the Khainite Cult',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Priest to chant this prayer, pick a visible friendly DoK unit wholly within 12" of them to be the target, then make a chanting roll of D6.',
            effect: 'Until the start of your next turn, add 1 to the current battle round number when determining which effects of the \'Blood Rites\' ability apply to the target. If the chanting roll was 10+, until the start of your next turn, treat the current battle round number as 5 when determining which effects of the \'Blood Rites\' ability apply to the target instead.'
          },
          chantingValue: 5,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Martyr\'s Sacrifice',
          description: 'Prayer Lore: Prayers of the Khainite Cult',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Priest to chant this prayer, pick a visible friendly DoK unit wholly within 12" of them to be the target, then make a chanting roll of D6.',
            effect: 'Until the start of your next turn, each time a model in the target unit is slain by a combat attack, before removing the model from play, pick an enemy unit in combat with the target and roll a dice. If the chanting roll was 8+, roll 2 dice instead of 1. For each 5+, inflict 1 mortal damage on that enemy unit after the Fight ability has been resolved.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        },
        {
          name: 'Covenant of the Iron Heart',
          description: 'Prayer Lore: Prayers of the Khainite Cult',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly DoK Priest to chant this prayer, pick a visible friendly DoK unit wholly within 12" of them to be the target, then make a chanting roll of D6.',
            effect: 'Ignore negative modifiers to the target\'s control score until the start of your next turn. In addition, if the chanting roll was 8+, add 5 to the target\'s control score until the start of your next turn.'
          },
          chantingValue: 4,
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
        }
      ],
    },
  ],
};

const SERAPHON_OPTIONS: ArmyOptions = {
  battleTraits: [
    {
      name: 'The Great Plan',
      description: 'Choose a cosmic power.',
      actions: [
        {
          name: 'The Great Plan',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick an Asterism ability',
            effect: 'That Asterism ability can be used for the rest of the battle, but the others cannot, unless allowed by the \'Further the Great Plan\' ability.'
          },
          phaseActivation: BattlePhase.DEPLOYMENT,
          phaseActivationTiming: 'any',
          numberOfTimes: 'once',
          armyWide: true
        },
        {
          name: 'Further the Great Plan',
          description: '',
          actionDetails: {
            actionType: 'activated',
            declare: 'Start of the third battle round. You can use this if you meet the condition that corresponds to the Asterism you picked in the deployment phase.',
            effect: 'Pick a different Asterism ability. It can be used in addition to the one you picked in the deployment phase.'
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'once',
          armyWide: true,
        },
        {
          name: 'Itzl the Tamer',
          description: 'Only active if chosen by the Great Plan.',
          actionDetails: {
            actionType: 'passive',
            effect: 'Companion weapons used by friendly Serapahon units have Crit (2 Hits).'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Quetzl the Preserver',
          description: 'Only active if chosen by the Great Plan.',
          actionDetails: {
            actionType: 'activated',
            declare: '',
            effect: 'Subtract 1 from the Rend characteristics of melee weapons for attacks that target friendly Seraphon units that are wholly within friendly territory.'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Sotek the deliverer',
          description: 'Only active if chosen by the Great Plan.',
          actionDetails: {
            actionType: 'activated',
            declare: '',
            effect: 'Add 2 to the move characteristics of Seraphon units.'
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
        {
          name: 'Tepok the Seer',
          description: 'Only active if chosen by the Great Plan.',
          actionDetails: {
            actionType: 'activated',
            declare: '',
            effect: 'Add 1 to the casting rolls for friendly Seraphon units.'
          },
          phaseActivation: BattlePhase.HERO,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        },
      ],
    },
  ],
  battleFormations: [
    {
      name: 'Eternal Starhost',
      description: 'Teleport.',
      actions: [
        {
          name: 'Celestial Translocation',
          description: 'Battle Formation',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon unit wholly within 12" of a friendly Seraphon Wizard to use this ability',
            effect: 'Roll a dice. On a 3+, remove that unit from the battlefield and set it up again on the battlefield more than 9" from all enemy units.'
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
          armyWide: true,
        }
      ],
    },
    {
      name: 'Shadowstrike Starhost',
      description: 'Dont pick this.',
      actions: [
        {
          name: 'Nimble and Quick',
          description: 'Battle Formation',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick up to 3 friendly Skink Infantry or Skink Cavalry units that are not in combat to be the targets',
            effect: 'Each target can move D6". Each target cannot move into combat during any part of the move.'
          },
          phaseActivation: BattlePhase.SHOOTING,
          phaseActivationTiming: 'own',
          numberOfTimes: 'perRound',
          armyWide: true,
        }
      ],
    },
    {
      name: 'Sunclaw Starhost',
      description: 'Applies to Aggradon Lancers and Kroxigors in battle.',
      actions: [
        {
          name: 'Vengeance of Azyr',
          description: 'Battle Formation',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick up to 3 friendly Saurus or Kroxigor units that are in combat to be the targets',
            effect: 'For each target: Make a pile-in move. Then, pick an enemy units in combat with the target and roll a D3. On a 2+, inflict an amount of mortal damage on that enemy unit equal to the roll.'
          },
          phaseActivation: BattlePhase.END,
          phaseActivationTiming: 'any',
          numberOfTimes: 'perRound',
          armyWide: true,
        }
      ],
    },
    {
      name: 'Thunderquake Starhost',
      description: 'Dont pick this.',
      actions: [
        {
          name: 'Scaly Monstrosities',
          description: 'Battle Formation',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 2 to the Health characteristic of friendly Seraphon Monster units.'
          },
          phaseActivation: BattlePhase.START,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
          armyWide: true,
        }
      ],
    },
  ],
  heroicTraits: [
    {
      name: 'Being of the Stars',
      description: '',
      actions: [{
        name: 'Being of the Stars',
        description: 'Heroic Trait',
        actionDetails: {
          actionType: 'passive',
          effect: 'Ignore modifiers to save rolls for this unit (postive and negatives).'
        },
        phaseActivation: BattlePhase.ATTACK,
        phaseActivationTiming: 'any',
        numberOfTimes: 'unlimited',
      }],
    },
    {
      name: 'Reptilian Cunning',
      description: '',
      actions: [
        {
          name: 'Reptilian Cunning',
          description: 'Heroic Trait',
          actionDetails: {
            actionType: 'passive',
            effect: 'If this unit charged this turn, if a friendly unit wholly within 12" of this unit uses the \'All-out Attack\' command in the combat phase, no command points are spent.'
          },
          phaseActivation: BattlePhase.ATTACK,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        }
      ],
    },
    {
      name: 'Beastmaster',
      description: '',
      actions: [
        {
          name: 'Beastmaster',
          description: 'Heroic Trait',
          actionDetails: {
            actionType: 'passive',
            effect: 'Add 2" to the Move characteristics of friendly Seraphon Cavalry and Seraphon Monster units for the rest of the phase if they are wholly within 12" of this unit at the start of the move.'
          },
          phaseActivation: BattlePhase.MOVEMENT,
          phaseActivationTiming: 'any',
          numberOfTimes: 'unlimited',
        }
      ],
    },
  ],
  artifactsOfPower: [
    {
      name: 'Coatl Familiar',
      description: '',
      actions: [{
        name: 'Coatl Familiar',
        description: 'Artifact of Power',
        actionDetails: {
          actionType: 'activated',
          declare: 'Reaction: You declared a Spell ability for a friendly Seraphon Wizard within this unit\'s combat range.',
          effect: 'Add D6 to the casting roll for that spell.'
        },
        phaseActivation: BattlePhase.HERO,
        phaseActivationTiming: 'any',
        numberOfTimes: 'once',
      }],
    },
    {
      name: 'Incadescent Rectrices',
      description: '',
      actions: [{
        name: 'Incadescent Rectrices',
        description: 'Artifact of Power',
        actionDetails: {
          actionType: 'activated',
          declare: '',
          effect: 'Heal (D3) this unit.'
        },
        phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'any', numberOfTimes: 'perRound',
      }],
    },
    {
      name: 'Bloodrage Pendant',
      description: '',
      actions: [{
        name: 'Bloodrage Pendant',
        description: 'Artifact of Power',
        actionDetails: {
          actionType: 'passive',
          effect: 'Add 1 to the attacks characteristics of this unit\'s melee weapons. Add 2 instead if the number of damage points allocated to this unit is equal to or greater than half of this unit\'s Health characteristic (rounding up).'
        },
        phaseActivation: BattlePhase.ATTACK, phaseActivationTiming: 'any', numberOfTimes: 'unlimited',
      }],
    },
  ],
  spellLore: [
    {
      name: 'Lore of Celestial Manipulation',
      description: '',
      actions: [
        {
          name: 'Mystical Unforging',
          description: 'Spell Lore: Debuff rend of enemy unit',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a visible enemy unit within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Subtract 1 from the Rend characteristics of the target\'s weapons until the start of your next turn.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Comet\'s Call',
          description: 'Spell Lore: Do damage to enemy, scaling with number of models in their unit',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a visible enemy unit within 18" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Roll a dice for each model in the target unit. For each 5+, inflict 1 mortal damage on the target.'
          },
          castingValue: 7,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Speed of Huanchi',
          description: 'Spell Lore: Let a unit Run and still shoot/charge',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a visible friendly Seraphon unit wholly within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Until the start of your next turn, the target can use a Run ability and still use Shoot and/or Charge abilities later in the turn.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        }
      ],
    },
    {
      name: 'Lore of Primal Jungles',
      description: '',
      actions: [
        {
          name: 'Light of Chotec',
          description: 'Spell Lore: Heal unit',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a visible friendly Seraphon unit wholly within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Roll a number of dice equal to the number of damage points the target has. For each 4+, Heal (1) the target.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'The Earth Trembles',
          description: 'Spell Lore: Deal damage to everything in a line',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a point on the battlefield within 18" of them to be the target point, then make a casting roll of 2D6.',
            effect: 'Draw a straight line between the target point and the closest part on the caster\'s base. Roll a D3 for each unit (friendly and enemy) that has models passed across by this line. On a 2+, inflict an amount of mortal damage on that unit equal to the roll.'
          },
          castingValue: 8,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
        {
          name: 'Empowered Celestite',
          description: 'Spell Lore: Buff a unit\'s rend',
          actionDetails: {
            actionType: 'activated',
            declare: 'Pick a friendly Seraphon Wizard to cast this spell, pick a visible friendly Seraphon unit wholly within 12" of them to be the target, then make a casting roll of 2D6.',
            effect: 'Add 1 to the Rend characteristic of the target\'s melee weapons for the rest of the turn.'
          },
          castingValue: 6,
          phaseActivation: BattlePhase.HERO, phaseActivationTiming: 'own', numberOfTimes: 'perRound',
        },
      ],
    },
  ],
  prayerLore: [],
};

STORMCAST_ARMY.armyOptions = STORMCAST_OPTIONS;
SKAVEN_ARMY.armyOptions = SKAVEN_OPTIONS;
DAUGHTERS_ARMY.armyOptions = DAUGHTERS_OPTIONS;
SERAPHON_ARMY.armyOptions = SERAPHON_OPTIONS;

const ALL_ARMIES: Army[] = [STORMCAST_ARMY, SKAVEN_ARMY, DAUGHTERS_ARMY, SERAPHON_ARMY].map(withCoreAbilities);

@Component({
  selector: 'app-home',
  imports: [FactionSelectComponent, ArmySetupComponent, ActionCardComponent, UnitDetailsComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  readonly availableArmies = ALL_ARMIES;
  army: Army | null = null;
  setupArmy: Army | null = null;
  readonly turnPhases = TURN_PHASES;

  battleRound = 1;
  commandPoints = 0;
  stage: RoundStage = {type: 'deployment'};
  firstTurnIsOwn = true;

  private usedOnce = new Set<string>();
  private usedThisTurn = new Set<string>();
  /** Maps command name → unit name (each command used once per army per phase) */
  private commandUsedBy = new Map<string, string>();
  /** Maps unit name → command name (each unit can use 1 command per phase) */
  private unitCommandUsed = new Map<string, string>();
  warscrollUnit: Unit | null = null;
  activeAsterisms = new Set<string>();

  @ViewChild('phaseBar') private phaseBarRef?: ElementRef<HTMLDivElement>;
  phaseBarOverflowLeft = false;
  phaseBarOverflowRight = false;

  ngAfterViewInit(): void {
    this.updatePhaseBarOverflow();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updatePhaseBarOverflow();
  }

  get isSelectingArmy(): boolean {
    return this.army === null && this.setupArmy === null;
  }

  get isSettingUp(): boolean {
    return this.setupArmy !== null && this.army === null;
  }

  selectArmy(army: Army): void {
    this.setupArmy = army;
  }

  cancelSetup(): void {
    this.setupArmy = null;
  }

  completeSetup(selections: ArmySelections): void {
    const base = this.setupArmy!;
    const generalActions: BattleAction[] = [
      selections.battleTrait,
      selections.battleFormation,
    ].filter(Boolean).flatMap(choice => choice!.actions);

    const heroicTraitActions = selections.heroicTrait?.actions ?? [];
    const heroicTraitBearer = selections.heroicTraitBearer;

    const artifactActions = selections.artifactOfPower?.actions ?? [];
    const artifactBearer = selections.artifactOfPowerBearer;

    const spellActions = selections.spellLore?.actions ?? [];
    const prayerActions = selections.prayerLore?.actions ?? [];

    this.army = {
      ...base,
      units: base.units.map(unit => ({
        ...unit,
        actions: [
          ...unit.actions,
          ...generalActions.filter(a => !a.unitFilter || a.unitFilter.some(kw => unit.keywords.includes(kw))),
          ...(unit.name === heroicTraitBearer ? heroicTraitActions : []),
          ...(unit.name === artifactBearer ? artifactActions : []),
          ...(unitIsWizard(unit) ? spellActions : []),
          ...(unitIsPriest(unit) ? prayerActions : []),
        ],
      })),
    };
    this.setupArmy = null;
    setTimeout(() => this.updatePhaseBarOverflow());
  }

  openWarscroll(unit: Unit): void {
    this.warscrollUnit = unit;
  }

  closeWarscroll(): void {
    this.warscrollUnit = null;
  }

  /** True when user needs to pick who has priority */
  get isPicking(): boolean {
    return this.stage.type === 'start';
  }

  get isOwnTurn(): boolean {
    if (this.stage.type !== 'turn') return false;
    const isFirstPlayer = this.stage.playerIndex === 0;
    return isFirstPlayer ? this.firstTurnIsOwn : !this.firstTurnIsOwn;
  }

  get currentPhaseLabel(): string {
    if (this.stage.type === 'deployment') return 'Deployment Phase';
    if (this.stage.type === 'start' || this.stage.type === 'startActions') return 'Start of Battle Round';
    if (this.stage.type === 'end') return 'Battle Round Complete';
    return TURN_PHASES[this.stage.phaseIndex].label;
  }

  get currentPhase(): BattlePhase {
    if (this.stage.type === 'deployment') return BattlePhase.DEPLOYMENT;
    if (this.stage.type === 'start' || this.stage.type === 'startActions') return BattlePhase.START;
    if (this.stage.type === 'end') return BattlePhase.END;
    return TURN_PHASES[this.stage.phaseIndex].phase;
  }

  get turnOwnerLabel(): string {
    if (this.stage.type !== 'turn') return '';
    return this.isOwnTurn ? '⚔ Your Turn' : "🛡 Opponent's Turn";
  }

  get playerLabel(): string {
    if (this.stage.type !== 'turn') return '';
    return this.isOwnTurn ? 'Your Turn' : "Opponent's Turn";
  }

  get asterismPickerMode(): 'great-plan' | 'further' | null {
    if (!this.army) return null;
    const hasGreatPlan = this.army.units[0]?.actions.some(a => a.name === 'The Great Plan');
    if (!hasGreatPlan) return null;
    if (this.stage.type === 'deployment' && this.activeAsterisms.size === 0) return 'great-plan';
    if (this.stage.type === 'startActions' && this.battleRound >= 3 && this.activeAsterisms.size === 1) return 'further';
    return null;
  }

  get availableAsterisms(): { name: string; effect: string }[] {
    if (!this.army) return [];
    const actions = this.army.units[0]?.actions ?? [];
    return actions
      .filter(a => ASTERISM_NAMES.has(a.name) && !this.activeAsterisms.has(a.name))
      .map(a => ({name: a.name, effect: a.actionDetails.effect}));
  }

  selectAsterism(name: string): void {
    this.activeAsterisms.add(name);
  }

  /** Progress bar: all steps in the round for visualization */
  get allSteps(): { label: string; key: string; active: boolean; completed: boolean }[] {
    const steps: { label: string; key: string; active: boolean; completed: boolean }[] = [];

    if (this.battleRound === 1 || this.stage.type === 'deployment') {
      steps.push({
        label: 'Deployment',
        key: 'deployment',
        active: this.stage.type === 'deployment',
        completed: this.stage.type !== 'deployment',
      });
    }

    steps.push({
      label: 'Start',
      key: 'start',
      active: this.stage.type === 'start' || this.stage.type === 'startActions',
      completed: this.stage.type === 'turn' || this.stage.type === 'end',
    });

    for (let p = 0; p < 2; p++) {
      for (let i = 0; i < TURN_PHASES.length; i++) {
        const isOwn = p === 0 ? this.firstTurnIsOwn : !this.firstTurnIsOwn;
        const playerTag = isOwn ? 'Your' : "Opponent's";
        const key = `turn-${p}-${i}`;
        let active = false;
        let completed = false;

        if (this.stage.type === 'turn') {
          if (this.stage.playerIndex === p && this.stage.phaseIndex === i) active = true;
          if (this.stage.playerIndex > p || (this.stage.playerIndex === p && this.stage.phaseIndex > i)) completed = true;
        } else if (this.stage.type === 'end') {
          completed = true;
        }

        steps.push({
          label: `${playerTag} ${TURN_PHASES[i].label}`,
          key,
          active,
          completed,
        });
      }
    }

    steps.push({
      label: 'Round End',
      key: 'end',
      active: this.stage.type === 'end',
      completed: false,
    });

    return steps;
  }

  pickPriority(ownFirst: boolean): void {
    this.firstTurnIsOwn = ownFirst;
    this.stage = {type: 'startActions'};
  }

  adjustCommandPoints(delta: number): void {
    this.commandPoints = Math.max(0, this.commandPoints + delta);
  }

  goToStep(stepKey: string): void {
    if (stepKey === 'deployment') {
      if (this.battleRound !== 1) return;
      this.stage = {type: 'deployment'};
      return;
    }

    if (stepKey === 'start') {
      // If already past priority pick, go to start actions; otherwise priority picker
      if (this.stage.type === 'turn' || this.stage.type === 'end' || this.stage.type === 'startActions') {
        this.stage = {type: 'startActions'};
      } else {
        this.stage = {type: 'start'};
      }
      return;
    }

    if (stepKey === 'end') {
      this.stage = {type: 'end'};
      return;
    }

    const match = /^turn-(0|1)-(\d+)$/.exec(stepKey);
    if (!match) return;

    const playerIndex = Number(match[1]);
    const phaseIndex = Number(match[2]);
    if (phaseIndex < 0 || phaseIndex >= TURN_PHASES.length) return;

    this.stage = {type: 'turn', playerIndex: playerIndex as 0 | 1, phaseIndex};

    // Allow DOM to settle before checking overflow state.
    setTimeout(() => this.updatePhaseBarOverflow());
  }

  onPhaseBarScroll(): void {
    this.updatePhaseBarOverflow();
  }

  private updatePhaseBarOverflow(): void {
    const el = this.phaseBarRef?.nativeElement;
    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    this.phaseBarOverflowLeft = el.scrollLeft > 0;
    this.phaseBarOverflowRight = el.scrollLeft < maxScrollLeft;
  }

  nextPhase(): void {
    this.commandUsedBy.clear();
    this.unitCommandUsed.clear();

    if (this.stage.type === 'deployment') {
      this.stage = {type: 'start'};
      return;
    }

    if (this.stage.type === 'start') {
      // Should not happen — priority picker handles this
      return;
    }

    if (this.stage.type === 'startActions') {
      this.usedThisTurn.clear();
      this.stage = {type: 'turn', playerIndex: 0, phaseIndex: 0};
      return;
    }

    if (this.stage.type === 'turn') {
      const nextPhaseIdx = this.stage.phaseIndex + 1;
      if (nextPhaseIdx < TURN_PHASES.length) {
        // Next phase within same player's turn
        this.stage = {type: 'turn', playerIndex: this.stage.playerIndex, phaseIndex: nextPhaseIdx};
      } else if (this.stage.playerIndex === 0) {
        // First player done → start second player's turn from Hero phase
        this.usedThisTurn.clear();
        this.stage = {type: 'turn', playerIndex: 1, phaseIndex: 0};
      } else {
        // Second player done → end of round
        this.stage = {type: 'end'};
      }
      return;
    }

    if (this.stage.type === 'end') {
      // New battle round
      this.battleRound++;
      this.usedThisTurn.clear();
      this.commandPoints += 3;
      this.stage = {type: 'start'};
    }
  }

  prevPhase(): void {
    this.commandUsedBy.clear();
    this.unitCommandUsed.clear();

    if (this.stage.type === 'start' && this.battleRound === 1) {
      this.stage = {type: 'deployment'};
      return;
    }

    if (this.stage.type === 'end') {
      // Back to second player's last phase
      this.stage = {type: 'turn', playerIndex: 1, phaseIndex: TURN_PHASES.length - 1};
      return;
    }

    if (this.stage.type === 'deployment') {
      return;
    }

    if (this.stage.type === 'startActions') {
      this.stage = {type: 'start'};
      return;
    }

    if (this.stage.type === 'turn') {
      if (this.stage.phaseIndex > 0) {
        this.stage = {type: 'turn', playerIndex: this.stage.playerIndex, phaseIndex: this.stage.phaseIndex - 1};
      } else if (this.stage.playerIndex === 1) {
        // Back to first player's last phase
        this.stage = {type: 'turn', playerIndex: 0, phaseIndex: TURN_PHASES.length - 1};
      } else {
        // Back to start actions
        this.stage = {type: 'startActions'};
      }
      return;
    }
  }

  get nextButtonLabel(): string {
    if (this.stage.type === 'deployment') return 'Start of Battle Round →';
    if (this.stage.type === 'startActions') {
      const who = this.firstTurnIsOwn ? 'Your' : "Opponent's";
      return `${who} Hero Phase →`;
    }
    if (this.stage.type === 'end') return 'New Battle Round →';
    if (this.stage.type === 'turn') {
      const nextPhaseIdx = this.stage.phaseIndex + 1;
      if (nextPhaseIdx < TURN_PHASES.length) {
        return `${TURN_PHASES[nextPhaseIdx].label} →`;
      }
      if (this.stage.playerIndex === 0) {
        const who = this.firstTurnIsOwn ? "Opponent's" : 'Your';
        return `${who} Turn →`;
      }
      return 'End of Round →';
    }
    return 'Next →';
  }

  get canGoPrev(): boolean {
    if (this.stage.type === 'deployment') return false;
    if (this.stage.type === 'start') return this.battleRound === 1;
    if (this.stage.type === 'startActions') return true;
    return true;
  }

  get showUnits(): boolean {
    return this.stage.type === 'turn' || this.stage.type === 'deployment' || this.stage.type === 'startActions';
  }

  getAvailableActions(unit: Unit): BattleAction[] {
    return unit.actions.filter(action => {
      // Actions with showAllPhases appear in every turn phase
      if (!action.showAllPhases && action.phaseActivation !== this.currentPhase) return false;
      // showAllPhases actions only show during turns (not deployment/start/end summary)
      if (action.showAllPhases && this.stage.type !== 'turn') return false;

      if (this.stage.type !== 'turn') {
        return action.phaseActivationTiming !== 'opponent';
      }

      if (action.phaseActivationTiming === 'own' && !this.isOwnTurn) return false;
      if (action.phaseActivationTiming === 'opponent' && this.isOwnTurn) return false;
      return true;
    }).filter(action => !action.armyWide);
  }

  get armyWideActions(): BattleAction[] {
    if (!this.army) return [];
    // Collect unique army-wide actions from all units (they're duplicated across units)
    const seen = new Set<string>();
    const actions: BattleAction[] = [];
    for (const unit of this.army.units) {
      for (const action of unit.actions) {
        if (!action.armyWide) continue;
        if (seen.has(action.name)) continue;
        seen.add(action.name);
        actions.push(action);
      }
    }
    return actions.filter(action => {
      // Hide Asterism meta-actions (shown as picker UI instead)
      if (action.name === 'The Great Plan' || action.name === 'Further the Great Plan') return false;
      // Hide unselected Asterisms
      if (ASTERISM_NAMES.has(action.name) && !this.activeAsterisms.has(action.name)) return false;

      if (action.phaseActivation !== this.currentPhase) return false;
      if (this.stage.type !== 'turn' && this.stage.type !== 'startActions') {
        return action.phaseActivationTiming !== 'opponent';
      }
      if (this.stage.type === 'turn') {
        if (action.phaseActivationTiming === 'own' && !this.isOwnTurn) return false;
        if (action.phaseActivationTiming === 'opponent' && this.isOwnTurn) return false;
      }
      return true;
    });
  }

  hasAnyActions(unit: Unit): boolean {
    return this.getAvailableActions(unit).length > 0;
  }

  private isCoreAction(action: BattleAction): boolean {
    return action.name.startsWith('Core:') && !action.isCommand;
  }

  canToggleAction(unit: Unit, action: BattleAction): boolean {
    if (action.numberOfTimes === 'unlimited') return false;

    if (this.isCoreAction(action)) return false;

    if (action.isCommand) {
      // Already used by this unit → allow toggling off
      if (this.commandUsedBy.get(action.name) === unit.name) return true;
      // Command already used by a different unit this phase
      if (this.commandUsedBy.has(action.name)) return false;
      // This unit already used a different command this phase
      if (this.unitCommandUsed.has(unit.name) && this.unitCommandUsed.get(unit.name) !== action.name) return false;
    }

    return true;
  }

  isActionUsed(unit: Unit, action: BattleAction): boolean {
    if (this.isCoreAction(action)) return false;

    if (action.isCommand) {
      return this.commandUsedBy.get(action.name) === unit.name;
    }

    // For linked groups, check by group key (any unit in group counts)
    if (action.linkedGroup) {
      const groupKey = `linked::${action.linkedGroup}`;
      if (action.numberOfTimes === 'once') return this.usedOnce.has(groupKey);
      if (action.numberOfTimes === 'perRound') return this.usedThisTurn.has(groupKey);
      return false;
    }

    const key = `${unit.name}::${action.name}`;
    if (action.numberOfTimes === 'once') return this.usedOnce.has(key);
    if (action.numberOfTimes === 'perRound') return this.usedThisTurn.has(key);
    return false;
  }

  toggleActionUsed(unit: Unit, action: BattleAction): void {
    if (!this.canToggleAction(unit, action)) return;

    if (action.isCommand) {
      if (this.commandUsedBy.get(action.name) === unit.name) {
        this.commandUsedBy.delete(action.name);
        this.unitCommandUsed.delete(unit.name);
      } else {
        this.commandUsedBy.set(action.name, unit.name);
        this.unitCommandUsed.set(unit.name, action.name);
      }
      return;
    }

    // Linked group: toggle a single shared key for the whole group
    if (action.linkedGroup) {
      const groupKey = `linked::${action.linkedGroup}`;
      const set = action.numberOfTimes === 'once' ? this.usedOnce : this.usedThisTurn;
      if (set.has(groupKey)) set.delete(groupKey);
      else set.add(groupKey);
      return;
    }

    const key = `${unit.name}::${action.name}`;
    const set = action.numberOfTimes === 'once' ? this.usedOnce : this.usedThisTurn;
    if (set.has(key)) set.delete(key);
    else set.add(key);
  }
}
