import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-equipment-others-in-brand",
  templateUrl: "./others-in-brand.component.html",
  styleUrls: ["./others-in-brand.component.scss"]
})
export class OthersInBrandComponent extends BaseComponentDirective {
  @Input()
  items: EquipmentItemBaseInterface[];

  constructor(public readonly store$: Store<State>, public readonly translateService: TranslateService) {
    super(store$);
  }

  get message(): string {
    return (
      this.translateService.instant(
        "This brand has <strong>{{0}}</strong> items in AstroBin's database, and they are shown below in alphabetical order.",
        {
          0: this.items?.length
        }
      ) +
      "<br /><br />" +
      this.translateService.instant(
        "Take a look at them so you can be consistent with the naming conventions and prevent the creation of a duplicate item."
      )
    );
  }
}
