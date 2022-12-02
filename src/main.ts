import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "@app/app.module";
import { environment } from "@env/environment";
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";

declare const window: any;

Sentry.init({
  release: environment.buildVersion,
  dsn: `https://${environment.sentryKeys[0]}@${environment.sentryKeys[1]}.ingest.sentry.io/${environment.sentryKeys[2]}`,
  integrations: [
    new BrowserTracing({
      tracingOrigins: ["localhost", "https://app.astrobin.com/"],
      routingInstrumentation: Sentry.routingInstrumentation
    })
  ],

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1
});

if (environment.production) {
  enableProdMode();
}

document.addEventListener("DOMContentLoaded", () => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
});
