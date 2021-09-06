import { Component, EventEmitter, Input, Output } from "@angular/core";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

@Component({
  selector: "astrobin-similar-items-suggestion",
  templateUrl: "./similar-items-suggestion.component.html",
  styleUrls: ["./similar-items-suggestion.component.scss"]
})
export class SimilarItemsSuggestionComponent extends BaseComponentDirective {
  @Input()
  items: EquipmentItemBaseInterface[] | BrandInterface[];

  @Output()
  itemSelected = new EventEmitter<EquipmentItemBaseInterface | BrandInterface>();
}
