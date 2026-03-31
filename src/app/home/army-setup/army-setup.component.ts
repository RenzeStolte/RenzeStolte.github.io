import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Army, ArmyChoice, ArmyChoiceCategory, ArmyOptions, ArmySelections, Unit } from '../models/battle.models';

interface ChoiceStep {
  category: ArmyChoiceCategory;
  label: string;
  options: ArmyChoice[];
}

type SetupPhase =
  | { type: 'choice'; stepIndex: number }
  | { type: 'assignHero'; forCategory: 'heroicTrait' | 'artifactOfPower' };

@Component({
  selector: 'app-army-setup',
  standalone: true,
  templateUrl: './army-setup.component.html',
  styleUrl: './army-setup.component.css',
})
export class ArmySetupComponent {
  @Input() army!: Army;
  @Output() setupComplete = new EventEmitter<ArmySelections>();
  @Output() back = new EventEmitter<void>();

  phase: SetupPhase = { type: 'choice', stepIndex: 0 };

  selections: ArmySelections = {
    battleTrait: null,
    battleFormation: null,
    heroicTrait: null,
    heroicTraitBearer: null,
    artifactOfPower: null,
    artifactOfPowerBearer: null,
    spellLore: null,
    prayerLore: null,
  };

  get options(): ArmyOptions | undefined {
    return this.army.armyOptions;
  }

  get steps(): ChoiceStep[] {
    const opts = this.options;
    if (!opts) return [];
    const steps: ChoiceStep[] = [
      { category: 'battleTrait', label: 'Battle Trait', options: opts.battleTraits },
      { category: 'battleFormation', label: 'Battle Formation', options: opts.battleFormations },
      { category: 'heroicTrait', label: 'Heroic Trait', options: opts.heroicTraits },
      { category: 'artifactOfPower', label: 'Artifact of Power', options: opts.artifactsOfPower },
      { category: 'spellLore', label: 'Spell Lore', options: opts.spellLore },
      { category: 'prayerLore', label: 'Prayer Lore', options: opts.prayerLore },
    ];
    return steps.filter(s => s.options.length > 0);
  }

  get heroUnits(): Unit[] {
    return this.army.units.filter(u => u.keywords.some(k => k === 'Hero'));
  }

  get isChoicePhase(): boolean {
    return this.phase.type === 'choice';
  }

  get isAssignHeroPhase(): boolean {
    return this.phase.type === 'assignHero';
  }

  get currentStepIndex(): number {
    return this.phase.type === 'choice' ? this.phase.stepIndex : -1;
  }

  get currentStep(): ChoiceStep | undefined {
    return this.phase.type === 'choice' ? this.steps[this.phase.stepIndex] : undefined;
  }

  get selectedForCurrentStep(): ArmyChoice | null {
    const step = this.currentStep;
    if (!step) return null;
    return this.getSelection(step.category);
  }

  get assignHeroLabel(): string {
    if (this.phase.type !== 'assignHero') return '';
    return this.phase.forCategory === 'heroicTrait'
      ? 'Assign Heroic Trait Bearer'
      : 'Assign Artifact of Power Bearer';
  }

  get assignHeroCategory(): 'heroicTrait' | 'artifactOfPower' | null {
    return this.phase.type === 'assignHero' ? this.phase.forCategory : null;
  }

  get selectedBearer(): string | null {
    if (this.phase.type !== 'assignHero') return null;
    return this.phase.forCategory === 'heroicTrait'
      ? this.selections.heroicTraitBearer
      : this.selections.artifactOfPowerBearer;
  }

  get isLastChoiceStep(): boolean {
    return this.phase.type === 'choice' && this.phase.stepIndex === this.steps.length - 1;
  }

  get allSelected(): boolean {
    const choicesReady = this.steps.every(step => this.getSelection(step.category) !== null);
    const heroicNeedsBearer = this.steps.some(s => s.category === 'heroicTrait');
    const artifactNeedsBearer = this.steps.some(s => s.category === 'artifactOfPower');
    const bearersReady =
      (!heroicNeedsBearer || this.selections.heroicTraitBearer !== null) &&
      (!artifactNeedsBearer || this.selections.artifactOfPowerBearer !== null);
    return choicesReady && bearersReady;
  }

