// src/app/service/owitimers.service.ts
import { HttpClient } from '@angular/common/http';
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
      url = this.apiurl + this.timerlistsvc  + this.nocache("?");;
      // this fails when the client pages are not served from the sat box: CORS shirt designed to prevent
      // normal users from doing anything useful with the code.
      // The sat box server does actually set the allowed origin to be anything ('*') but apparently
      // the browser deliberatly rejects this as a valid response, even though it is a valid response.
      // The only suggestion of a workaround for this might be to add '{ withCredentials: false }' to the get, after the
      // url. All other so-called solutions require changes to the server, which obviously can't be done when trying
      // to access a 'public' web api.
      return this.http.get(url, {responseType: 'text'}).pipe(
         map((res:string) => this.stripAngular20GarbageFromResponse(res))
      );
   }

   // Following "upgrade" to Angular20 the JSON data in the repsonse has a block of
   // base64 appended to it which makes the repsonse unparsable. I have been unable to
   // find any reference to this behaviour in the "documentation". The only workaround
   // so far is to force angular to handle the repsonse as plain text and then remove
   // the garbage at the end and then try to parse as JSON.
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

      if(res == resupd)
      {
         console.log("stripAngular20GarbageFromResponse: Garbage FREE response received!!!");
      }
      return JSON.parse(resupd);
   }

   deleteTimer(timer : Timer) : Observable<String>
   {
      let url : string;
      let params : string
      url = this.apiurl + this.timerdeletesvc;

      params = "sRef=" + timer.serviceref;
      params = params + "&begin=" + timer.begin;
      params = params + "&end=" + timer.end;
      params = params + this.nocache("&");

      url = url + "?" + params;
      return this.http.get(url).pipe( map((res:any) => res));
   }

   addTimer(timer : Timer) : Observable<string>
   {
      let url : string =  this.apiurl + this.timeraddsvc;

      // let params : string
      // params = "sRef=" + timer.serviceref;
      // params = params + "&begin=" + timer.begin;
      // params = params + "&end=" + timer.end;
      // params = params + this.nocache("&");

      var owiBegin = timer.begin/1000;
      var owiEnd = timer.end/1000;

      var owiparams = "sRef=" + escape("" + timer.serviceref);
      owiparams+= "&begin=" + owiBegin;
      owiparams+= "&end=" + owiEnd;
      owiparams+= "&name=" + escape("" + timer.name);
      owiparams+= "&repeated=" + timer.repeated;

      if( timer.refold == undefined )
      {
         owiparams+= "&channelOld=" + escape("" + timer.serviceref);
         owiparams+= "&beginOld=" + owiBegin;
         owiparams+= "&endOld=" + owiEnd;
      }
      else
      {
         owiparams+= "&channelOld=" + escape("" + timer.refold);
         owiparams+= "&beginOld=" + timer.startold;
         owiparams+= "&endOld=" + timer.stopold;
      }

      owiparams+= "&afterevent=0";

      url += "?" + owiparams + this.nocache("&");
      return this.http.get(url).pipe( map((res:any) => res));
   }

   nocache(pfx : string)
   {
      // Can't simply append this to every URL as the prefix depends on
      // whether there are already parameters. So simpler to get the caller to
      // figure it out
      var nocache=new Date().getTime();
      return pfx + "nocache=" + nocache;
   }

   getChannelList() : Observable<Channel[]>
   {
      let url : string;

      url = this.apiurl + this.channelsvc  + this.nocache("?");;

      return this.http.get(url, {responseType: 'text'}).pipe( map((res:any) =>
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
