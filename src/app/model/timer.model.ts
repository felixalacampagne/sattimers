// src/app/model/timer.model.ts
export class Timer
{
   public serviceref: string | null = null;
   public begin: number = 0;
   public end : number = 0;
   public name: string | null = null;
   public servicename: string | null = null;
   public repeated : number = 0;
   public sunx: number = 0;
   public eunx : number = 0;
   public state : number = 0;
   public refold: any;
   public startold: any;
   public stopold: any;
}
