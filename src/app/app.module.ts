import { HttpClient, HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule, Title } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "@app/app.component";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faAsterisk,
  faBarcode,
  faBars,
  faBook,
  faBookmark,
  faCertificate,
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
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { AuthService } from "@shared/services/auth.service";
import { ValidationLoader } from "@shared/services/validation-loader.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { appInitializer, SharedModule } from "@shared/shared.module";
import { CookieService } from "ngx-cookie-service";
import { TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule } from "ngx-timeago";
import { AppRoutingModule } from "./app-routing.module";
import { LanguageLoader } from "./translate-loader";

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
    faCertificate
  );
}

@NgModule({
  imports: [
    // Angular.
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Dependencies.
    FontAwesomeModule,
    TimeagoModule.forRoot({
      intl: TimeagoIntl,
      formatter: { provide: TimeagoFormatter, useClass: TimeagoCustomFormatter }
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader,
        deps: [HttpClient, JsonApiService]
      }
    }),

    // This app.
    AppRoutingModule,
    SharedModule.forRoot()
  ],
  providers: [
    AppContextService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AppContextService, AuthService]
    },
    CookieService,
    Title,
    ValidationLoader,
    WindowRefService
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(iconLibrary: FaIconLibrary) {
    initFontAwesome(iconLibrary);
  }
}
