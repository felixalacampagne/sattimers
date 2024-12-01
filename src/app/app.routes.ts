// app.routes.ts
import { Routes } from '@angular/router';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimerEditComponent } from './timer-edit/timer-edit.component';

export const routes: Routes = [
   {path: 'timerlist', title: "Timer List", component: TimerListComponent},
   {path: 'timeredit', title: "Timer Edit", component: TimerEditComponent},
   {path: '', title: "Timer List", component: TimerListComponent},

];
