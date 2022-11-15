import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { formlyConfig } from "@app/formly.config";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { InitializeApp } from "@app/store/actions/initialize-app.actions";
import { State } from "@app/store/state";
import { AuthActionTypes, InitializeAuth } from "@features/account/store/auth.actions";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateParser,
  TranslateService
} from "@ngx-translate/core";
import { ApiModule } from "@shared/services/api/api.module";
import { AuthService } from "@shared/services/auth.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";
import { ImageOwnerGuardService } from "@shared/services/guards/image-owner-guard.service";
import { UltimateSubscriptionGuardService } from "@shared/services/guards/ultimate-subscription-guard.service";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { SessionService } from "@shared/services/session.service";
import { UserService } from "@shared/services/user.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { StickyNavModule } from "ng2-sticky-nav";
import { CookieService } from "ngx-cookie";
import { NgxFilesizeModule } from "ngx-filesize";
import { ImageCropperModule } from "ngx-image-cropper";
import { TimeagoModule } from "ngx-timeago";
import { ToastrModule } from "ngx-toastr";
import { switchMap, take } from "rxjs/operators";
import { ComponentsModule } from "./components/components.module";
import { PipesModule } from "./pipes/pipes.module";
import { FormlyWrapperComponent } from "@shared/components/misc/formly-wrapper/formly-wrapper.component";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { CustomMissingTranslationHandler } from "@app/missing-translation-handler";
import { CustomTranslateParser } from "@app/translate-parser";
import { LanguageLoader } from "@app/translate-loader";
import { FormlyEquipmentItemBrowserWrapperComponent } from "@shared/components/misc/formly-equipment-item-browser-wrapper/formly-equipment-item-browser-wrapper.component";
import { DirectivesModule } from "@shared/directives/directives.module";
import { CustomToastComponent } from "@shared/components/misc/custom-toast/custom-toast.component";
import { CKEditorService } from "@shared/services/ckeditor.service";
import { PendingChangesGuard } from "@shared/services/guards/pending-changes-guard.service";
import * as Sentry from "@sentry/angular";
import { NgWizardModule, THEME } from "@kronscht/ng-wizard";

export function appInitializer(store: Store<State>, actions$: Actions) {
  return () =>
    new Promise<void>(resolve => {
      store.dispatch(new InitializeApp());

      actions$
        .pipe(
          ofType(AppActionTypes.INITIALIZE_SUCCESS),
          take(1),
          switchMap(() => {
            store.dispatch(new InitializeAuth());
            return actions$.pipe(ofType(AuthActionTypes.INITIALIZE_SUCCESS), take(1));
          })
        )
        .subscribe(() => {
          resolve();
        });
    });
}

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    FontAwesomeModule,
    FormlyModule.forRoot({
      extras: {
        lazyRender: false
      },
      wrappers: [
        { name: "equipment-item-browser-wrapper", component: FormlyEquipmentItemBrowserWrapperComponent },
        { name: "default-wrapper", component: FormlyWrapperComponent }
      ]
    }),
    FormlyBootstrapModule,
    FormlySelectModule,
    ImageCropperModule,
    NgbModule,
    NgbPaginationModule,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgSelectModule,
    NgxFilesizeModule,
    NgWizardModule.forRoot({
      theme: THEME.default,
      anchorSettings: {
        anchorClickable: true,
        enableAllAnchors: true,
        markAllPreviousStepsAsDone: true,
        enableAnchorOnDoneStep: true
      },
      toolbarSettings: {
        showPreviousButton: false,
        showNextButton: false
      }
    }),
    ToastrModule.forRoot({
      timeOut: 20000,
      progressBar: true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      toastComponent: CustomToastComponent
    }),
    TranslateModule.forChild({
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
        useClass: LanguageLoader,
        deps: [HttpClient, JsonApiService]
      },
      isolate: false
    }),
    StickyNavModule,

    ApiModule,
    PipesModule
  ],
  exports: [
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    FontAwesomeModule,
    FormlyModule,
    FormlyBootstrapModule,
    ImageCropperModule,
    NgbModule,
    NgbPaginationModule,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgSelectModule,
    NgxFilesizeModule,
    NgWizardModule,
    ToastrModule,
    TimeagoModule,
    TranslateModule,
    StickyNavModule,

    ApiModule,
    PipesModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        AuthGuardService,
        AuthService,
        ClassicRoutesService,
        CKEditorService,
        CookieService,
        GroupGuardService,
        ImageOwnerGuardService,
        LoadingService,
        PendingChangesGuard,
        PopNotificationsService,
        SessionService,
        UltimateSubscriptionGuardService,
        UserService,
        WindowRefService,
        {
          provide: APP_INITIALIZER,
          useFactory: appInitializer,
          multi: true,
          deps: [Store, Actions]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: () => () => {
          },
          deps: [Sentry.TraceService],
          multi: true
        },
        {
          provide: FORMLY_CONFIG,
          useFactory: formlyConfig,
          multi: true,
          deps: [TranslateService, JsonApiService]
        }
      ]
    };
  }
}
