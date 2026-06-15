import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {
  readonly defaultQuizUrl =
    'https://raw.githubusercontent.com/stefanteitge/nerd-quiz2/main/default-quiz/quiz.json';

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
