import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { formlyConfig } from "@app/formly.config";
import { AUTO_COMPLETE_ONLY_FILTERS_TOKEN, SEARCH_FILTERS_TOKEN } from "@core/injection-tokens/search-filter.tokens";
import { ApiModule } from "@core/services/api/api.module";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FORMLY_CONFIG } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import * as Sentry from "@sentry/angular";
import { CustomToastComponent } from "@shared/components/misc/custom-toast/custom-toast.component";
import { appInitializer, AstroBinHammerConfig } from "@shared/shared.module";
import { ToastrModule } from "ngx-toastr";

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
    CurrencyPipe,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [Store, Actions]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
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
export class CoreModule {}
