import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
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
   ReactiveFormsModule,
   FormsModule],
  templateUrl: './timer-edit.component.html',
  styleUrl: './timer-edit.component.scss'
})
export class TimerEditComponent {
   @Input() origTimer: Timer | undefined;
   @Output() public submittedEvent = new EventEmitter();

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
         starttime: new FormControl('', Validators.required),
         endtime: new FormControl('', Validators.required),
         timername: new FormControl('', Validators.required),
         repeats: new FormControl('', Validators.required),
         channelid: new FormControl(this.channels[0], Validators.required)  // dowpdown list of types as shown in transaction
       });
   }

   public onSubmit()
   {
   }

   public onCancel()
   {
   }
}
