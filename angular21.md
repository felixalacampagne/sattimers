27/11/2025

I upgraded to Angular 20 so that the Angular 'documentation' was consistent with what was availabe to me
and what did they go and do more or less as soon as I got it working... you guessed it, the release version
of the documentation is now v21 and yes, switching from 21 to 20 STILL does not take you to the
documentation of whatever it was you were looking at for v21.

So here we go again, angular upgrading...
take1 - failed due to unavailable/inaccessible dependencies
take2 - found out about a proxy setting which might make some of the missing items accessible...

Based on guide at https://angular.dev/update-guide?v=20.0-21.0&l=2

NB. To avoid the 'The installed Angular CLI version is outdated.' message it is necessary to uninstall the current
global version when install the newer version, eg.

ng version

npm uninstall -g @angular/cli
npm install -g @angular/cli@latest

npm i typescript@5.9.3 --save-dev [--legacy-peer-deps] 

ng update @angular/core@21 @angular/cli@21

ng update @angular/material@21

NB. One of the updates converts '*ngIf' into '@if'

