import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withHashLocation } from '@angular/router';

import { HostnameTitleStrategy, routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
   provideZoneChangeDetection({ eventCoalescing: true }),
   provideRouter(routes, withComponentInputBinding(), withHashLocation()),
   {provide: TitleStrategy, useClass: HostnameTitleStrategy},
   provideHttpClient(), provideAnimationsAsync()
   ]
};
