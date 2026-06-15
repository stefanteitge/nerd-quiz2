import { Routes } from '@angular/router';
import { HowItIsPlayedComponent } from './pages/how-it-is-played/how-it-is-played.component';
import { IntroComponent } from './pages/intro/intro.component';
import { QuestionComponent } from './pages/question/question.component';
import { StartComponent } from './pages/start/start.component';
import { TitleComponent } from './pages/title/title.component';

export const routes: Routes = [
  { path: '', component: TitleComponent },
  { path: 'how-it-is-played', component: HowItIsPlayedComponent },
  { path: 'start', component: StartComponent },
  { path: 'intro', component: IntroComponent },
  { path: 'question', component: QuestionComponent },
  { path: '**', redirectTo: '' }
];
