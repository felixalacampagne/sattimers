// src/app/service/timer-utils.service.ts
import { Injectable } from "@angular/core";


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
   return this.formatDate(date);
}
public formatDate(d: Date)
{
   console.log("formatDate: d:" + d);
   let dispdate : string;
   let idx : number;
   // browser claims dateObj.getDay is not a function
   idx = d.getDay();
   dispdate = "" + this.gDaysShort[idx]; 
   dispdate += " " + this.zeropad(d.getDate(),2);
   dispdate += " " + this.gMonths[d.getMonth()];
   dispdate += " " + d.getFullYear();
   dispdate += " " + this.zeropad(d.getHours(),2);
   dispdate += ":" + this.zeropad(d.getMinutes(),2); 
   
   
   return dispdate; //date.toLocaleString(); 
}

zeropad(num : number, cnt : number)
{
	let pad : string = "000000000000000000000000000000"+num;
	pad = pad.substr(pad.length-cnt, cnt);
	return pad;
}

}