import { registerLocaleData } from "@angular/common";
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
import localeUkrainian from "@angular/common/locales/uk";
import localeRussian from "@angular/common/locales/ru";
import localeAlbanian from "@angular/common/locales/sq";
import localeTurkish from "@angular/common/locales/tr";
import localeChinese from "@angular/common/locales/zh";
import localeChineseSimplified from "@angular/common/locales/zh-Hans";
import localeChineseTraditional from "@angular/common/locales/zh-Hant";
import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule, BrowserTransferStateModule, Title } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "@app/app.component";
import { appStateEffects, appStateReducers } from "@app/store/state";
import { CustomTranslateParser } from "@app/translate-parser";
import { environment } from "@env/environment";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import {
  faAsterisk,
  faBarcode,
  faBars,
  faBook,
  faBookmark,
  faCertificate,
  faChartBar,
  faComments,
  faCreditCard,
  faEdit,
  faEnvelope,
  faEye,
  faFlag,
  faGlobe,
  faHammer,
  faImage,
  faImages,
  faInbox,
  faInfo,
  faKey,
  faListOl,
  faLock,
  faQuestion,
  fas,
  faSearch,
  faSignOutAlt,
  faSortAmountDown,
  faStar,
  faTasks,
  faTrophy,
  faUpload,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SharedModule } from "@shared/shared.module";
import { CookieModule, CookieService } from "ngx-cookie";
import { TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule } from "ngx-timeago";
import { AppRoutingModule } from "./app-routing.module";
import { CustomMissingTranslationHandler } from "./missing-translation-handler";
import { translateLoaderFactory } from "./translate-loader";
import * as Sentry from "@sentry/angular";
import { Router } from "@angular/router";

// Supported languages
registerLocaleData(localeEnglish);
registerLocaleData(localeBritishEnglish);
registerLocaleData(localeFrench);
registerLocaleData(localeGerman);
registerLocaleData(localeItalian);
registerLocaleData(localeSpanish);
registerLocaleData(localePortuguese);
registerLocaleData(localeChineseSimplified);

// Community languages
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

// Other languages
registerLocaleData(localeChinese);
registerLocaleData(localeChineseTraditional);

export function initFontAwesome(iconLibrary: FaIconLibrary) {
  iconLibrary.addIconPacks(fas);
  iconLibrary.addIcons(
    faAsterisk,
    faBarcode,
    faBook,
    faBookmark,
    faChartBar,
    faComments,
    faEdit,
    faEnvelope,
    faEye,
    faFlag,
    faGlobe,
    faHammer,
    faImage,
    faImages,
    faInbox,
    faInfo,
    faKey,
    faListOl,
    faLock,
    faBars,
    faQuestion,
    faSearch,
    faSignOutAlt,
    faSortAmountDown,
    faStar,
    faTasks,
    faTrophy,
    faUpload,
    faUsers,
    faCertificate,
    faCreditCard
  );
}

@NgModule({
  imports: [
    // Angular.
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    HttpClientModule,
    CookieModule.forRoot(),

    // Dependencies.
    StoreModule.forRoot(appStateReducers,
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false
        }
      }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot(appStateEffects),

    TimeagoModule.forRoot({
      intl: TimeagoIntl,
      formatter: { provide: TimeagoFormatter, useClass: TimeagoCustomFormatter }
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
    }),

    // This app.
    AppRoutingModule,
    SharedModule.forRoot()
  ],
  providers: [
    CookieService,
    Title,
    WindowRefService,
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false
      })
    }
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(iconLibrary: FaIconLibrary) {
    initFontAwesome(iconLibrary);
  }
}
