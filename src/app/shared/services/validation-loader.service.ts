import { Injectable } from "@angular/core";
import { FormlyConfig, FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class ValidationLoader {
  public constructor(private translate: TranslateService, private config: FormlyConfig) {}

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
      ValidationLoader.minlengthValidationMessage(field, this.translate)
    );
  }
}
