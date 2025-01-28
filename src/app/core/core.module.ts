import { APP_INITIALIZER, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import * as Sentry from "@sentry/angular";
import { FORMLY_CONFIG } from "@ngx-formly/core";
import { formlyConfig } from "@app/formly.config";
import { TranslateService } from "@ngx-translate/core";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { appInitializer, AstroBinHammerConfig } from "@shared/shared.module";
import { ApiModule } from "@core/services/api/api.module";
import { ToastrModule } from "ngx-toastr";
import { CustomToastComponent } from "@shared/components/misc/custom-toast/custom-toast.component";
import { AUTO_COMPLETE_ONLY_FILTERS_TOKEN, SEARCH_FILTERS_TOKEN } from "@core/injection-tokens/search-filter.tokens";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ApiModule,
    ToastrModule.forRoot({
      timeOut: 20000,
      progressBar: true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      toastComponent: CustomToastComponent
    })
  ],
  providers: [
    DatePipe,
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
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: AstroBinHammerConfig
    },
    // Filters will be registered in SearchModule.
    {
      provide: SEARCH_FILTERS_TOKEN,
      useValue: []
    },
    {
      provide: AUTO_COMPLETE_ONLY_FILTERS_TOKEN,
      useValue: []
    }
  ]
})
export class CoreModule {
}
