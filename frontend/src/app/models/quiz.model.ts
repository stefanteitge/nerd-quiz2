export interface QuizOption {
  answer: string;
  correct?: boolean;
}

export interface QuizQuestion {
  id: string;
  title: string;
  questionImage?: string | null;
  answerImage?: string | null;
  explanation?: string | null;
  options: {
    red?: QuizOption | null;
    green?: QuizOption | null;
    both?: QuizOption | null;
  };
}

export interface Quiz {
  questions: QuizQuestion[];
}
