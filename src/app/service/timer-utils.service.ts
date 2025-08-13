// src/app/service/timer-utils.service.ts
import { Injectable } from "@angular/core";
import { Timer } from "../model/timer.model";
import { HttpParams } from "@angular/common/http";


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

public parseParamsToTimer(params: HttpParams) : Timer
{
   let timer : Timer = new Timer();
   var sref = "" + params.get("sref");
   let repeated : number =0;
   if(sref == "undefined")
   {
      // Something for the caller to check for success without needing to put Timer | null all over the place
      timer.serviceref = sref;
      return timer;
   }

   let stmp = "" + params.get("repeated");
   if(stmp == "undefined")
   {
      repeated = 0;
   }
   else
   {
      repeated = Number(stmp);
   }
   
   let name  = params.get("name");
   let sunx;
   let eunx;
   
   if((params.get("sunx") !== undefined) && (params.get("eunx") !== undefined) )
   {
      // This is the way the EPG sends the start/stop/times
      console.log("getTimerFromParams: Using unix date values");
      sunx = Number(params.get("sunx"));
      eunx = Number(params.get("eunx"));
   }
   else
   {
      // This is the way the timeredit form sends the start/stop times
      // Date will be interpreted using the local device time zone
      console.log("getTimerFromParams: Using component date values");
      sunx = new Date(
         Number(params.get("syear")), 
         Number(params.get("smonth"))-1, 
         Number(params.get("sday")), 
         Number(params.get("shour")), 
         Number(params.get("smin")),
         0).getTime();
      eunx = new Date(
         Number(params.get("eyear")), 
         Number(params.get("emonth"))-1, 
         Number(params.get("eday")), 
         Number(params.get("ehour")), 
         Number(params.get("emin")),
         0).getTime();
   }
   
   timer.sunx = sunx; // The original, unrounded value
   timer.eunx = eunx; // The original, unrounded value

   // Times must be a multiple of 5 otherwise problems occur in the edit screen due to the intervals of the 
   // minute dropdown list. Applying the rounding to the millisecond value allows the end time to be easily rounded UP
   var round = 5 * 60 * 1000;
   
   // Round start DOWN
   sunx = Math.floor(sunx / round) * round;
   
   // Round end UP
   eunx = Math.floor( (eunx + round - 1) / round) * round;
   
   var begin = new Date(sunx).getTime();
   var end = new Date(eunx).getTime();
         
   timer.serviceref = this.deEscape(sref);
   timer.repeated = repeated;
   timer.name = this.deEscape(name);
   timer.begin = begin;
   timer.end = end;
   // These are provided by the timeredit form. They are not provided by the EPG links
   var refold = "" + params.get("refOld");
   timer.refold = this.deEscape(refold);   // This should be "undefined" (text) if refOld is not present.
   
   timer.startold = params.get("startOld");
   timer.stopold = params.get("stopOld");
 
   return timer;
}

// Strings in the input URL contain spaces escaped as "+". These are not
// handled by the js unescape function so they need to be manually done.
// Applies to the timer name and the serviceref
deEscape(escaped : any) : string
{
var descaped = escaped.replace(/\+/g, ' ');
descaped = unescape(descaped); // converts hex to chars - deprecated but no alternative available!!!!!
return descaped;
}


}
