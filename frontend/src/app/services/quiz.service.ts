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
  private selectedTag: string | null = null;
  private usedQuestionIds = new Set<string>();
  private _questionNumber = 0;

  constructor(private readonly http: HttpClient) {}

  loadQuiz(url: string): Observable<Quiz> {
    const normalizedUrl = url.trim();

    return this.http.get<Quiz>(normalizedUrl).pipe(
      tap((quiz) => {
        this.currentQuiz = quiz;
        this.currentQuizUrl = normalizedUrl;
        this.selectedTag = null;
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

  /** All distinct tags of the current quiz, sorted alphabetically. */
  getAvailableTags(): string[] {
    const tags = new Set<string>();
    for (const question of this.currentQuiz?.questions ?? []) {
      for (const tag of question.tags ?? []) {
        tags.add(tag);
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  }

  /** Number of questions carrying the given tag (plus demo questions), or all questions for null. */
  countQuestions(tag: string | null): number {
    return this.questionsFor(tag).length;
  }

  getSelectedTag(): string | null {
    return this.selectedTag;
  }

  /** Restricts the quiz to questions with the given tag; demo questions are always included. Null means all questions. */
  selectTag(tag: string | null): void {
    this.selectedTag = tag;
    this.resetQuiz();
  }

  get questionNumber(): number {
    return this._questionNumber;
  }

  get totalQuestions(): number {
    return this.questionsFor(this.selectedTag).length;
  }

  getImageUrl(quizUrl: string, imageName: string): string {
    const base = quizUrl.substring(0, quizUrl.lastIndexOf('/') + 1);
    return `${base}images/${imageName}`;
  }

  getNextQuestion(): QuizQuestion | null {
    if (!this.currentQuiz) {
      return null;
    }

    const availableQuestions = this.questionsFor(this.selectedTag).filter(
      (question) => !this.usedQuestionIds.has(question.id)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const demoQuestion = this._questionNumber === 0
      ? availableQuestions.find((q) => q.demo === true)
      : undefined;

    const nextQuestion = demoQuestion ??
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    this.usedQuestionIds.add(nextQuestion.id);
    this._questionNumber += 1;
    return nextQuestion;
  }

  private questionsFor(tag: string | null): QuizQuestion[] {
    const questions = this.currentQuiz?.questions ?? [];
    return tag === null
      ? questions
      : questions.filter((question) => question.demo === true || question.tags?.includes(tag));
  }

  resetQuiz(): void {
    this.usedQuestionIds.clear();
    this._questionNumber = 0;
  }
}
