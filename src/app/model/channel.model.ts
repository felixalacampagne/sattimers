// src/app/model/channel.model.ts

export class Channel
{
   public servicereference: string | null = null;
   public servicename: string | null = null;

   // TODO: How to do overloads?????
   constructor(servicename: string | null, serviceref: string | null)
   {
      this.servicereference = serviceref;
      this.servicename = servicename;
   }
}