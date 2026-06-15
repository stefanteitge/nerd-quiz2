import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

const TEXT_POOL = [
  'Despotism',
  'The quiz master is god',
  'All hail to the quiz master',
  'AI did this',
  "You'll never be correct",
  'Dumb?',
  'Resistance is futile',
  '404: dignity not found',
  'Touch grass',
  'RTFM',
  "It's not a bug, it's a feature",
  'Have you tried turning it off and on again?',
  'Works on my machine',
  'sudo make me a sandwich',
  'To be fair...',
  'Ship it',
  'Move fast and break things',
  'This is fine',
  'Chaos reigns',
  'You are being evaluated',
];

const NEON_COLORS = [
  '#ff00ff', '#00ffff', '#ff2244', '#00ff88', '#ffff00', '#9d00ff', '#ff6600',
];

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  animation: string;
}

@Component({
  selector: 'app-intro-page',
  standalone: true,
  imports: [],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent implements OnInit, OnDestroy {
  items: FloatingText[] = [];

  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.items = this.pickItems();
    this.timeout = setTimeout(() => void this.router.navigate(['/question']), 10000);
  }

  ngOnDestroy(): void {
    if (this.timeout !== null) clearTimeout(this.timeout);
  }

  private pickItems(): FloatingText[] {
    const shuffled = [...TEXT_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 7).map((text, i) => {
      const variant = (i % 4) + 1;
      const duration = 7 + Math.random() * 3;
      const delay = Math.random() * 2;
      return {
        text,
        x: 3 + Math.random() * 78,
        y: 5 + Math.random() * 78,
        fontSize: 2.2 + Math.random() * 2.8,
        color: NEON_COLORS[i % NEON_COLORS.length],
        animation: `swirl-${variant} ${duration.toFixed(2)}s ${delay.toFixed(2)}s ease-in-out both`,
      };
    });
  }
}
