import { Component, EventEmitter, inject, Injectable, input, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DateformatService } from '../service/dateformat.service';
import { Timer } from '../model/timer.model';
import { Channel } from '../model/channel.model';
import { OWITimersService } from '../service/owitimers.service';
import { TimerUtilsService } from '../service/timer-utils.service';
import { lastValueFrom, tap } from 'rxjs';

// see https://date-fns.org/v4.1.0/docs/Getting-Started for the date functions
import { add, format, isBefore, roundToNearestMinutes, setHours, setMinutes, startOfDay } from "date-fns"; // requires 'npm install date-fns --save'
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

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
   MatButtonToggleModule,
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
   submitInProgress: boolean = false;

   private snackBar = inject(MatSnackBar); // new way instead of putting in constructor

   constructor(
      private owitimerSvc: OWITimersService,
      private utils : TimerUtilsService,
      private router: Router
   )
   {
      this.editForm = new FormGroup({
         startdate: new FormControl<Date>(new Date(), Validators.required),
         starttime: new FormControl<Date>(new Date(), Validators.required),
         endtime: new FormControl<Date>(new Date(), Validators.required),
         timername: new FormControl<string>('', Validators.required),
         channelid: new FormControl(this.channels[0], Validators.required)
       });

       let fc : FormControl<any>;
       fc = this.editForm.controls["startdate"] as FormControl;
       fc.valueChanges.subscribe(x => this.updateStartDate(x));

       fc = this.editForm.controls["starttime"] as FormControl;
       fc.valueChanges.subscribe(x => this.updateStartTime(x));

       fc = this.editForm.controls["endtime"] as FormControl;
       fc.valueChanges.subscribe(x => this.updateEndTime(x));
   }

   ngOnInit()
   {
      let dnow = new Date();
      dnow = this.roundstartTime(dnow);
      let dend = add(dnow, {hours:1, minutes:5});
      this.editForm.patchValue({
         startdate: startOfDay(dnow),
         starttime: dnow,
         endtime: dend
      });
      this.initForm();
   }

   // async, await, lastValueFrom and pipe/tap allow the HTTP response
   // to be loaded synchronously which makes the code easier to read as
   // the flow is not buried in inumerable subscribe blocks.
   // Not too sure how it works or what the downsides might be but so far
   // the evidence is that it does just what I need...
   async initForm()
   {
      console.log(ln + "initForm: start");
      this.origTimer = this.utils.pullTimerToEdit();

      console.log(ln + "initForm: loadchans pre-load: %d", this.channels.length);
      await this.loadChannels();
      console.log(ln + "initForm: loadchans post-load: %d", this.channels.length);
      this.mapTimerToForm(this.origTimer);
      console.log(ln + "initForm: done");
   }

   async loadChannels()
   {
      return await lastValueFrom(this.owitimerSvc.getChannelList()
         .pipe(tap(res => {
            console.log(ln + "loadChannels: pipe-tap");
            this.channels = res;
         })));
   }

   async deleteTimer(timer : Timer)
   {
      return await lastValueFrom(this.owitimerSvc.deleteTimer(timer)
         .pipe(tap(res => {
            console.log(ln + "deleteTimer: pipe-tap: res:%s", JSON.stringify(res));
         }
      )));
   }

   // Apparently there are no events raised by the controls in the HTML
   // FormControls.valueChanges.subscribe can be used to detect when a change is
   // being made but the value passed in is not the actual value being applied
   // to the date. When startdate is a CET value with a time - when the date control
   // is changed 'event' is a UTC date of the CET midnight value, ie. the day before!,
   // and when the time field is changed the time part is the UTC equivalent of the
   // chosen time as CET but the date part is for 'today', not the actual date of the control.
   // Confused, I sure as hell am!!
   // Looks like I'll have to do my own date/time handling, which is obviously something I
   // wanted to avoid and actually what the forking libraries are supposed to do for me!
   // Yet again I wonder why the fork I bother with the angular stuff!!!
   updateStartDate(event : any)
   {
      let d : Date = new Date( Date.parse(String(event)));
      let st : Date = this.editForm.value.starttime;
      let newstart : Date = this.calcStartDatetime(d, st);
      let newend : Date = this.calcEndDatetime(newstart, st, this.editForm.value.endtime);

      console.log(ln + "updateEndTime:"
         + " start: " + this.formatDateTime(newstart)
         + " end: " + this.formatDateTime(newend)
      );
   }

   updateStartTime(event : any)
   {
      let sevent: string = String(event);
      if(sevent == 'Invalid Date')
      {
         return;
      }
      let t : Date = new Date( Date.parse(sevent));

      let sd = this.editForm.value.startdate;
      let newstart : Date = this.calcStartDatetime(sd, t);
      let end : Date = this.calcEndDatetime(sd, t, this.editForm.value.endtime);
      console.log(ln + "updateStartTime:"
         + " start: " + this.formatDateTime(newstart)
         + " end: " + this.formatDateTime(end)
      );
   }

   updateEndTime(event : any)
   {
      let sevent: string = String(event);
      if(sevent == 'Invalid Date')
      {
         return;
      }
      let t : Date = new Date( Date.parse(sevent));
      console.log(ln + "updateEndTime:"
         + " event: " + t
      );
      let sd : Date = this.editForm.value.startdate;
      let st : Date = this.editForm.value.starttime;

      let curstart : Date = setMinutes(setHours(sd, st.getHours()), st.getMinutes());
      let newend : Date = this.calcEndDatetime(sd, st, t);

      console.log(ln + "updateEndTime:"
         + " start: " + this.formatDateTime(curstart)
         + " end: " + this.formatDateTime(newend)
      );
   }

   checkStartTime()
   {
      let st : Date = this.editForm.value.starttime;
      let rd = this.roundstartTime(st);
      this.editForm.patchValue({starttime: rd});
   }

   checkEndTime()
   {
      let et : Date = this.editForm.value.endtime;
      let rd = this.roundendTime(et);
      this.editForm.patchValue({endtime: rd});
   }

   roundstartTime(starttime : Date) : Date
   {
      // see https://date-fns.org/v4.1.0/docs/Getting-Started for the date functions
      let rd = roundToNearestMinutes(starttime, {nearestTo: 5, roundingMethod: 'floor'});
      console.log(ln + "roundstartTime: orig: %s rounded: %s", this.formatTime(starttime), this.formatTime(rd));
      return rd;
   }

   roundendTime(endtime : Date) : Date
   {
      let rd = roundToNearestMinutes(endtime, {nearestTo: 5, roundingMethod: 'ceil'});
      console.log(ln + "roundstartTime: orig: %s rounded: %s", this.formatTime(endtime), this.formatTime(rd));
      return rd;
   }

   calcStartDatetime(startdate : Date, starttime : Date) : Date
   {
      let start : Date = setMinutes(setHours(startdate, starttime.getHours()), starttime.getMinutes());
      return start;
   }

   calcEndDatetime(startdate : Date, starttime : Date, endtime : Date) : Date
   {
      let start : Date = setMinutes(setHours(startdate, starttime.getHours()), starttime.getMinutes());
      let end : Date = setMinutes(setHours(startdate, endtime.getHours()), endtime.getMinutes());
      if( isBefore(end, start) )
      {
         // Assume enddate is tomorrow
         end = add(end, {days: 1});
      }
      return end;
   }

   formatDateTime(dt : Date) : string
   {
      return format(dt, "yy-MM-dd HH:mm");
   }

   formatDate(d : Date) : string
   {
      return format(d, "yy-MM-dd");
   }
   formatTime(t : Date) : string
   {
      return format(t, "HH:mm");
   }

   // Modifying/adding a timer is more complex than it should be. The ajax code
   // does a delete and change and if that fails it tries to add. Don't know what
   // the difference between change and add is given that change alone does not seem
   // to work - probably because it seems to be keyed on svcref, start, stop so an
   // adjustment to the time causes it to be treated as a new timer, regardless of the old
   // settings, it seems.
   // This means the submit needs to know if it is expected to be updating or adding.
   // This will be determined by the state of origTimer -> timer.refold
   //
   // The SR does weird things when a timer is simply updated, eg.
   // changing start time results in a timer with the new time but one week in the
   // future compared to the original timer. I guess this explains why the ajax code
   // does a delete first.
   //
   // When timer is deleted first the timerchange api returns an error saying it
   // can't find the timer with the given start and end time!
   // So it looks like it does NOT use the old references to identify the timer being
   // changed in which case anything to do with the old references can be dropped!
   // It also suggests that the ajax code always failed on the timerchange and
   // therefore always performed the timeradd (hard to tell without the console logs
   // due to all the callbacks)
   async changeTimerSync()
   {
      let t : Timer = this.mapFormToTimer();
      let params : HttpParams = this.owitimerSvc.buildModifyTimerParams(t);


      if(this.origTimer != undefined)
      {
         // Major problem with this when the updated timer has a conflict with existing
         // timer because the original timer is deleted before the conflict is reported.
         // No clue how to workaround that at the moment: maybe use refOld to add it back?

         console.log(ln + "changeTimerSync: deleting old timer");
         // TODO Need to catch an error if the delete fails
         await this.deleteTimer(this.origTimer);
         console.log(ln + "changeTimerSync: adding updated timer");
      }
/*
Conflicts look like this:
TimerEditCmp.changeTimerSync: add: next: result: {"result":false,"message":"Conflicting Timer(s) detected! Conflicting timer / Summerwater 25-11-23 1x04 Episode 04 / Prisoner 951 25-11-23 1x01 Episode 01","conflicts":[{"serviceref":"1:0:19:5104:841:2:11A0000:0:0:0:","servicename":"ITV1 HD","name":"Conflicting timer","begin":1763931000,"end":1763935200,"realbegin":"23.11.2025 21:50","realend":"23.11.2025 23:00"},{"serviceref":"1:0:19:1452:7F2:2:11A0000:0:0:0:","servicename":"Channel 4 HD","name":"Summerwater 25-11-23 1x04 Episode 04","begin":1763931000,"end":1763936400,"realbegin":"23.11.2025 21:50","realend":"23.11.2025 23:20"},{"serviceref":"1:0:19:1B13:802:2:11A0000:0:0:0:","servicename":"BBC One SE HD","name":"Prisoner 951 25-11-23 1x01 Episode 01","begin":1763931001,"end":1763937000,"realbegin":"23.11.2025 21:50","realend":"23.11.2025 23:30"}]}
*/
      this.owitimerSvc.addTimer(params).subscribe({
         next: (res) => {
            console.log(ln + "changeTimerSync: add: next: result: %s", JSON.stringify(res));
            // This is probably not the best way to do it but I cannot find any way
            // to abort the subscription from within the next processing so it will have
            // to do for now.
            if(!res.result)
            {
               this.showStatus(res.message, "Close");
            }
            else
            {
               this.router.navigate(["timerlist"]);
            }
         },
         error: (err) => {
            console.log(ln + "changeTimerSync: add: Error: %s", JSON.stringify(err, null, 2));
            this.showStatus(JSON.stringify(err), "Close");
            this.submitInProgress = false;
         },
         complete: () => {
            console.log(ln + "changeTimerSync: add: completed");
            this.submitInProgress = false;

         }
      });
   }

   public onSubmit()
   {

      // Should start an in progress spinner to indicate something is happening
      this.submitInProgress = true;


      console.log(ln + "onSubmit: changeTimerSync: call");
      this.changeTimerSync();
      console.log(ln + "onSubmit: changeTimerSync: return");
   }

   public onCancel()
   {
      // Wiil probably need to change this if I make the edit into a dialog
      this.router.navigate(["timerlist"]);
   }

   public submitDisabled() : boolean
   {
      return !this.editForm.valid || this.submitInProgress;
   }

   mapRepeatedToDays(rep : number)
   {
      for (var i=0; i<7; i++)
      {
         this.repdays[i].repeaton = ((this.repdays[i].bit & rep) != 0);
      }
   }


   // TODO This probably needs to change for button group as it does not
   // look like repdays can be modified when the buttons are clicked so
   // the state of the buttons needs to be used directly at submit time.
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
      let startd : Date = this.calcStartDatetime( //  new Date(this.editForm.value.startdate);
         this.editForm.value.startdate,
         this.editForm.value.starttime);
      let endd : Date = this.calcEndDatetime(     // new Date(this.editForm.value.enddate);
         this.editForm.value.startdate,
         this.editForm.value.starttime,
         this.editForm.value.endtime);
      console.log(ln + "mapFormToTimer: channelid: %s", JSON.stringify(this.editForm.value.channelid));

      timer.serviceref = this.editForm.value.channelid.servicereference;
      timer.servicename = this.editForm.value.channelid.servicename;
      timer.name = this.editForm.value.timername;
      timer.repeated = this.mapDaysToRepeated();
      timer.begin = startd.getTime() / 1000;
      timer.end = endd.getTime() / 1000;
      timer.sunx = startd.getTime();
      timer.eunx = endd.getTime();

      if(this.origTimer != undefined)
      {
         timer.refold = this.origTimer.serviceref;
         timer.startold = this.origTimer.begin;
         timer.stopold = this.origTimer.end;
      }
      else
      {
         timer.refold = undefined;
         timer.startold = undefined;
         timer.stopold = undefined;
      }
      console.log(ln + "mapFormToTimer: timer: %s", JSON.stringify(timer));
      return timer;
   }

   mapTimerToForm(timer : Timer | undefined)
   {
     if(timer)
     {
         // TODO: Ensure values are rounded to 5 mins.
         let sd = this.roundstartTime(this.utils.getDateFromSTBValue(timer.begin));
         let ed = this.roundendTime(this.utils.getDateFromSTBValue(timer.end));

         // MUST use one of the Channel objects from the array, creating new one
         // with same values does not work!
         // let chan : Channel = new Channel(timer.servicename, timer.serviceref);
         let chan : Channel | undefined = this.mapTimerToChannel(timer);
         console.log(ln + "mapTimerToForm: chan:%s", JSON.stringify(chan));
         this.editForm.setValue({
            channelid : chan,
            timername : timer.name,
            startdate : sd,
            starttime : sd,
            endtime : ed
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

   updateRepeat(repeaton : boolean, index : number)
   {
      this.repdays[index].repeaton = repeaton;
      console.log(ln + "toggleChange: index: %d repeaton: %s", index, this.repdays[index].repeaton);
   }

   showStatus(msg : string, action : string)
   {
      this.snackBar.open(msg, action);
   }
}
