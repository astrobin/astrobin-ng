import { CommonModule, NgOptimizedImage } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Injectable, ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { InitializeApp } from "@app/store/actions/initialize-app.actions";
import { MainState } from "@app/store/state";
import { AuthActionTypes, InitializeAuth } from "@features/account/store/auth.actions";
import { NgbAccordionModule, NgbCarouselModule, NgbDropdownModule, NgbModule, NgbNavModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import { NgxFilesizeModule } from "ngx-filesize";
import { ImageCropperModule } from "ngx-image-cropper";
import { TimeagoModule } from "ngx-timeago";
import { switchMap, take } from "rxjs/operators";
import { ComponentsModule } from "./components/components.module";
import { PipesModule } from "./pipes/pipes.module";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { CustomMissingTranslationHandler } from "@app/missing-translation-handler";
import { CustomTranslateParser } from "@app/translate-parser";
import { LanguageLoader } from "@app/translate-loader";
import { DirectivesModule } from "@shared/directives/directives.module";
import { NgWizardModule, THEME } from "@kronscht/ng-wizard";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { HammerGestureConfig, HammerModule } from "@angular/platform-browser";
import { AutoSizeInputModule } from "ngx-autosize-input";
import { IconsModule } from "@shared/icons.module";

declare const Hammer;

export function appInitializer(store: Store<MainState>, actions$: Actions) {
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

@Injectable()
export class AstroBinHammerConfig extends HammerGestureConfig {
  override events = ["pinch", "pinchstart", "pinchmove", "pinchend",
    "pan", "panstart", "panmove", "panend",
    "tap", "doubletap"];  // Add doubletap here

  override overrides = {
    "pinch": { enable: true },
    "doubletap": { enable: true }
  } as any;

  override buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, {
      touchAction: "pan-x pan-y"
    });

    mc.get("pinch").set({ enable: true });

    const tap = mc.get("tap");
    tap.set({
      enable: true,
      taps: 2,
      interval: 200,
      threshold: 2,
      posThreshold: 10
    });

    return mc;
  }
}

@NgModule({
  imports: [
    AutoSizeInputModule,
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    FormlyModule,
    FormlyBootstrapModule,
    FormlySelectModule,
    HammerModule,
    ImageCropperModule,
    NgbModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbDropdownModule,
    NgbNavModule,
    NgOptimizedImage,
    NgbPaginationModule,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgSelectModule,
    NgxSliderModule,
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

    IconsModule,
    PipesModule
  ],
  exports: [
    AutoSizeInputModule,
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    FormlyModule,
    FormlyBootstrapModule,
    HammerModule,
    ImageCropperModule,
    NgbModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgOptimizedImage,
    NgSelectModule,
    NgxSliderModule,
    NgxFilesizeModule,
    NgWizardModule,
    TimeagoModule,
    TranslateModule,

    IconsModule,
    PipesModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule
    };
  }
}
