import { Component, Input } from '@angular/core';
import { WeaponProfile } from '../../models/battle.models';

@Component({
  selector: 'app-unit-weapons',
  standalone: true,
  templateUrl: './unit-weapons.component.html',
  styleUrl: './unit-weapons.component.css',
})
export class UnitWeaponsComponent {
  @Input({ required: true }) weapons: WeaponProfile[] = [];
}
