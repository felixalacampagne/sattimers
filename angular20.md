Upgrade to Angular 20 based on recommendations at: https://angular.dev/update-guide?v=19.0-20.0&l=2
   Medium, Angular Material, Windows

- Ensure your Node.js version is at least 20.11.1 and not v18 or v22.0-v22.10 before upgrading to Angular v20. Check https://angular.dev/reference/versions for the full list of supported Node.js versions.
  Surely this should be the number one item at the top of the list?????? Instead they put it at the end of a long list of irrelevant stuff
  where it is more or less guarenteed that it is missed!

    How to update Node.js - google talks of 'nvm' but this is not a command on windows.
      Must be done by downloading a new installer.
    node --version

- Upgrade your project's TypeScript version to at least 5.8 before upgrading to Angular v20 to ensure compatibility.
  AGAIN this is put at the end of a long list of irrelevant stuff
  Do they do this deliberatly to fork people over?

   npm i typescript@5.8.2 --save-dev

   NB Tried updating to angular 19.2 to see if it made the JSON data corruption issue any better. It didn't
   actually help so don't bother with it
   ng update @angular/core@19.2 @angular/cli@19.2
   ng update @angular/material@19.2

- Run
   ng update @angular/core@20 @angular/cli@20

Select the migrations that you'd like to run
â¯â—‰ [use-application-builder] Migrate application projects to the new build system.
(https://angular.dev/tools/cli/build-system-migration)


Select the migrations that you'd like to run
 â—¯ [control-flow-migration] Converts the entire application to block control flow syntax.
â¯â—‰ [router-current-navigation] Replaces usages of the deprecated
Router.getCurrentNavigation method with the Router.currentNavigation signal.


   ng update @angular/material@20

   ng update ngx-device-detector@10.1


Other items from the upgrade list which are without explanation which makes
any sense to me - fingers crossed they are irrelevant


- Rename the afterRender lifecycle hook to afterEveryRender
   WTF does this mean??

- Replace uses of TestBed.flushEffects() with TestBed.tick(), the closest equivalent to synchronously flush effects.
   Sounds like somthing to do with testing - N/A

- Rename the 'request' property passed in resources to 'params'.
   WTF does this mean??

- Rename the 'loader' property passed in rxResources to 'stream'.
   WTF does this mean??

- ResourceStatus is no longer an enum. Use the corresponding constant string values instead.
   WTF does this mean??

- In tests, uncaught errors in event listeners are now rethrown by default. Previously, these were only logged to the console by default. Catch them if intentional for the test case, or use rethrowApplicationErrors: false in configureTestingModule as a last resort.
  N/A

- Replace all occurrences of the deprecated TestBed.get() method with TestBed.inject() in your Angular tests for dependency injection.
   N/A

- Remove InjectFlags enum and its usage from inject, Injector.get, EnvironmentInjector.get, and TestBed.inject calls. Use options like {optional: true} for inject or handle null for *.get methods.
   probably N/A - done by ng update

- In templates parentheses are now always respected. This can lead to runtime breakages when nullish coalescing were nested in parathesis. eg (foo?.bar).baz will throw if foo is nullish as it would in native JavaScript.
   WTF does this mean?



Following the upgrade to angular 20  the code still compiles.

When the application is run using 'ng serve' loading JSON data from the assets directory is
broken. The error reported is;

the timerlist page fails to load. The reponse appears to contain the following;

  "status": 200,
  "statusText": "OK",
  "url": "http://localhost:4200/assets/api/timerlist?nocache=1763394477046",
  "ok": false,
  "name": "HttpErrorResponse",
  "message": "Http failure during parsing for http://localhost:4200/assets/api/timerlist?nocache=1763394477046",

followed by a 'text' value which consists of the timerlist JSON FOLLOWED by

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIj...

where the content following the 'base64' is ca.120k of b64 data.

Inexplicably Developer Tools shows that the content-type of the reponse is 'text/javascript' instead of the normal empty value.

When the JSON is requested by pasting the URL into the browser address line only the JSON in the timerlist
file is returned.

Changing the name of the api to something completely different, ie. no possible conflict with the
component page name, did not solve the problem.

I guess this time the continuous improver grassholes have been having some fun again - wonkers.

Eventually managed to cobble together a workaround for the broken JSON asset loading where
the response type is forced to be 'text', the garbage is stripped from the end of the
response data and the result is then manually JSON parsed. Hopefully this should not
impact loading from the real server where presumably the data will be served uncorrupted.

So Angular 20 upgrade can proceed...
