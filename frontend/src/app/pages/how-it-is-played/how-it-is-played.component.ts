import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-is-played-page',
  standalone: true,
  templateUrl: './how-it-is-played.component.html',
  styleUrl: './how-it-is-played.component.scss'
})
export class HowItIsPlayedComponent {
  readonly rules = [
    `It's unfair`,
    'The idea is stolen',
    'The implementation is flawed',
    'The quiz master reads the question out loud.',
    'Every player answers with a red card, green card, or both.',
    'Everyone reveals their answer at the same time.',
    'After the countdown, the truth is revealed in glorious neon.'
  ];

  constructor(private readonly router: Router) {}

  goNext(): void {
    void this.router.navigate(['/start']);
  }
}
