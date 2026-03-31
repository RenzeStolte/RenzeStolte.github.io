import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit {
  sum = 0;

  addOneToSum() {
    this.sum = this.sum + 1;
    console.log(this.sum);
  }

  ngOnInit() {
    this.addOneToSum();
    Math.random();
  }
}
