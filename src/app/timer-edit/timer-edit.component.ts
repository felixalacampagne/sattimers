import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
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

   override parse(value: any, parseFormat: any): Date {
      //console.log("FormatingDateAdapter.format: value=" + value + " parseFormat=" + parseFormat);

      return this.dateFmt.parseDateString(value);
   }
   override format(date: Date, displayFormat: Object): string
   {
      let ret : string;
      ret = this.dateFmt.pickerFormat(date) ?? '';
      //console.log("FormatingDateAdapter.format: ret=" + ret);
      return ret;
   }
}


// A MAT_DATE_FORMATS MUST be provided but in fact it isn't used by any
// of the default angular code and it isn't used by my code either.
export const ISO_DATE_FORMAT : MatDateFormats = {
   parse: {
     dateInput: 'yyyy-MM-dd',
   },
   display: {
     dateInput: 'yyyy-MM-dd',
     monthYearLabel: 'MMM yyyy',
     dateA11yLabel: 'LL',
     monthYearA11yLabel: 'MMMM yyyy'
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
   MatIconModule,
   ReactiveFormsModule],
  templateUrl: './timer-edit.component.html',
  styleUrl: './timer-edit.component.scss'
})
export class TimerEditComponent {
   @Input() origTimer: Timer | undefined;
   @Output() public submittedEvent = new EventEmitter();

   editForm : FormGroup;
   channels : Channel[] = [];
   constructor()
   {
      this.editForm = new FormGroup({
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