  isStepCompleted(category: ArmyChoiceCategory): boolean {
    if (category === 'heroicTrait') {
      return this.selections.heroicTrait !== null && this.selections.heroicTraitBearer !== null;
    }
    if (category === 'artifactOfPower') {
      return this.selections.artifactOfPower !== null && this.selections.artifactOfPowerBearer !== null;
    }
    return this.getSelection(category) !== null;
  }

  getSelection(category: ArmyChoiceCategory): ArmyChoice | null {
    switch (category) {
      case 'battleTrait': return this.selections.battleTrait;
      case 'battleFormation': return this.selections.battleFormation;
      case 'heroicTrait': return this.selections.heroicTrait;
      case 'artifactOfPower': return this.selections.artifactOfPower;
      case 'spellLore': return this.selections.spellLore;
      case 'prayerLore': return this.selections.prayerLore;
    }
  }

  selectOption(category: ArmyChoiceCategory, choice: ArmyChoice): void {
    switch (category) {
      case 'battleTrait': this.selections.battleTrait = choice; break;
      case 'battleFormation': this.selections.battleFormation = choice; break;
      case 'heroicTrait': this.selections.heroicTrait = choice; break;
      case 'artifactOfPower': this.selections.artifactOfPower = choice; break;
      case 'spellLore': this.selections.spellLore = choice; break;
      case 'prayerLore': this.selections.prayerLore = choice; break;
    }
  }

  isSelected(category: ArmyChoiceCategory, choice: ArmyChoice): boolean {
    return this.getSelection(category) === choice;
  }

  selectBearer(unitName: string): void {
    if (this.phase.type !== 'assignHero') return;
    if (this.phase.forCategory === 'heroicTrait') {
      this.selections.heroicTraitBearer = unitName;
    } else {
      this.selections.artifactOfPowerBearer = unitName;
    }
  }

  isBearerSelected(unitName: string): boolean {
    return this.selectedBearer === unitName;
  }

  private needsHeroAssignment(category: ArmyChoiceCategory): boolean {
    return category === 'heroicTrait' || category === 'artifactOfPower';
  }

  nextStep(): void {
    if (this.phase.type === 'assignHero') {
      const fromCategory = this.phase.forCategory;
      const fromIndex = this.steps.findIndex(s => s.category === fromCategory);
      if (fromIndex < this.steps.length - 1) {
        this.phase = { type: 'choice', stepIndex: fromIndex + 1 };
      } else {
        this.setupComplete.emit(this.selections);
      }
      return;
    }

    const step = this.currentStep;
    if (!step) return;

    if (this.needsHeroAssignment(step.category) && this.getSelection(step.category) !== null) {
      this.phase = { type: 'assignHero', forCategory: step.category as 'heroicTrait' | 'artifactOfPower' };
      return;
    }

    if (this.isLastChoiceStep) {
      this.setupComplete.emit(this.selections);
    } else {
      this.phase = { type: 'choice', stepIndex: this.phase.stepIndex + 1 };
    }
  }

  prevStep(): void {
    if (this.phase.type === 'assignHero') {
      const fromCategory = this.phase.forCategory;
      const fromIndex = this.steps.findIndex(s => s.category === fromCategory);
      this.phase = { type: 'choice', stepIndex: fromIndex };
      return;
    }

    if (this.phase.stepIndex > 0) {
      const prevIndex = this.phase.stepIndex - 1;
      const prevStep = this.steps[prevIndex];
      if (this.needsHeroAssignment(prevStep.category) && this.getSelection(prevStep.category) !== null) {
        this.phase = { type: 'assignHero', forCategory: prevStep.category as 'heroicTrait' | 'artifactOfPower' };
      } else {
        this.phase = { type: 'choice', stepIndex: prevIndex };
      }
    } else {
      this.back.emit();
    }
  }

  canProceed(): boolean {
    if (this.phase.type === 'assignHero') {
      return this.selectedBearer !== null;
    }
    return this.selectedForCurrentStep !== null;
  }

  confirmSetup(): void {
    this.setupComplete.emit(this.selections);
  }
}
