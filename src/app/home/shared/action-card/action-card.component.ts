import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BattleAction } from '../../models/battle.models';

@Component({
  selector: 'app-action-card',
  standalone: true,
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.css',
})
export class ActionCardComponent implements OnChanges {
  @Input({ required: true }) action!: BattleAction;
  @Input() used = false;
  @Input() clickable = false;
  @Input() defaultCoreExpanded = true;
  @Input() showCoreToggle = false;

  @Output() actionToggle = new EventEmitter<void>();

  coreExpanded = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['action'] || changes['defaultCoreExpanded']) {
      this.coreExpanded = this.defaultCoreExpanded;
    }
  }

  get isCore(): boolean {
    return this.action.name.startsWith('Core:') && !this.action.isCommand;
  }

  get isCommand(): boolean {
    return !!this.action.isCommand;
  }

  get showDetails(): boolean {
    if (this.isCommand) return this.coreExpanded;
    return !this.isCore || this.coreExpanded;
  }

  get showTypeAndLimit(): boolean {
    return !this.isCore;
  }

  get actionDeclare(): string {
    return this.action.actionDetails.actionType === 'activated' ? this.action.actionDetails.declare : '';
  }

  onCardClick(): void {
    if (!this.clickable) return;
    this.actionToggle.emit();
  }

  toggleCoreDetails(event: Event): void {
    event.stopPropagation();
    this.coreExpanded = !this.coreExpanded;
  }
}
