// src/app/service/owitimers.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimerList } from '../model/timerlist.model';
import { environment } from '../../environments/environment';
import { Timer } from '../model/timer.model';
import { Channel } from '../model/channel.model';
import { ChannelList, Service } from '../model/channellist.model';

const ln  = "OWITimersSvc.";

@Injectable({
  providedIn: 'root'
})
export class OWITimersService {

   private serverhost : string = "";
   private apiurl : string ='';
   private apiapp : string = "";
   private timerlistsvc : string ="timerlist";  // this is a page
   private timereditsvc : string ="timeredit";  // this is a page
   private timerdeletesvc : string = "timerdelete"; // this is an api call
   private timeraddsvc = "timeradd";                // this is an api call
   private channelsvc = "getallservices";           // api call to list channels


   constructor(private http : HttpClient)
   {
      // If host value is not given by environment then should assume api
      // is on same server as frontend. Frontend server can be obtained from
      // window.location.hostname, window.location.pathname
      // WARNING! need to allow for the port, not sure if it is included in the hostname value.
      // window.location
      //    .host     gives server and port (in theory)
      //    .origin   gives the protocol, hostname and port number of a URL
      if((typeof environment.api_host !== 'undefined') && (environment.api_host))
      {
            this.serverhost = environment.api_host;
      }
      else
      {
         this.serverhost = window.location.origin;
      }
      this.apiapp = environment.folder + environment.api_app;
      this.apiurl = this.serverhost + this.apiapp
      console.log(ln + "<init>: API url: %s", this.apiurl);
   }

   getTimerList() : Observable<TimerList>
   {
      let url : string;
      url = this.apiurl + this.timerlistsvc;
      // this fails when the client pages are not served from the sat box: CORS shirt designed to prevent
      // normal users from doing anything useful with the code.
      // The sat box server does actually set the allowed origin to be anything ('*') but apparently
      // the browser deliberatly rejects this as a valid response, even though it is a valid response.
      // The only suggestion of a workaround for this might be to add '{ withCredentials: false }' to the get, after the
      // url. All other so-called solutions require changes to the server, which obviously can't be done when trying
      // to access a 'public' web api.
      return this.http.get(url, {params: {nocache: this.nocacheval()}, responseType: 'text'})
         .pipe( map((res:string) => this.stripAngular20GarbageFromResponse(res)) );
   }

   // Following "upgrade" to Angular20 the JSON data in the repsonse from 'ng serve'
   // has a block of base64 appended to it which makes the repsonse unparsable. I have been
   // unable to find any reference to this behaviour in the "documentation". The only workaround
   // so far is to force angular to handle the repsonse as plain text and then remove
   // the garbage at the end and then try to parse as JSON. The garbage is not present
   // when the data is served from the SR.
   //
   // The appended garbage starts with '//#\nsourceMappingURL='. If that pattern
   // appears in the JSON then the workaround will not work - it is quite unlikely
   // that it will appear in timer data.
   // Why do they do this shirt - what possible point can there be to corrupting the
   // response data like this????
   stripAngular20GarbageFromResponse(res : any) : any
   {
      //console.log("stripAngular20GarbageFromResponse: original: %s", res);
      const regex = /\s\/\/#\s*sourceMappingURL=.*$/sg;
      let resupd : any = res.replace(regex, "");

      // Confirmed: garbage is not present in data from SR.
      // if(res == resupd)
      // {
      //    console.log("stripAngular20GarbageFromResponse: Garbage FREE response received!!!");
      // }
      return JSON.parse(resupd);
   }

   deleteTimer(timer : Timer) : Observable<String>
   {
      let url : string;
      let htparams : HttpParams = new HttpParams();
      let svcref : string = timer.serviceref ?? '';
      url = this.apiurl + this.timerdeletesvc;

      htparams = htparams.append("sRef", svcref);
      htparams = htparams.append("begin", timer.begin); // No divide by 1000 ??
      htparams = htparams.append("end", timer.end);
      htparams = htparams.append("nocache", this.nocacheval());

      return this.http.get(url, {params: htparams}).pipe( map((res:any) => res));
   }

   addTimer(timer : Timer) : Observable<string>
   {
      let url : string =  this.apiurl + this.timeraddsvc;
      let htparams : HttpParams = new HttpParams();

      let owiBegin : number = timer.begin;
      let owiEnd : number = timer.end;
      let svcref : string = timer.serviceref ?? '';  // Should not be null - but let caller handle that

      htparams = htparams.append("sRef", svcref);
      htparams = htparams.append("begin", owiBegin);
      htparams = htparams.append("end", owiEnd);
      htparams = htparams.append("name", timer.name ?? '');
      htparams = htparams.append("repeated", timer.repeated);

      if( timer.refold == undefined )
      {
         htparams = htparams.append("channelOld", svcref);
         htparams = htparams.append("beginOld", owiBegin);
         htparams = htparams.append("endOld", owiEnd);
      }
      else
      {
         htparams = htparams.append("channelOld", timer.refold);
         htparams = htparams.append("beginOld", timer.startold);
         htparams = htparams.append("endOld", timer.stopold);
      }

      htparams = htparams.append("afterevent", 0);
      htparams = htparams.append("nocache", this.nocacheval());

      return this.http.get(url, {params: htparams}).pipe( map((res:any) => res));
   }

   nocacheval() : number
   {
      return Date.now();
   }

   getChannelList() : Observable<Channel[]>
   {
      let url : string;

      url = this.apiurl + this.channelsvc;

      return this.http.get(url, {params: {nocache: this.nocacheval()}, responseType: 'text'})
         .pipe( map((res:any) =>
         {
            res = this.stripAngular20GarbageFromResponse(res);

            let channels : Channel[] = [];
            let bouquet : string = "Favourites (TV)";
            // console.log(ln + "getChannelList: result: %s", JSON.stringify(res));
            let services : ChannelList = res;
            for (var id in services.services)
            {
               let service : Service = services.services[id];
               if(service.servicename == bouquet)
               {
                  channels = service.subservices;
                  break;
               }
            }
            return channels;
         }));
   }
}
