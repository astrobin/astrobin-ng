import { Injectable } from "@angular/core";
import { FormlyConfig, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

@Injectable()
export class ValidationLoaderService extends BaseService {
  public constructor(
    public loadingService: LoadingService,
    public translate: TranslateService,
    public config: FormlyConfig
  ) {
    super(loadingService);
  }

  static minlengthValidationMessage(field: FormlyFieldConfig, translate: TranslateService) {
    return translate.instant("Please input at least {{number}} characters", {
      number: field.templateOptions.minLength
    });
  }

  public init(): void {
    // Messages without params
    this.config.addValidatorMessage("required", (err, field) => this.translate.instant("This field is required"));

    // Messages with params
    this.config.addValidatorMessage("minlength", (err, field) =>
      ValidationLoaderService.minlengthValidationMessage(field, this.translate)
    );
  }
}
