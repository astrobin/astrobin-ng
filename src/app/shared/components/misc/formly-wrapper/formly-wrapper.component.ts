import { Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { FormlyFieldMessage, FormlyFieldService } from "@shared/services/formly-field.service";

@Component({
  selector: "astrobin-formly-wrapper",
  templateUrl: "./formly-wrapper.component.html",
  styleUrls: ["./formly-wrapper.component.scss"]
})
export class FormlyWrapperComponent extends FieldWrapper {
  constructor(public readonly formlyFieldService: FormlyFieldService) {
    super();
  }

  closeMessage(message: FormlyFieldMessage) {
    this.formlyFieldService.removeMessage(this.to, message);
  }
}
