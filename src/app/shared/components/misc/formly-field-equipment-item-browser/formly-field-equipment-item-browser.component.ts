import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";

@Component({
  selector: "astrobin-formly-field-equipment-item-browser",
  templateUrl: "./formly-field-equipment-item-browser.component.html",
  styleUrls: ["./formly-field-equipment-item-browser.component.scss"]
})
export class FormlyFieldEquipmentItemBrowserComponent extends FieldType {
  constructor() {
    super();
  }

  onItemsSelected(items: EquipmentItemBaseInterface[]) {
    this.formControl.setValue(items.map(item => item.id));
  }
}
