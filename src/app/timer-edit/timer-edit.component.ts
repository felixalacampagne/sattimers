import { Component, EventEmitter, Injectable, input, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DateformatService } from '../service/dateformat.service';
import { Timer } from '../model/timer.model';
import { Channel } from '../model/channel.model';
import { add, roundToNearestMinutes } from "date-fns"; // requires 'npm install date-fns --save'
import { OWITimersService } from '../service/owitimers.service';
import { TimerUtilsService } from '../service/timer-utils.service';

const ln  = "TimerEditCmp.";
// FormatingDateAdapter and ISO_DATE_FORMAT (together with DateformatService) copied from 'account'.
// It seems there is a vast degree of uncertaintity regarding what is required to make date parsing
// work as a normal person might expect.
// I have no idea whether the DateAdapater or the MatDateFormats are actually required.
@Injectable()
export class FormatingDateAdapter extends NativeDateAdapter
{
   constructor(private dateFmt: DateformatService)
   {
      super();
   }

   // This might need to handle dates with times, or just times, in addition to dates
   // The parseFormat will be one of the values from ISO_DATE_FORMAT
   override parse(value: any, parseFormat: any): Date {
      //console.log("FormatingDateAdapter.format: value=" + value + " parseFormat=" + parseFormat);
      return this.dateFmt.parseDateString(value);
   }

   override format(date: Date, displayFormat: Object): string
   {
      let ret : string;
      let fmt : string = String(displayFormat);
      ret = this.dateFmt.format(date, fmt)
      //console.log("FormatingDateAdapter.format: date=" + date + " displayFormat=" + fmt + " return:" + ret);
      return ret;
   }
}



// A MAT_DATE_FORMATS MUST be provided. It appears that the dateInput/timeInput formats described here
// are passed to the FormatingDateAdapter format method by the date/timepickers.
export const ISO_DATE_FORMAT : MatDateFormats = {
   parse: {
     dateInput: 'dd-MM-yyyy',
     timeInput: 'HH:mm'
   },
   display: {
     dateInput: 'dd-MM-yyyy',
     monthYearLabel: 'MMM yyyy',
     dateA11yLabel: 'LL',
     monthYearA11yLabel: 'MMMM yyyy',
     timeInput: 'HH:mm',
     timeOptionLabel: 'HH:mm'
   },
 };

 export interface RepeatDay {
   name: string;
   repeaton: boolean;
};

@Component({
  selector: 'timer-edit',
  providers: [
   { provide: DateAdapter, useClass: FormatingDateAdapter },
   { provide: MAT_DATE_FORMATS, useValue: ISO_DATE_FORMAT }
],
imports: [MatCardModule,
   MatInputModule,
   MatButtonModule,
   MatSelectModule,
   MatDatepickerModule,
   MatTimepickerModule,
   MatIconModule,
   MatCheckboxModule,
   ReactiveFormsModule,
   FormsModule],
  templateUrl: './timer-edit.component.html',
  styleUrl: './timer-edit.component.scss'
})

export class TimerEditComponent {
/*
Aaaaggghhhh Angular still really sucks for passing data between routed
pages. One would imagine that the @Input command would be for exactly
that purpose but, of course, it isn't. It appears to be only useful
when a component is displayed as part of another component in the same
page.
Routes can be used to crudely pass very simple parameters as part of the URL
used to display a page. There is potentially a way to pass complete objects
but it sounds like the most monumental kludge. When data passing is talked
about (SO etc.) the supposed answer is to use a service - but I can't
really see how this is supposed to work... Maybe just a fancy name for a
singleton with a timer field that is set by the caller page and read by the
called page. Maybe that's what I'll try.

const currentNav = this.router.getCurrentNavigation();
const id = currentNav.extras.state.id;
const name = currentNav.extras.state.name;
*/



   @Input() origTimer: Timer | undefined;
   @Output() public submittedEvent = new EventEmitter();

   readonly repdays =
      [
         { name: 'Mo', bit:1,  repeaton: false },
         { name: 'Tu', bit:2,  repeaton: false },
         { name: 'We', bit:4,  repeaton: false },
         { name: 'Th', bit:8,  repeaton: false },
         { name: 'Fr', bit:16, repeaton: false },
         { name: 'Sa', bit:32, repeaton: false },
         { name: 'Su', bit:64, repeaton: false }
      ];

   editForm : FormGroup;
   channels : Channel[] = [];
   constructor(
      private owitimerSvc: OWITimersService,
      private utils : TimerUtilsService
   )
   {
      this.editForm = new FormGroup({
         startdate: new FormControl('', Validators.required),
         enddate: new FormControl('', Validators.required),
         timername: new FormControl('', Validators.required),
         // repeats: new FormControl('', Validators.required),
         channelid: new FormControl(this.channels[0], Validators.required)
       });

   }

