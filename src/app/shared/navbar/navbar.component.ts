import { Component } from '@angular/core';
import { StreywildButtonComponent } from 'src/app/shared/streywild-button/streywild-button.component';

@Component({
    selector: 'app-navbar',
    imports: [
        StreywildButtonComponent
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
  standalone: true,
})
export class NavbarComponent {

}
