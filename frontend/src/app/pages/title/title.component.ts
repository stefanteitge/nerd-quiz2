import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-title-page',
  standalone: true,
  templateUrl: './title.component.html',
  styleUrl: './title.component.scss'
})
export class TitleComponent {
  constructor(private readonly router: Router) {}

  goNext(): void {
    void this.router.navigate(['/how-it-is-played']);
  }
}
