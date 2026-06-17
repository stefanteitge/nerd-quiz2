import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizQuestion } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';

type QuestionPhase = 'idle' | 'countdown' | 'voting' | 'revealed';
type OptionKey = 'red' | 'green' | 'both';

interface QuestionOptionViewModel {
  key: OptionKey;
  label: string;
  answer: string;
  correct: boolean;
}

@Component({
  selector: 'app-question-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent implements OnInit, OnDestroy {
  readonly currentQuestion = signal<QuizQuestion | null>(null);
  readonly questionImageUrl = signal<string | null>(null);
  readonly answerImageUrl = signal<string | null>(null);
  readonly phase = signal<QuestionPhase>('idle');
  readonly countdownValue = signal(3);
  readonly votingSecondsLeft = signal(5);
  readonly votingProgress = signal(100);

  readonly visibleImageUrl = computed<string | null>(() => {
    if (this.phase() === 'revealed' && this.answerImageUrl()) {
      return this.answerImageUrl();
    }
    return this.questionImageUrl();
  });

  readonly options = computed<QuestionOptionViewModel[]>(() => {
    const q = this.currentQuestion();
    if (!q) return [];

    const optionConfig: Array<{ key: OptionKey; label: string }> = [
      { key: 'green', label: 'Green card' },
      { key: 'red', label: 'Red card' },
      { key: 'both', label: 'Both cards' }
    ];

    return optionConfig
      .map(({ key, label }) => {
        const option = q.options[key];
        if (!option) return null;
        return { key, label, answer: option.answer, correct: !!option.correct };
      })
      .filter((o): o is QuestionOptionViewModel => o !== null);
  });

  readonly phaseLabel = computed<string>(() => {
    switch (this.phase()) {
      case 'countdown':
        return `Show your cards in ${this.countdownValue()}`;
      case 'voting':
        return `Voting... ${this.votingSecondsLeft()}s`;
      case 'revealed': {
        const correctOptions = this.options().filter((o) => o.correct);
        if (correctOptions.length === 0) return 'Reveal!';
        const labels = correctOptions.map((o) => o.label).join(' + ');
        return `Correct: ${labels}`;
      }
      default:
        return 'Read the question, then smash VOTE!';
    }
  });

  private readonly timeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(
    readonly quizService: QuizService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const quiz = this.quizService.getCurrentQuiz();
    if (!quiz) {
      void this.router.navigate(['/start']);
      return;
    }
    this.loadNextQuestion();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  startVote(): void {
    if (!this.currentQuestion() || this.phase() !== 'idle') return;
    this.clearTimers();
    this.phase.set('countdown');
    this.countdownValue.set(3);
    this.runCountdown();
  }

  nextQuestion(): void {
    if (this.quizService.questionNumber > 0 && this.quizService.questionNumber % 10 === 0) {
      void this.router.navigate(['/intro']);
    } else {
      this.loadNextQuestion();
    }
  }

  getOptionClass(option: QuestionOptionViewModel): string {
    const classes = ['option-card', option.key];
    if (this.phase() === 'revealed') {
      classes.push(option.correct ? 'revealed-correct' : 'revealed-muted');
    }
    return classes.join(' ');
  }

  @HostListener('document:keydown.enter')
  onEnter(): void {
    if (this.phase() === 'idle') {
      this.startVote();
    } else if (this.phase() === 'revealed') {
      this.nextQuestion();
    }
  }

  @HostListener('document:keydown.s')
  onSkip(): void {
    this.loadNextQuestion();
  }

  private loadNextQuestion(): void {
    this.clearTimers();
    const nextQuestion = this.quizService.getNextQuestion();

    if (!nextQuestion) {
      this.quizService.resetQuiz();
      void this.router.navigate(['/start']);
      return;
    }

    this.currentQuestion.set(nextQuestion);
    this.phase.set('idle');
    this.countdownValue.set(3);
    this.votingSecondsLeft.set(5);
    this.votingProgress.set(100);

    const quizUrl = this.quizService.getCurrentQuizUrl();
    this.questionImageUrl.set(
      quizUrl && nextQuestion.questionImage
        ? this.quizService.getImageUrl(quizUrl, nextQuestion.questionImage)
        : null
    );
    this.answerImageUrl.set(
      quizUrl && nextQuestion.answerImage
        ? this.quizService.getImageUrl(quizUrl, nextQuestion.answerImage)
        : null
    );
  }

  private runCountdown(): void {
    if (this.countdownValue() <= 1) {
      this.addTimeout(() => this.startVotingWindow(), 1000);
      return;
    }
    this.addTimeout(() => {
      this.countdownValue.update((v) => v - 1);
      this.runCountdown();
    }, 1000);
  }

  private startVotingWindow(): void {
    this.phase.set('voting');
    this.votingSecondsLeft.set(5);
    this.votingProgress.set(100);
    this.runVotingTick();
  }

  private runVotingTick(): void {
    this.addTimeout(() => {
      const next = this.votingSecondsLeft() - 1;
      this.votingSecondsLeft.set(next);
      this.votingProgress.set((next / 5) * 100);
      if (next <= 0) {
        this.phase.set('revealed');
        return;
      }
      this.runVotingTick();
    }, 1000);
  }

  private addTimeout(callback: () => void, delay: number): void {
    const id = setTimeout(callback, delay);
    this.timeouts.push(id);
  }

  private clearTimers(): void {
    while (this.timeouts.length) {
      clearTimeout(this.timeouts.pop());
    }
  }
}
