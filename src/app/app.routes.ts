// app.routes.ts
import { RouterModule, RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimerEditComponent } from './timer-edit/timer-edit.component';
import { inject, Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TimerUtilsService } from './service/timer-utils.service';
export const routes: Routes = [
   {path: 'timerlist', title: "Timers", component: TimerListComponent},
   {path: 'timeredit', title: "Timer Edit", component: TimerEditComponent},
   {path: '', title: "Timers", component: TimerListComponent},

];

// Based on:
// https://v19.angular.dev/guide/routing/common-router-tasks#setting-the-page-title
// with provide statement in app.config.ts
@Injectable({providedIn: 'root'})
export class HostnameTitleStrategy extends TitleStrategy
{
   private readonly title = inject(Title);
   private readonly utils = inject(TimerUtilsService);
   constructor( )
   {
      super();
   }

   override updateTitle(routerState: RouterStateSnapshot)
   {
   const title = this.buildTitle(routerState);
      //  console.log("HostnameTitleStrategy.updateTitle: route title:" + title);
      if (title !== undefined)
      {
         this.title.setTitle(this.utils.titlePrefix() + " " + title);
      }
   }
}
