// app.routes.ts
import { RouterModule, RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimerEditComponent } from './timer-edit/timer-edit.component';
import { Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TimerUtilsService } from './service/timer-utils.service';
export const routes: Routes = [
   {path: 'timerlist', title: "Timers", component: TimerListComponent},
   {path: 'timeredit', title: "Timer Edit", component: TimerEditComponent},
   {path: '', title: "Timers", component: TimerListComponent},

];


@Injectable({providedIn: 'root'})
export class HostnameTitleStrategy extends TitleStrategy
{
   constructor(private readonly title: Title,
   private utils: TimerUtilsService)
   {
      super();
   }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    console.log("HostnameTitleStrategy.updateTitle: route title:" + title);
    if (title !== undefined) {
      this.title.setTitle(this.utils.titlePrefix() + " " + title);
    }
  }
}
