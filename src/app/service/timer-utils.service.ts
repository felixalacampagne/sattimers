// src/app/service/timer-utils.service.ts
import { Injectable } from "@angular/core";
import { Timer } from "../model/timer.model";


@Injectable({
   providedIn: 'root'
 })
 export class TimerUtilsService 
 {

gDaysShort : string [] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];  
gMonths  : string [] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
   
   constructor()
   {
   }
 
// owiDate - date in OpenWebIF format, ie. seconds since the epoch instead of milliseconds
public formatTimerDate(owiDate : number){
   
   let epochtime : number = Math.round(owiDate) * 1000;

   // This does not appear to be giving a Date which causes formatDate to fail wtih
   // the claim that getDay() is not a function - obviously it is a forking function.
   // THe log output of the date is a number - should be a formatted date string.
   let date : Date = new Date(epochtime); 
   //console.log("formatTimerDate: owiDate:" + owiDate + " epochtime:" + epochtime + " date:" + date);
   return this.formatDate(date);
}

public formatTimerTime(owiDate : number){
   let epochtime : number = Math.round(owiDate) * 1000;

   // This does not appear to be giving a Date which causes formatDate to fail wtih
   // the claim that getDay() is not a function - obviously it is a forking function.
   // THe log output of the date is a number - should be a formatted date string.
   let date : Date = new Date(epochtime); 
   //console.log("formatTimerTime: owiDate:" + owiDate + " epochtime:" + epochtime + " date:" + date);
   return this.formatTime(date);
}

public formatDate(d: Date)
{
   //console.log("formatDate: d:" + d);
   let dispdate : string = "";
   let idx : number;
   // browser claims dateObj.getDay is not a function
   idx = d.getDay();
   // dispdate += this.zeropad(d.getHours(), 2);
   // dispdate += ":" + this.zeropad(d.getMinutes(), 2); 
   dispdate += "" + this.gDaysShort[idx]; 
   dispdate += " " + this.zeropad(d.getDate(), 2);
   dispdate += "-" + this.zeropad(d.getMonth()+1, 2);
   dispdate += "-" + this.zeropad(d.getFullYear()-2000, 2);

   // dispdate += " " + this.gMonths[d.getMonth()];
   //dispdate += " " + d.getFullYear();

   
   
   return dispdate; //date.toLocaleString(); 
}

public formatTime(d: Date) : string
{
   let dispdate : string = "";
   dispdate += this.zeropad(d.getHours(), 2);
   dispdate += ":" + this.zeropad(d.getMinutes(), 2);  
   return dispdate;  
}

zeropad(num : number, cnt : number)
{
	let pad : string = num.toString();
   pad = pad.padStart(cnt, '0');
	return pad;
}

public repeatedDays(t: Timer) : string {
   let flags=t.repeated;
   let repeateddays: string [] = [];
   
   for (var i=0; i<8; i++) 
   {
      if(flags & (1<<i))
      {
         repeateddays.push(this.gDaysShort[(i+1) % 7]);
      }
   }
   return repeateddays.join(",");
}

}
