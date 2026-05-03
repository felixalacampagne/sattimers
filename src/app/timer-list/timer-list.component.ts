// src/app/timer-list/timer-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { OWITimersService } from '../service/owitimers.service';
import { Timer } from '../model/timer.model';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimerUtilsService } from '../service/timer-utils.service';
import { DeviceDetectorService } from 'ngx-device-detector'; // npm install ngx-device-detector
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { TimerDeleteConfirmModalComponent } from './timer-delete-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'timer-list',
  imports: [MatTableModule, MatIconModule, MatButtonModule, LayoutModule],
  templateUrl: './timer-list.component.html',
  styleUrls: ['../../styles.scss',
              './timer-list.component.scss'

  ]
})
export class TimerListComponent implements OnInit {
[x: string]: any;

// WARNING: The order here determines the column order, the order of the columns in the html is ignored!!!!

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
private snackBar = inject(MatSnackBar); // new way instead of putting in constructor


   constructor(private timerService: OWITimersService,
      private deviceService: DeviceDetectorService,
               public utils: TimerUtilsService,
               private bpObservable: BreakpointObserver,
               private titleService: Title,
               private route: ActivatedRoute,
               private router: Router
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

   // The EPG pages currently trigger adding a timer by invoking the satbox timerlist page with a set of URL parameters
   // representing the timer, ie. the timerlist http request contains parameters and these parameters are read by the reponse running
   // in the browser client.
   handleParams(params : Params)
   {
      console.log("TimerListComponent.handleParams: queryParams: " + JSON.stringify(params));

      // Try to get the add timer parameters
      let t : Timer ;

      t = this.utils.parseParamsToTimer(params);
      if(t.serviceref != null)
      {
         this.addTimer(t);
      }
   }

   ngOnInit()
   {
      // console.log('TimerListComponent.ngOnInit: start');

      // Setup listener for changes to the parameter list, ie. when an already opened timerlist window
      // is invoked with a new timer from the EPG list pages
      this.route.queryParams.subscribe(
         p => {
            this.handleParams(p);
         }
      );

      this.bpObservable.observe(['(orientation: portrait)'])
                     .subscribe(result => {
                        if(result.matches){
                           this.landscapeDisplay = false;
                           if(! this.desktopDisplay)
                           {
                              // console.log("TimerListComponent.ngOnInit: set portrait columns");
                              this.expandedTimer = null;
                              this.displayedColumns = this.portraitColumns;
                           }
                        }
                     });

      this.bpObservable.observe(['(orientation: landscape)'])
                     .subscribe(result => {
                     if(result.matches){
                        this.landscapeDisplay = true;
                        // console.log("TimerListComponent.ngOnInit: set landscape columns");
                        this.expandedTimer = null;
                        this.displayedColumns = this.landscapeColumns;
                     }
                     });

      this.loadTimers();

      // console.log("TimerListComponent.ngOnInit: finish");
   }

   loadTimers(newTimer? : Timer)
   {
      // console.log("TimerListComponent.loadTimers: Starting");

      this.timerService.getTimerList().subscribe({
         next: (res) => {
            if(!res)
            {
              console.log("TimerListComponent.loadTimers: result is not initialized");
            }
            else if(res.result)
            {
               this.timers = res.timers;

               // Hack to highlight new timer. The new state is no longer set in the list
               // returned from the stb so must apply it here before display
               if(typeof newTimer !== "undefined")
               {
                  // console.log("TimerListComponent.loadTimers: checking for newTimer: " + newTimer.name );
                  this.timers.find(t => {
                     if(t.name == newTimer.name)
                     {
                        // console.log("TimerListComponent.loadTimers: found newTimer: state:" + t.state );
                        if(t.state == 0)
                        {
                           t.state = 33;
                           // console.log("TimerListComponent.loadTimers: found newTimer: set new state:" + t.state );
                        }
                        return true;
                     }
                     return false;
                  })
               }
            }
            else
            {
               console.log("TimerListComponent.loadTimers: result was not true: " + JSON.stringify(res));
            }
         },
         error: (err) => {
            console.log("TimerListComponent.loadTimers: Error: " + JSON.stringify(err, null, 2));
         },
         complete: () => {
            // console.log("TimerListComponent.loadTimers: completed");
         }
       });

      // console.log("TimerListComponent.loadTimers:Finished");
   }

   addTimer(timer : Timer)
   {
      let params : HttpParams = this.timerService.buildModifyTimerParams(timer);
      this.timerService.addTimer(params).subscribe({
         next: (res)=>{
            console.log("TimerListComponent.addTimer: result: " + JSON.stringify(res));
            // {"result":true,"message":"Timer 'PlayOJO Live Casino Show 25-11-14 3x317 Episode 317' added"}
            // TODO result can be false, need to put the message somewhere
            // Reload this page WITHOUT the add timer parameters so page refresh does not
            // try to re-add the same timer. Strangely it does not actually trigger a reload of the page
            // so must still make call to loadTimers which is lucky as it allows to pass the new timer
            // so it can be highlighted.
            // This is probably not the best way to do it but I cannot find any way
            // to abort the subscription from within the next processing so it will have
            // to do for now.
            if(!res.result)
            {
               this.showStatus(res.message, "Close");
            }
            this.router.navigate([], { queryParams: {} }); // Will this make the status go away??
            this.loadTimers(timer);
         },
         error: (err)=>{
            // TODO Need somewhere to put the error message...
            console.log("TimerListComponent.addTimer: error: " + JSON.stringify(err, null, 2));
            this.router.navigate([], { queryParams: {} });
            this.loadTimers();
         } ,
         complete: ()=>{
            // WARNING: does not complete if there is an error!!!!!
            // console.log("TimerListComponent.addTimer: completed");
         }
       });

   }

   edittimer(timer: Timer)
   {
      this.utils.pushTimerToEdit(timer);
      this.router.navigate(["timeredit"]);
      // window.open("timeredit.htm?sRef=" + escape(sRef) + "&begin=" + begin + "&end=" + end +  nocache("&"), "_self");
   }

   newTimer()
   {
      this.router.navigate(["timeredit"]);
   }

   deletetimer(timer: Timer)
   {
      // console.log("TimerListComponent.deletetimer: Starting");

      this.timerService.deleteTimer(timer).subscribe({
          next: (res) => {
            console.log("TimerListComponent.deletetimer: result: " + JSON.stringify(res));
            this.loadTimers();
           },
          error: (err) => {
              console.log("TimerListComponent.deletetimer: An error occurred: " + JSON.stringify(err, null, 2));
              this.loadTimers();
              } ,
          complete: () => {
            // complete not executed if error
            // this.loadTimers();
            // console.log("TimerListComponent.deletetimer: completed");
         }
       });

      // console.log("TimerListComponent.deletetimer:Finished");
   }

   delTimerConfirm(timer: Timer)
   {
      this.dialog
         .open(TimerDeleteConfirmModalComponent, {data :timer} )
         .afterClosed()
         .subscribe(result =>
         {
            // console.log("delTimerConfirm: dialog closed: " + JSON.stringify(result, null, 2));
            if(result)
            {
               // console.log("delTimerConfirm: deleting timer");
               this.deletetimer(timer);
            }
            // else
            // {
            //    console.log("delTimerConfirm: NOT deleting timer");
            // }
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


   showStatus(msg : string, action : string)
   {
      this.snackBar.open(msg, action);
   }
}

