// src/app/timer-list/timer-list.component.ts
import { Component, OnInit } from '@angular/core';
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

   constructor(private timerService: OWITimersService,
      private deviceService: DeviceDetectorService,
               public utils: TimerUtilsService,
               private bpObservable: BreakpointObserver
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


   ngOnInit() 
   {
      console.log('TimerListComponent.ngOnInit: start');
                
      // Try to get the add timer parameters  
      let t : Timer = new Timer();
      t.serviceref = "undefined";                
      const url = window.location.href;
      if (url.includes('?')) {
         const httpParams = new HttpParams({ fromString: url.split('?')[1] });
         t = this.utils.parseParamsToTimer(httpParams);
      }

      if(t.serviceref == "undefined")
      {
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
         this.loadTimers();
      }
      else
      {
         this.edittimer(t);
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
}   

