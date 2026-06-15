import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Quiz, QuizQuestion } from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentQuiz: Quiz | null = null;
  private currentQuizUrl: string | null = null;
  private usedQuestionIds = new Set<string>();
  private _questionNumber = 0;

  constructor(private readonly http: HttpClient) {}

  loadQuiz(url: string): Observable<Quiz> {
    const normalizedUrl = url.trim();

    return this.http.get<Quiz>(normalizedUrl).pipe(
      tap((quiz) => {
        this.currentQuiz = quiz;
        this.currentQuizUrl = normalizedUrl;
        this.resetQuiz();
      })
    );
  }

  getCurrentQuiz(): Quiz | null {
    return this.currentQuiz;
  }

  getCurrentQuizUrl(): string | null {
    return this.currentQuizUrl;
  }

  get questionNumber(): number {
    return this._questionNumber;
  }

  get totalQuestions(): number {
    return this.currentQuiz?.questions.length ?? 0;
  }

  getImageUrl(quizUrl: string, imageName: string): string {
    const base = quizUrl.substring(0, quizUrl.lastIndexOf('/') + 1);
    return `${base}images/${imageName}`;
  }

  getNextQuestion(): QuizQuestion | null {
    if (!this.currentQuiz) {
      return null;
    }

    const availableQuestions = this.currentQuiz.questions.filter(
      (question) => !this.usedQuestionIds.has(question.id)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const nextQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    this.usedQuestionIds.add(nextQuestion.id);
    this._questionNumber += 1;
    return nextQuestion;
  }

  resetQuiz(): void {
    this.usedQuestionIds.clear();
    this._questionNumber = 0;
  }
}
