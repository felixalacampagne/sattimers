// app.routes.ts
import { Routes } from '@angular/router';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimerEditComponent } from './timer-edit/timer-edit.component';
import { environment } from '../environments/environment';
export const routes: Routes = [
   {path: 'timerlist', title: "Timers", component: TimerListComponent},
   {path: 'timeredit', title: "Timer Edit", component: TimerEditComponent},
   {path: '', title: "Timers", component: TimerListComponent},

];
