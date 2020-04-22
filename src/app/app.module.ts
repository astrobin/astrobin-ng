import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
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
import { LibraryModule } from "@lib/library.module";
import { JsonApiService } from "@lib/services/api/classic/json/json-api.service";
import { AppContextService } from "@lib/services/app-context.service";
import { AuthService } from "@lib/services/auth.service";
import { ValidationLoader } from "@lib/services/validation-loader.service";
import { WindowRefService } from "@lib/services/window-ref.service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie-service";
import { ToastrModule } from "ngx-toastr";
import { take } from "rxjs/operators";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LanguageLoader } from "./translate-loader";

export function appInitializer(appContext: AppContextService, authService: AuthService) {
  return () =>
    new Promise<any>(resolve => {
      appContext.load().then(() => {
        authService
          .isAuthenticated()
          .pipe(take(1))
          .subscribe(authenticated => {
            if (authenticated) {
              appContext.loadForUser().then(() => resolve());
            } else {
              resolve();
            }
          });
      });
    });
}

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
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,

    // Third party
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    NgbModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader,
        deps: [HttpClient, JsonApiService]
      }
    }),

    // App
    AppRoutingModule,
    LibraryModule.forRoot()
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
    ValidationLoader,
    WindowRefService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(iconLibrary: FaIconLibrary) {
    initFontAwesome(iconLibrary);
  }
}
