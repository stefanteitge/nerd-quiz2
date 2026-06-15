import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
  currentQuestion: QuizQuestion | null = null;
  questionImageUrl: string | null = null;
  answerImageUrl: string | null = null;
  phase: QuestionPhase = 'idle';
  countdownValue = 3;
  votingSecondsLeft = 5;
  votingProgress = 100;
  questionNumber = 0;
  totalQuestions = 0;

  private readonly timeouts: number[] = [];

  constructor(
    private readonly quizService: QuizService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const quiz = this.quizService.getCurrentQuiz();

    if (!quiz) {
      void this.router.navigate(['/start']);
      return;
    }

    this.totalQuestions = quiz.questions.length;
    this.loadNextQuestion();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get options(): QuestionOptionViewModel[] {
    if (!this.currentQuestion) {
      return [];
    }

    const optionConfig: Array<{ key: OptionKey; label: string }> = [
      { key: 'green', label: 'Green card' },
      { key: 'red', label: 'Red card' },
      { key: 'both', label: 'Both cards' }
    ];

    return optionConfig
      .map(({ key, label }) => {
        const option = this.currentQuestion?.options[key];

        if (!option) {
          return null;
        }

        return {
          key,
          label,
          answer: option.answer,
          correct: !!option.correct
        };
      })
      .filter((option): option is QuestionOptionViewModel => option !== null);
  }

  get phaseLabel(): string {
    switch (this.phase) {
      case 'countdown':
        return `Show your cards in ${this.countdownValue}`;
      case 'voting':
        return `Voting... ${this.votingSecondsLeft}s`;
      case 'revealed': {
        const correctOption = this.options.find((option) => option.correct);
        return correctOption ? `Correct answer: ${correctOption.label}` : 'Reveal!';
      }
      default:
        return 'Read the question, then smash VOTE!';
    }
  }

  startVote(): void {
    if (!this.currentQuestion || this.phase !== 'idle') {
      return;
    }

    this.clearTimers();
    this.phase = 'countdown';
    this.countdownValue = 3;
    this.runCountdown();
  }

  nextQuestion(): void {
    this.loadNextQuestion();
  }

  getOptionClass(option: QuestionOptionViewModel): string {
    const classes = ['option-card', option.key];

    if (this.phase === 'revealed') {
      classes.push(option.correct ? 'revealed-correct' : 'revealed-muted');
    }

    return classes.join(' ');
  }

  private loadNextQuestion(): void {
    this.clearTimers();

    const nextQuestion = this.quizService.getNextQuestion();

    if (!nextQuestion) {
      this.quizService.resetQuiz();
      void this.router.navigate(['/start']);
      return;
    }

    this.currentQuestion = nextQuestion;
    this.phase = 'idle';
    this.countdownValue = 3;
    this.votingSecondsLeft = 5;
    this.votingProgress = 100;
    this.questionNumber += 1;

    const quizUrl = this.quizService.getCurrentQuizUrl();
    this.questionImageUrl =
      quizUrl && nextQuestion.questionImage
        ? this.quizService.getImageUrl(quizUrl, nextQuestion.questionImage)
        : null;
    this.answerImageUrl =
      quizUrl && nextQuestion.answerImage
        ? this.quizService.getImageUrl(quizUrl, nextQuestion.answerImage)
        : null;
  }

  private runCountdown(): void {
    if (this.countdownValue <= 1) {
      this.registerTimeout(() => this.startVotingWindow(), 1000);
      return;
    }

    this.registerTimeout(() => {
      this.countdownValue -= 1;
      this.runCountdown();
    }, 1000);
  }

  private startVotingWindow(): void {
    this.phase = 'voting';
    this.votingSecondsLeft = 5;
    this.votingProgress = 100;
    this.runVotingTick();
  }

  private runVotingTick(): void {
    this.registerTimeout(() => {
      this.votingSecondsLeft -= 1;
      this.votingProgress = (this.votingSecondsLeft / 5) * 100;

      if (this.votingSecondsLeft <= 0) {
        this.phase = 'revealed';
        return;
      }

      this.runVotingTick();
    }, 1000);
  }

  private registerTimeout(callback: () => void, delay: number): void {
    const timeoutId = window.setTimeout(() => {
      const index = this.timeouts.indexOf(timeoutId);

      if (index >= 0) {
        this.timeouts.splice(index, 1);
      }

      callback();
    }, delay);

    this.timeouts.push(timeoutId);
  }

  private clearTimers(): void {
    while (this.timeouts.length) {
      const timeoutId = this.timeouts.pop();

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }
}
