export abstract class Logging
{
abstract fn : string;
   public log(message?: any, ...optionalParams: any[])
   {
      console.log(this.fn + "." + message, ...optionalParams);
   }
   public fmsg(message: string) : string
   {
      return this.fn + "." + message;
   }
}