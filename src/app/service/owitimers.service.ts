import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimerList } from '../model/timerlist.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OWITimersService 
{
   private serverhost : string = "";
   private apiurl : string ='';
   private apiapp : string = "";
   private timerlistsvc : string ="timerlist";
   private timereditsvc : string ="timeredit";


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
   console.log("OWITimersService: API url: " + this.apiurl);
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
     return this.http.get(url).pipe( map((res:any) => res));
  }  
}
