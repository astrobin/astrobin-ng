import { Component } from "@angular/core";
import type { FormlyFieldMessage, FormlyFieldService } from "@core/services/formly-field.service";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-equipment-item-browser-wrapper",
  templateUrl: "./formly-equipment-item-browser-wrapper.component.html",
  styleUrls: ["./formly-equipment-item-browser-wrapper.component.scss"]
})
export class FormlyEquipmentItemBrowserWrapperComponent extends FieldWrapper {
  constructor(public readonly formlyFieldService: FormlyFieldService) {
    super();
  }

  closeMessage(message: FormlyFieldMessage) {
    this.formlyFieldService.removeMessage(this.field, message);
  }
}
