// src/app/service/timer-utils.service.ts
import { Injectable } from "@angular/core";


@Injectable({
   providedIn: 'root'
 })
 export class TimerUtilsService 
 {
   constructor()
   {
   }
 
// owiDate - date in OpenWebIF format, ie. seconds since the epoch instead of milliseconds
public formatTimerDate(owiDate : number){
   
   var epochtime = Math.round(owiDate) * 1000;
   var date = new Date(epochtime);
   return this.formatDate(date);
}
public formatDate(dateObj: Date)
{
var dispdate;
   dispdate = "" + gDaysShort[dateObj.getDay()]; 
   dispdate += " " + zeropad(dateObj.getDate(),2);
   dispdate += " " + gMonths[dateObj.getMonth()];
   dispdate += " " + dateObj.getFullYear();
   // TODO find out whether getHours is local time or UTC
   
   dispdate += " " + zeropad(dateObj.getHours(),2);
   dispdate += ":" + zeropad(dateObj.getMinutes(),2); 
   
   
   return dispdate; //date.toLocaleString(); 
}
 
}