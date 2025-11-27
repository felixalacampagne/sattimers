// src/app/model/timer.model.ts
export class Timer
{
   public serviceref: string | null = null;
   public begin: number = 0;   // Unix time / 1000, ie. seconds, not milliseconds
   public end : number = 0;    // Unix time / 1000, ie. seconds, not milliseconds
   public name: string | null = null;
   public servicename: string | null = null;
   public repeated : number = 0;
   public sunx: number = 0;
   public eunx : number = 0;
   public state : number = 0;
   public refold: any;
   public startold: any;
   public stopold: any;

   // WARNING: Cannot put functions here, eg. to convert the number to Dates
   // because the Timer objects created when data is recieved via HTTP
   // request do not have the the functions defined!!!!
}
