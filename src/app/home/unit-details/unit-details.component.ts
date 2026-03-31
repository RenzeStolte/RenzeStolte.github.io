import { Component, Input } from '@angular/core';
import { ActionCardComponent } from '../shared/action-card/action-card.component';
import { UnitWeaponsComponent } from '../shared/unit-weapons/unit-weapons.component';
import { BattleAction, BattlePhase, PHASE_LABELS, Unit } from '../models/battle.models';

@Component({
  selector: 'app-unit-details',
  standalone: true,
  imports: [UnitWeaponsComponent, ActionCardComponent],
  templateUrl: './unit-details.component.html',
  styleUrl: './unit-details.component.css',
})
export class UnitDetailsComponent {
  @Input({ required: true }) unit!: Unit;

  readonly phaseOrder: BattlePhase[] = [
    BattlePhase.DEPLOYMENT,
    BattlePhase.START,
    BattlePhase.HERO,
    BattlePhase.MOVEMENT,
    BattlePhase.SHOOTING,
    BattlePhase.CHARGE,
    BattlePhase.ATTACK,
    BattlePhase.END,
  ];

  readonly phaseLabels = PHASE_LABELS;

  actionsForPhase(phase: BattlePhase): BattleAction[] {
    return this.unit.actions.filter(action => action.phaseActivation === phase);
  }

  timingLabel(action: BattleAction): string {
    if (action.phaseActivationTiming === 'own') return 'Your turn';
    if (action.phaseActivationTiming === 'opponent') return 'Opponent turn';
    return 'Any turn';
  }

  usageLabel(action: BattleAction): string {
    if (action.numberOfTimes === 'once') return '1x per game';
    if (action.numberOfTimes === 'perRound') return '1x per round';
    return 'Unlimited';
  }
}
