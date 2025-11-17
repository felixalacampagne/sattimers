import { Channel } from "./channel.model";

export class Service
{
   public servicename: string='';
   public subservices: Channel[] = []
}

export class ChannelList
{
   public result : boolean = false;
   public services : Service[] = [];  // Appears to be the 'bouquet' name
}