import { Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { FormlyFieldMessage, FormlyFieldService } from "@shared/services/formly-field.service";

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
