import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

export const PLACEHOLDER = "https://via.placeholder.com/50.png/000/fff?text=?";

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./equipment-item-summary.component.html",
  styleUrls: ["./equipment-item-summary.component.scss"]
})
export class EquipmentItemSummaryComponent extends BaseComponentDirective {
  @Input()
  item: EquipmentItemBaseInterface;

  @Input()
  brand: BrandInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  get image(): string {
    return this.item.image || PLACEHOLDER;
  }

  get properties(): { name: string; value: any }[] {
    let properties: { name: string; value: any }[] = [];

    if (instanceOfCamera(this.item)) {
      properties = [
        {
          name: this.translateService.instant("Type"),
          value: this.item.type
        },
        {
          name: this.translateService.instant("Cooled"),
          value: this.item.cooled ? this.translateService.instant("Yes") : this.translateService.instant("No")
        },
        {
          name: this.translateService.instant("Max. cooling"),
          value: this.item.maxCooling
        },
        {
          name: this.translateService.instant("Back focus"),
          value: this.item.backFocus
        }
      ];
    }

    return properties.filter(property => property.value !== null && property.value !== undefined);
  }
}
