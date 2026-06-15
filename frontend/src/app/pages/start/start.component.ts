import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { QuizService } from '../../services/quiz.service';

const GITHUB_DEFAULT_URL =
  'https://raw.githubusercontent.com/stefanteitge/nerd-quiz2/main/frontend/public/default-quiz/quiz.json';
const LOCAL_DEFAULT_URL = '/default-quiz/quiz.json';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {
  private readonly document = inject(DOCUMENT);

  readonly defaultQuizUrl = this.isLocalhost()
    ? LOCAL_DEFAULT_URL
    : GITHUB_DEFAULT_URL;

  customQuizUrl = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly quizService: QuizService,
    private readonly router: Router
  ) {}

  async startDefaultQuiz(): Promise<void> {
    await this.loadAndStart(this.defaultQuizUrl);
  }

  async startCustomQuiz(): Promise<void> {
    await this.loadAndStart(this.customQuizUrl);
  }

  private isLocalhost(): boolean {
    const host = this.document.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  private async loadAndStart(url: string): Promise<void> {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      this.errorMessage = 'Enter a GitHub raw quiz.json URL to start a custom quiz.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await firstValueFrom(this.quizService.loadQuiz(normalizedUrl));
      await this.router.navigate(['/question']);
    } catch {
      this.errorMessage =
        'Unable to load that quiz source. Double-check the raw GitHub URL and try again.';
    } finally {
      this.loading = false;
    }
  }
}
