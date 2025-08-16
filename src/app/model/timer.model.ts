// src/app/model/timer.model.ts
export class Timer
{
   public serviceref: string | undefined;
   public begin: number = 0;
   public end : number = 0;
   public name: string | undefined;
   public servicename: string | undefined;
   public repeated : number = 0;
   public sunx: number = 0;
   public eunx : number = 0;
   public refold: any;
   public startold: any;
   public stopold: any;
}
