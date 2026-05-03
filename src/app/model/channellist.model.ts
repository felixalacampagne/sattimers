import { Channel } from "./channel.model";

export class Bouquet
{
   public servicename: string='';
   public subservices: Channel[] = []
}

export class BouquetList  // Returned by getAllServices
{
   public result : boolean = false;
   public services : Bouquet[] = [];  // Appears to be the 'bouquet' name
}

export class ChannelList  // Returned by getServices (common fields)
{
   public services: Channel[] = [];
}

// Structure returned by getServices is not the same as for getAllServices
// and the SF8008 and VUULTIMO give different responses:
// SF8008
// {
//  "result": true,
//  "processingtime": "0:00:00.001651",
//  "pos": 31,
//  "services": [
//   {
//    "pos": 1,
//    "servicename": "BBC One SE HD",
//    "servicereference": "1:0:19:1B13:802:2:11A0000:0:0:0:",
//    "program": 6931
//   },
//  .....
//
// VUULTIMO
// {
// "services": [
//    {
//       "servicereference": "1:0:19:1B13:802:2:11A0000:0:0:0:",
//       "servicename": "BBC One SE HD"
//    },
//    {
//       "servicereference": "1:0:19:1B1C:802:2:11A0000:0:0:0:",
//       "servicename": "BBC Two HD"
//    },
//  ....
