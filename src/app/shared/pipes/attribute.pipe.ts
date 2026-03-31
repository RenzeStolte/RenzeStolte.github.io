import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attribute',
  standalone: true
})
export class AttributePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    // check if string is not a number:
    if (typeof value === 'string' && isNaN(Number(value))) {
      return value;
    }
    const number = Number(value);
    if (number > 0) {
      return '+' + number;
    }
    if (number < 0) {
      return number;
    }
    return '±' + number;
  }
}
