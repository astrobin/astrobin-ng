import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { library as fontAwesomeLibrary } from "@fortawesome/fontawesome-svg-core";
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
  faSearch,
  faSignOutAlt,
  faSortAmountDown,
  faStar,
  faTasks,
  faTrophy,
  faUpload,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LibraryModule } from "@library/library.module";
import { AppContextService } from "@library/services/app-context.service";
import { SharedModule } from "@library/shared.module";
import { LanguageLoader } from "./translate-loader";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { ValidationLoader } from "@library/services/validation-loader.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";

export function appInitializer(appContext: AppContextService) {
  return () => appContext.load();
}

function initFontAwesome() {
  [
    faAsterisk, faBarcode, faBook, faBookmark, faChartBar, faComments, faEdit, faEnvelope, faEye, faFlag, faGlobe,
    faHammer, faImage, faImages, faInbox, faInfo, faKey, faListOl, faLock, faBars, faQuestion, faSearch, faSignOutAlt,
    faSortAmountDown, faStar, faTasks, faTrophy, faUpload, faUsers, faCertificate
  ].forEach(faItem => fontAwesomeLibrary.add(faItem));
}

initFontAwesome();

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,

    // Third party
    FontAwesomeModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    NgbModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader,
        deps: [HttpClient],
      },
    }),

    // App
    AppRoutingModule,
    LibraryModule,
    SharedModule.forRoot(),
  ],
  providers: [
    AppContextService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [
        AppContextService,
      ],
    },
    ValidationLoader,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