   ngOnInit()
   {
      let dnow = new Date();
      // see https://date-fns.org/v4.1.0/docs for the date functions
      dnow = roundToNearestMinutes(dnow, {nearestTo: 5, roundingMethod: 'floor'});
      let dend = add(dnow, {hours:1, minutes:5});
      this.editForm.patchValue({
         startdate: dnow,
         enddate: dend
      });
      this.origTimer = this.utils.getTimerToEdit();
      this.loadChannels();  // The dropdown appears to populate itself automatically, at least when loading from assets!
   }


   updateRepeat(repeaton: boolean, index?: number)
   {
      if(index != undefined)
      {
         this.repdays[index].repeaton = repeaton;
         //console.log(ln + "updateRepeat: repeated:%d", this.mapDaysToRepeated());
      }
   }

   // Currently not called
   updateStart()
   {
      console.log(ln + "updateStart: start:" + this.editForm.value.startdate + " end:" + this.editForm.value.enddate);
   }

   // Currently not called
   updateEnd()
   {
      console.log(ln + "updateEnd: start:" + this.editForm.value.startdate + " end:" + this.editForm.value.enddate);
   }

   public onSubmit()
   {
      let t : Timer = this.mapFormToTimer();
      this.owitimerSvc.addTimer(t).subscribe({
         next: (res) => {
            console.log(ln + "onSubmit: next: result: %s", JSON.stringify(res));
         },
         error: (err) => {
            console.log(ln + "onSubmit: Error: %s", JSON.stringify(err, null, 2));
         },
         complete: () => {
            console.log(ln + "onSubmit: completed");
         }
       });
   }

   public onCancel()
   {
   }

   loadChannels()
   {
      console.log(ln + "loadChannels: Starting");

      this.owitimerSvc.getChannelList().subscribe({
         next: (res) => {
            console.log(ln + "loadChannels: next");
            this.channels = res;

            // Sucks to do this here but no idea how to get loadChannels to only
            // return when the channels are loaded so other initialization can be
            // done in the initialization method.
            this.mapTimerToForm(this.origTimer);
         },
         error: (err) => {
            console.log(ln + "loadChannels: Error: %s"), JSON.stringify(err, null, 2);
         },
         complete: () => {
            // console.log("TimerListComponent.loadTimers: completed");
         }
       });

      console.log(ln + "loadChannels: Finished");
   }

   mapRepeatedToDays(rep : number)
   {
      // algorithm from ajax version.
      // TODO: use the bit values to determine if the day is repeated
      // so not dependant on the order of the days in the list.
      let flags : number = rep;
      for (var i=0; i<7; i++)
      {
         this.repdays[i].repeaton = ((flags & 1)==1);
         flags >>= 1;
      }
   }

   mapDaysToRepeated() : number
   {
      let repeats : number = 0;
      for (var i=0; i<7; i++)
      {
         if(this.repdays[i].repeaton)
         {
            repeats = repeats | this.repdays[i].bit;
         }
      }
      return repeats;
   }

   mapFormToTimer() : Timer
   {
      let timer : Timer = new Timer();
      let startd : Date = new Date(this.editForm.value.startdate);
      let endd : Date = new Date(this.editForm.value.enddate);
      console.log(ln + "mapFormToTimer: channelid: %s", JSON.stringify(this.editForm.value.channelid));

      timer.serviceref = this.editForm.value.channelid.servicereference;
      timer.servicename = this.editForm.value.channelid.servicename;
      timer.name = this.editForm.value.timername;
      timer.repeated = this.mapDaysToRepeated();
      timer.begin = startd.getTime();
      timer.end = endd.getTime();
      timer.sunx = startd.getTime();
      timer.eunx = endd.getTime();

      if(this.origTimer != undefined)
      {
         timer.refold = this.origTimer.serviceref;
         timer.startold = this.origTimer.begin;
         timer.stopold = this.origTimer.end;
      }
      console.log(ln + "mapFormToTimer: timer: %s", JSON.stringify(timer));
      return timer;
   }

   mapTimerToForm(timer : Timer | undefined)
   {
     if(timer)
     {
         let sd = this.utils.getDateFromSTBValue(timer.begin);
         let ed = this.utils.getDateFromSTBValue(timer.end);

         // MUST use one of the Channel objects from the array, creating new one
         // with same values does not work!
         // let chan : Channel = new Channel(timer.servicename, timer.serviceref);
         let chan : Channel | undefined = this.mapTimerToChannel(timer);
         console.log(ln + "mapTimerToForm: chan:%s", JSON.stringify(chan));
         this.editForm.setValue({
            channelid : chan,
            timername : timer.name,
            startdate : sd,
            enddate : ed
            });
         this.mapRepeatedToDays(timer.repeated);

      }
   }

   mapTimerToChannel(timer : Timer | undefined) : Channel | undefined
   {
      let chan : Channel | undefined = undefined;
      if(timer != undefined)
      {
         // console.log(ln + "mapTimerToChannel: channels: %s", JSON.stringify(this.channels));
         chan = this.channels.find(c => c.servicereference == timer.serviceref);
      }
      return chan;
   }
}
