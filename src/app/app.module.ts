import { DatePipe, isPlatformBrowser, LocationStrategy, registerLocaleData } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import localeArabic from "@angular/common/locales/ar";
import localeGerman from "@angular/common/locales/de";
import localeGreek from "@angular/common/locales/el";
import localeEnglish from "@angular/common/locales/en";
import localeBritishEnglish from "@angular/common/locales/en-GB";
import localeSpanish from "@angular/common/locales/es";
import localeFinnish from "@angular/common/locales/fi";
import localeFrench from "@angular/common/locales/fr";
import localeItalian from "@angular/common/locales/it";
import localeJapanese from "@angular/common/locales/ja";
import localeDutch from "@angular/common/locales/nl";
import localePolish from "@angular/common/locales/pl";
import localePortuguese from "@angular/common/locales/pt";
import localeRussian from "@angular/common/locales/ru";
import localeAlbanian from "@angular/common/locales/sq";
import localeTurkish from "@angular/common/locales/tr";
import localeUkrainian from "@angular/common/locales/uk";
import localeChinese from "@angular/common/locales/zh";
import localeChineseSimplified from "@angular/common/locales/zh-Hans";
import localeChineseTraditional from "@angular/common/locales/zh-Hant";
import { APP_INITIALIZER, ErrorHandler, Inject, Injectable, NgModule, PLATFORM_ID } from "@angular/core";
import { TransferState, BrowserModule, Title } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router, RouteReuseStrategy } from "@angular/router";
import { ServiceWorkerModule } from "@angular/service-worker";
import { AppComponent } from "@app/app.component";
import { CLIENT_IP } from "@app/client-ip.injector";
import { CoreModule } from "@app/core/core.module";
import { CustomRouteReuseStrategy } from "@app/custom-reuse-strategy";
import { mainStateEffects, mainStateReducers, metaReducers, setInitialState } from "@app/store/state";
import { CustomTranslateParser } from "@app/translate-parser";
import { NGRX_STATE_KEY } from "@core/services/store-transfer.service";
import { SwipeDownToCloseService } from "@core/services/swipe-down-to-close.service";
import { TimeagoAppClock } from "@core/services/timeago-app-clock.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { environment } from "@env/environment";
import { EffectsModule } from "@ngrx/effects";
import { Store, StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { FormlyModule } from "@ngx-formly/core";
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import * as Sentry from "@sentry/angular";
import { FooterComponent } from "@shared/components/footer/footer.component";
import { HeaderComponent } from "@shared/components/header/header.component";
import { BetaBannerComponent } from "@shared/components/misc/beta-banner/beta-banner.component";
import { BreadcrumbComponent } from "@shared/components/misc/breadcrumb/breadcrumb.component";
import { FormlyCardWrapperComponent } from "@shared/components/misc/formly-card-wrapper/formly-card-wrapper.component";
import { FormlyEquipmentItemBrowserWrapperComponent } from "@shared/components/misc/formly-equipment-item-browser-wrapper/formly-equipment-item-browser-wrapper.component";
import { FormlyWrapperComponent } from "@shared/components/misc/formly-wrapper/formly-wrapper.component";
import { SharedModule } from "@shared/shared.module";
import { CookieModule, CookieService } from "ngx-cookie";
import { TimeagoClock, TimeagoDefaultFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule } from "ngx-timeago";

import { AppRoutingModule } from "./app-routing.module";
import { CustomMissingTranslationHandler } from "./missing-translation-handler";
import { translateLoaderFactory } from "./translate-loader";

registerLocaleData(localeEnglish);
registerLocaleData(localeBritishEnglish);
registerLocaleData(localeFrench);
registerLocaleData(localeGerman);
registerLocaleData(localeItalian);
registerLocaleData(localeSpanish);
registerLocaleData(localePortuguese);
registerLocaleData(localeChineseSimplified);
registerLocaleData(localeArabic);
registerLocaleData(localeGreek);
registerLocaleData(localeFinnish);
registerLocaleData(localeJapanese);
registerLocaleData(localeDutch);
registerLocaleData(localePolish);
registerLocaleData(localeUkrainian);
registerLocaleData(localeRussian);
registerLocaleData(localeAlbanian);
registerLocaleData(localeTurkish);
registerLocaleData(localeChinese);
registerLocaleData(localeChineseTraditional);

@Injectable()
export class AstroBinTimeagoCustomFormatter extends TimeagoDefaultFormatter {
  private _maxTimeago = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  constructor(private datePipe: DatePipe) {
    super();
  }

  format(then: number): string {
    const now = Date.now();
    const diff = now - then;

    if (diff > this._maxTimeago) {
      return this.datePipe.transform(then, "mediumDate") || "";
    }

    return super.format(then);
  }
}

@NgModule({
  imports: [
    // Angular.
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    BrowserAnimationsModule,
    HttpClientModule,

    CoreModule,
    SharedModule.forRoot(),

    // This app.
    AppRoutingModule,

    CookieModule.forRoot(),

    FormlyModule.forRoot({
      extras: {
        lazyRender: false,
        resetFieldOnHide: false
      },
      wrappers: [
        { name: "equipment-item-browser-wrapper", component: FormlyEquipmentItemBrowserWrapperComponent },
        { name: "default-wrapper", component: FormlyWrapperComponent },
        { name: "card-wrapper", component: FormlyCardWrapperComponent }
      ]
    }),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerWhenStable:30000"
    }),
    // Dependencies.
    StoreModule.forRoot(mainStateReducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false
      }
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot(mainStateEffects),

    TimeagoModule.forRoot({
      intl: TimeagoIntl,
      formatter: {
        provide: TimeagoFormatter,
        useClass: AstroBinTimeagoCustomFormatter
      },
      clock: {
        provide: TimeagoClock,
        useClass: TimeagoAppClock
      }
    }),
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler
      },
      parser: {
        provide: TranslateParser,
        useClass: CustomTranslateParser
      },
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient]
      },
      isolate: false
    })
  ],
  providers: [
    CookieService,
    Title,
    WindowRefService,
    SwipeDownToCloseService,
    {
      provide: APP_INITIALIZER,
      useFactory: (swipeDownToCloseService: SwipeDownToCloseService) => {
        return () => {
          // The service is initialized in its constructor
          return Promise.resolve();
        };
      },
      deps: [SwipeDownToCloseService],
      multi: true
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false
      })
    },
    {
      provide: RouteReuseStrategy,
      useFactory: (platformId: Object, locationStrategy: LocationStrategy) =>
        new CustomRouteReuseStrategy(platformId, locationStrategy),
      deps: [PLATFORM_ID, LocationStrategy]
    },
    { provide: CLIENT_IP, useValue: "" } // provide a fallback value for CLIENT_IP
  ],
  declarations: [AppComponent, BetaBannerComponent, BreadcrumbComponent, HeaderComponent, FooterComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly store$: Store,
    private readonly transferState: TransferState
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const initialState = this.transferState.get(NGRX_STATE_KEY, null);
      if (initialState) {
        this.store$.dispatch(setInitialState({ payload: initialState }));
        this.transferState.remove(NGRX_STATE_KEY);
      }
    }
  }
}
