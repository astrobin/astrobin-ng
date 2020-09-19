import { TranslateService } from "@ngx-translate/core";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CommonApiServiceMock } from "@shared/services/api/classic/common/common-api.service-mock";
import { ValidationLoaderService } from "@shared/services/validation-loader.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";

export const testAppProviders = [
  {
    provide: CommonApiService,
    useClass: CommonApiServiceMock
  },
  TimeagoIntl,
  TranslateService,
  ValidationLoaderService,
  WindowRefService
];
