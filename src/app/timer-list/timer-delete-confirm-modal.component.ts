// src/app/timer-list/timer-delete-confirm-modal.component.ts

// copilot generated base boilerplate 
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface TimerDeleteDialogData {
   timerName: string;
}

@Component({
   selector: 'timer-delete-confirm-modal',
   template: `
      <h1 mat-dialog-title>Delete Timer</h1>
      <div mat-dialog-content>
         <p>Are you sure you want to delete the timer "{{ data.timerName }}"?</p>
      </div>
      <div mat-dialog-actions align="end">
         <button mat-button (click)="onCancel()">Cancel</button>
         <button mat-raised-button color="warn" (click)="onDelete()">Delete</button>
      </div>
   `
})
export class TimerDeleteConfirmModalComponent {
   constructor(
      public dialogRef: MatDialogRef<TimerDeleteConfirmModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: TimerDeleteDialogData
   ) {}

   onCancel(): void {
      this.dialogRef.close(false);
   }

   onDelete(): void {
      this.dialogRef.close(true);
   }
}