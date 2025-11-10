// src/app/timer-list/timer-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { OWITimersService } from '../service/owitimers.service';
import { Timer } from '../model/timer.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimerUtilsService } from '../service/timer-utils.service';
import { DeviceDetectorService } from 'ngx-device-detector'; // npm install ngx-device-detector
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { HttpParams } from '@angular/common/http';
import { TimerDeleteConfirmModalComponent } from './timer-delete-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'timer-list',
  imports: [CommonModule,
            MatTableModule,
            MatIconModule,
            MatButtonModule,
            LayoutModule
         ],
  templateUrl: './timer-list.component.html',
  styleUrls: ['../../styles.scss',
              './timer-list.component.scss'

  ]
})
export class TimerListComponent implements OnInit {
[x: string]: any;

// WARNING: The order here determines the column order, not the order of the columns in the html!!!!

landscapeColumns: string[] = [
   'programme', 'sdate', 'start', 'channel', 'duration', 'repeated', 'end', 'options'
];
portraitColumns: string[] = [
   'programme', 'sdate', 'start', 'expand'
];

displayedColumns: string[] = this.landscapeColumns;
timers : Timer[] | undefined;
expandedTimer: Timer | null = null;
landscapeDisplay: boolean = false;
desktopDisplay: boolean = false;

dialog = inject(MatDialog);

   constructor(private timerService: OWITimersService,
      private deviceService: DeviceDetectorService,
               public utils: TimerUtilsService,
               private bpObservable: BreakpointObserver,
               private titleService: Title
            )
   {
      this.landscapeDisplay = this.bpObservable.isMatched('(orientation: landscape)');
      this.desktopDisplay = false; // this.deviceService.isDesktop();  always give true when emulating mobile layout
      if(this.desktopDisplay || this.landscapeDisplay) {
         console.log("TimerListComponent.<init>: set landscape columns: dt:" + this.desktopDisplay + " land:" + this.landscapeDisplay);
         this.displayedColumns = this.landscapeColumns;
      }
      else
      {
         console.log("TimerListComponent.<init>: set portrait columns");
         this.displayedColumns = this.portraitColumns;
      }
   }

   // The EPG pages currently trigger adding a timer by invoke the satbox timerlist page with a set of URL parameters
   // representing the timer, ie. the http request contains parameters and these parameters are read by the reponse running
   // in the browser client.
   // I have no idea whether this is going to work for Angular.
   //
   // It seems to partially work. If a new window is created
   // then the parameters are parsed and the timer is added.
   // At the moment it DOES NOT work when a url with new parameters is invoked
   // on a window which is already open. The new parameters are used
   // if the page is refreshed. No clue what to do to make the page automatically
   // detect that the url has changed. Maybe need a specific 'timerinsert' name to use which is
   // then replaced by the timerlist name, or maybe the parameters must be reset
   // to nothing - really don't have a clue.
   //
   // I think there are more angular like ways to handle the parameters so perhaps
   // I need to look at using them.

   ngOnInit()
   {
      console.log('TimerListComponent.ngOnInit: start');


      this.bpObservable.observe(['(orientation: portrait)'])
                     .subscribe(result => {
                        if(result.matches){
                           this.landscapeDisplay = false;
                           if(! this.desktopDisplay)
                           {
                              console.log("TimerListComponent.ngOnInit: set portrait columns");
                              this.expandedTimer = null;
                              this.displayedColumns = this.portraitColumns;
                           }
                        }
                     });

      this.bpObservable.observe(['(orientation: landscape)'])
                     .subscribe(result => {
                     if(result.matches){
                        this.landscapeDisplay = true;
                        console.log("TimerListComponent.ngOnInit: set landscape columns");
                        this.expandedTimer = null;
                        this.displayedColumns = this.landscapeColumns;
                     }
                     });

      this.titleService.setTitle(this.utils.titlePrefix() + " Timers");

      // Try to get the add timer parameters
      let t : Timer = new Timer();
      t.serviceref = "undefined";
      const url = window.location.href;
      console.log("TimerListComponent.ngOnInit: url: " + url);
      if (url.includes('?')) {
         const httpParams = new HttpParams({ fromString: url.split('?')[1] });
         t = this.utils.parseParamsToTimer(httpParams);
      }

      if(t.serviceref == "undefined")
      {
         this.loadTimers();
      }
      else
      {
         this.addTimer(t);
      }
      console.log("TimerListComponent.ngOnInit: finish");
   }

   loadTimers()
   {
      console.log("TimerListComponent.loadTimers: Starting");

      this.timerService.getTimerList().subscribe({
          next: (res)=>{
             if(!res)
             {
               console.log("TimerListComponent.loadTimers: variable is not initialized");
             }
             else
             {
               if(res.result)
               {
                  this.timers = res.timers;
               }
               else
               {
                  console.log("TimerListComponent.loadTimers: result was not true: " + JSON.stringify(res));
               }
             }
           },
          error: (err)=>{
              console.log("TimerListComponent.loadTimers: An error occured during subscribe: " + JSON.stringify(err, null, 2));
              } ,
          complete: ()=>{console.log("TimerListComponent.loadTimers: completed");}
       });

      console.log("TimerListComponent.loadTimers:Finished");
   }

   addTimer(timer : Timer)
   {
      this.timerService.addTimer(timer).subscribe({
          next: (res)=>{
               console.log("TimerListComponent.addTimer: result: " + JSON.stringify(res));
            this.loadTimers();
           },
          error: (err)=>{
              console.log("TimerListComponent.addTimer: error: " + JSON.stringify(err, null, 2));
            this.loadTimers();
              } ,
          complete: ()=>{
            // WARNING: does not complete if there is an error!!!!!
            console.log("TimerListComponent.addTimer: completed");
            // this.loadTimers();
         }
       });

   }

   edittimer(timer: Timer)
   {
      // window.open("timeredit.htm?sRef=" + escape(sRef) + "&begin=" + begin + "&end=" + end +  nocache("&"), "_self");
      throw new Error('Method not implemented.');
   }

   deletetimer(timer: Timer)
   {
      console.log("TimerListComponent.deletetimer: Starting");

      this.timerService.deleteTimer(timer).subscribe({
          next: (res)=>{
            console.log("TimerListComponent.deletetimer: result: " + JSON.stringify(res));
           },
          error: (err)=>{
              console.log("TimerListComponent.deletetimer: An error occurred: " + JSON.stringify(err, null, 2));
              } ,
          complete: ()=>{
            this.loadTimers();
            console.log("TimerListComponent.deletetimer: completed");
         }
       });

      console.log("TimerListComponent.deletetimer:Finished");
   }

   delTimerConfirm(timer: Timer)
   {
      this.dialog
         .open(TimerDeleteConfirmModalComponent, {data :timer} )
         .afterClosed()
         .subscribe(result =>
         {
            console.log("delTimerConfirm: dialog closed: " + JSON.stringify(result, null, 2));
            if(result)
            {
               console.log("delTimerConfirm: deleting timer");
               this.deletetimer(timer);
            }
            else
            {
               console.log("delTimerConfirm: NOT deleting timer");
            }
         });
   }



   /** Checks whether an element is expanded. */
   isExpanded(timer: Timer) {
      // console.log("isExpanded: " + (this.expandedTimer === timer));
      return this.expandedTimer === timer;
   }

   /** Toggles the expanded state of an element. */
   toggle(timer: Timer) {
      // console.log("toggle: expandedTimer: " + this.expandedTimer);
      this.expandedTimer = this.isExpanded(timer) ? null : timer;
   }

   getDuration(t : Timer) {
      return Math.ceil((t.end - t.begin)/60);
   }
}

