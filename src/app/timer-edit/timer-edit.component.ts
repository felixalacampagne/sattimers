import { Component, EventEmitter, Injectable, Input, Output, signal } from '@angular/core';
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
      // if( "" + displayFormat == "HH:mm")
      // {
      //    ret = this.dateFmt.format(date, ""+displayFormat);
      //    // console.log("FormatingDateAdapter.format: date=" + date + " displayFormat=" + displayFormat + " return:" + ret);
      // }
      // else
      // {
      //    ret = this.dateFmt.pickerFormat(date) ?? '';
      // }
      // //console.log("FormatingDateAdapter.format: ret=" + ret);
      return ret;
   }
}



// A MAT_DATE_FORMATS MUST be provided but in fact it isn't used by any
// of the default angular code and it isn't used by my code either.
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
   @Input() origTimer: Timer | undefined;
   @Output() public submittedEvent = new EventEmitter();

   // This is from https://material.angular.dev/components/checkbox/overview
   // Don't need the days to be nested but don't know how to specify the signal thing to be
   // an array of repeat days (or what the signal is actually for!!)
   // The Angular docs example uses a signal to wrap the repdays equivalent, except in the example
   // it is a single array containing an object with a nested array. I don't need a nested array,
   // just a simple array. Replacing the object with an array in the signal statement, ie. signal<RepeatDay[]>
   // compiles OK and appears to display OK but clicking on a checkbox gives an incomprehensible error
   // in the console which appears to be related to the for loop inthe HTML which is used to build the display.
   // Needless to say the documentation contains nothing regarding this 'signal' or how it might be used in
   // a more realistic scenario where just an array is required. Since the purpose of the signal is
   // a complete mystery to me, it is not required for the update function to be called, I have removed
   // it and now the console errors have gone away.


   // readonly repdays = signal<RepeatDay[]>(
   // when signal<[]> is used HTML loop to build the checkbox display
   // @for (repday of repdays(); track repday; let i = $index)
   // gives an error when a checkbox is clicked. The solution appears to be to
   // remove the signal, this is no loss as it serves no known purpose.
   readonly repdays =
      [
         { name: 'Mo', repeaton: false },
         { name: 'Tu', repeaton: false },
         { name: 'We', repeaton: false },
         { name: 'Th', repeaton: false },
         { name: 'Fr', repeaton: false },
         { name: 'Sa', repeaton: false },
         { name: 'Su', repeaton: false }
      ];

   editForm : FormGroup;
   channels : Channel[] = [
      new Channel("Chan1", "1111189;981;98;89;;981;"),
      new Channel("Chan2", "987;98:978;987;987;98;;;897")
   ];
   constructor()
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

      this.editForm.patchValue({
         startdate: dnow,
         enddate: dnow
      });
   }
   // I think this just echoes the setting of the checkbox into the repdays array.
   // Eventually the repdays array needs to be mapped onto a single integer value.
   // Also the settings of the checkboxes need to be initialised to the input repeated value


   update(repeaton: boolean, index?: number)
   {
      // this.repdays.update(repday => {
      //    if(index)
      //    {
      //       repday[index].repeaton = repeaton;
      //    }
      //    return {...repday};
      // });
      if(index)
      {
         this.repdays[index].repeaton = repeaton;
      }
    }

   updateStart()
   {
      console.log("updateStart: start:" + this.editForm.value.startdate + " end:" + this.editForm.value.enddate);
   }

   updateEnd()
   {
      console.log("updateEnd: start:" + this.editForm.value.startdate + " end:" + this.editForm.value.enddate);
   }

   public onSubmit()
   {
   }

   public onCancel()
   {
   }
}
