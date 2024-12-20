// src/app/timer-list/timer-list.component.ts
import { Component, OnInit } from '@angular/core';
import { OWITimersService } from '../service/owitimers.service';
import { Timer } from '../model/timer.model';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { TimerUtilsService } from '../service/timer-utils.service';

@Component({
  selector: 'timer-list',
  imports: [CommonModule, 
            MatTableModule, 
            MatIconModule],
  templateUrl: './timer-list.component.html',
  styleUrl: './timer-list.component.scss'
})
export class TimerListComponent implements OnInit {
displayedColumns: string[] = ['programme', 'channel', 'repeated', 'duration', 'start', 'end', 'sdate', 'options'];

timers : Timer[] | undefined;   

   constructor(private timerService: OWITimersService,
               public utils: TimerUtilsService
   )
   {
   }

   ngOnInit() 
   {
      console.log('TimerListComponent.ngOnInit: start');
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
