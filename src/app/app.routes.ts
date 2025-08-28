// app.routes.ts
import { Routes } from '@angular/router';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimerEditComponent } from './timer-edit/timer-edit.component';
import { environment } from '../environments/environment';
export const routes: Routes = [
   {path: 'timerlist', title: environment.titlePrefix + " Timers", component: TimerListComponent},
   {path: 'timeredit', title: environment.titlePrefix + " Timer Edit", component: TimerEditComponent},
   {path: '', title: environment.titlePrefix + " Timers", component: TimerListComponent},

];
