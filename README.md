Handy commands:

```
git diff --ignore-cr-at-eol --ignore-space-at-eol >patch.diff
git apply --whitespace=fix --ignore-whitespace --reject patch.diff
patch --ignore-whitespace -p1 < patch.diff
```
# VS Code plugins

CSS Navigation - https://marketplace.visualstudio.com/items?itemName=pucelle.vscode-css-navigation
  Allows navigation to CSS class definition from a usage using Ctrl-click. Maybe doesn't respect the
  'active' .CSS files, eg. as defined in the component which references the HTML page, but is still very useful.
# Sattimers

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2.

16 Nov 2025 Things have progressed to the stage where I have a working, presentable timer list with 
usable delete on the phone, which is what I was most interested in. Thus the angular version of
sattimers is slowly replacing the old Ajax version. Timer edit is still a work in progress - adding a timer
has been shown to work, and the edit page can be opened a timer details from the list. The edit page UI is 
somewhat more complex than the list and while trying to bend the components into something vaugely usable I've once again hit the problem that Google searches goto a page for a different version of Angular and switching to the correct version looses the relevant page - you'd think that providers of a UI library would have a better idea of how to provide a UI... mind you the stuff they provide is so convoluted and difficult to use I guess that maybe they don't. 

So, before descending once more into the rabbit hole of trying to make a usable UI using Angular and Material, I have decided that the upgrade to the current default version of the angular documentation is
required to stop me becoming demented trying to figure out how to get things to work. 

Therefore this version in main is not a fully working of the timer edit, rather a pre-Angular update version...

01 Dec 2024 Having realised that the new pages will have to be served from the SR servers I needed a
way to test locally using static pages before copying everything to the SR boxes. You guessed it, the continuous
improvers have been at it again and with Angular 19 the 'src/assets' folder which contains the static test data
is completely ignored. No clue why, no clue where to even look to find out what they have broken.
So once gain the continuous improvers have wasted hours of my valuable time due to their pointless changes.
I eventually got the static test data to load by putting the assets folder into a 'public' folder
which was created when I initialized the project using the command I found via google (of course there is
nothing in the Angular docs about how to setup a new application using the tools)

30 Nov 2024 Had the stupid idea to convert the very old timer listing and edit pages used to program
recordings on my Enigma2 based satellite receivers (SR) to Angular. The original pages use 'Ajax' to obtain a list
of recordings, known as 'timers', in JSON format. I remember nothing of 'Ajax', the pages are
very awkward to use on a mobile phone and I've just installed a new satellite receiver which required
tweaks to the code so I thought now would be a good time to update the pages. Big laugh! Once again
Angular has changed and nothing is as it was last time I setup a new project (about 3 months ago).
Nonetheless I managed to get the framework in place in a couple of hours - so much random boilerplate!

The idea was to have a single, centrally located, set of pages which would query the receivers to get the
timer information via the web service api. BAD IDEA! Forking CORS prevents that from working - no way to
make a query from a page at server X to a web api at server Y unless something is changed on server Y.
I have no way to modify the OpenWebIf server code to force it to provide the CORS shirt necessary - so
once again normal people just trying to do perfectly legitimate things are shafted in the interest
of so called 'security'.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


