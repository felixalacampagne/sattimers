// src/app/model/channel.model.ts

export class Channel
{
   public serviceref: string | null = null;
   public servicename: string | null = null;

   // TODO: How to do overloads?????
   constructor(servicename: string, serviceref: string)
   {
      this.serviceref = serviceref;
      this.servicename = servicename;
   }
}