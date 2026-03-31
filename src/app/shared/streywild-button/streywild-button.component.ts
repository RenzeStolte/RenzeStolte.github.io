import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'button[streywild]',
    imports: [],
    template: '<div class="button-wrapper"><div class="button-content"><ng-content></ng-content></div></div>',
    styleUrl: './streywild-button.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class StreywildButtonComponent {

}
