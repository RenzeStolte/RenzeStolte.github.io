import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Army } from '../models/battle.models';

@Component({
  selector: 'app-faction-select',
  standalone: true,
  templateUrl: './faction-select.component.html',
  styleUrl: './faction-select.component.css',
})
export class FactionSelectComponent {
  @Input() armies: Army[] = [];
  @Output() armySelected = new EventEmitter<Army>();

  select(army: Army): void {
    this.armySelected.emit(army);
  }
}
