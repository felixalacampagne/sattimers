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


@Component({
  selector: 'timer-list',
  imports: [CommonModule, 
            MatTableModule, 
            MatIconModule,
            MatButtonModule,
            LayoutModule
         ],
  templateUrl: './timer-list.component.html',
  styleUrl: './timer-list.component.scss'
})
export class TimerListComponent implements OnInit {

// WARNING: The order here determines the column order, not the order of the columns in the html!!!!

landscapeColumns: string[] = [
   'programme', 'sdate', 'start', 'channel', 'duration', 'repeated', 'end', 'options'
];
portraitColumns: string[] = [
   'programme', 'sdate', 'start', 'channel'
];

displayedColumns: string[] = this.landscapeColumns;
timers : Timer[] | undefined;   
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
                                 this.displayedColumns = this.portraitColumns;
                              }
                           }
                        });
      
      this.bpObservable.observe(['(orientation: landscape)'])
                        .subscribe(result => {
                        if(result.matches){
                           this.landscapeDisplay = true;
                           console.log("TimerListComponent.ngOnInit: set landscape columns");
                           this.displayedColumns = this.landscapeColumns; 
                        }
                        });      
      this.loadTimers();
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
              console.log("TransactionsComponent.loadTimers: An error occured during subscribe: " + JSON.stringify(err, null, 2));
              } ,
          complete: ()=>{console.log("TransactionsComponent.loadTimers: completed");}
       });
    
      console.log("TransactionsComponent.loadTimers:Finished");   
   }

   edittimer(timer: Timer) 
   {
      throw new Error('Method not implemented.');
   }

   deletetimer(timer: Timer) 
   {
      throw new Error('Method not implemented.');
   }   
   
}
