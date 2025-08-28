// src/app/timer-list/timer-delete-confirm-modal.component.ts

// copilot generated base boilerplate 
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { Timer } from '../model/timer.model';
import { TimerUtilsService } from '../service/timer-utils.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TimerDeleteDialogData {
   timerName: string;
}

@Component({
   selector: 'timer-delete-confirm-modal',
   imports: [
      MatCardModule,
      MatIconModule,
      MatButtonModule
   ],   
   template: `
   <mat-card appearance="outlined">
      <mat-card-header> 
         <mat-card-title>
            <div class="title-card-left">Delete Timer</div>
            <div class="title-card-right">
               <button mat-icon-button class="small close-button" (click)="onCancel()">
                  <mat-icon fontSet="material-symbols-rounded">close</mat-icon>
               </button>
            </div>
            </mat-card-title>      
      </mat-card-header>

      <mat-card-content>
            <strong>
            <span style="text-align: center">{{data.name}}<BR> 
            {{utils.formatTimerDate(data.begin)}} {{utils.formatTimerTime(data.begin)}}</span>
         </strong>
       
      </mat-card-content>
      <mat-card-actions align='end'>
         <button mat-stroked-button class="action-button" type="reset" (click)="onCancel()">Cancel</button>
         <button mat-flat-button class="mat-error action-button" type="submit" (click)="onDelete()">Delete</button>
      </mat-card-actions>

   `,
   styleUrls: ['../../styles.scss',
      './timer-list.component.scss'
   ]
})
export class TimerDeleteConfirmModalComponent {
   constructor(
      public dialogRef: MatDialogRef<TimerDeleteConfirmModalComponent>,
      public utils: TimerUtilsService,
      @Inject(MAT_DIALOG_DATA) public data: Timer
   ) {}

   onCancel(): void {
      this.dialogRef.close(false);
   }

   onDelete(): void {
      this.dialogRef.close(true);
   }
}
