import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { Observable } from "rxjs";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-marketplace-listing-line-item",
  templateUrl: "./marketplace-listing-line-item.component.html",
  styleUrls: ["./marketplace-listing-line-item.component.scss"]
})
export class MarketplaceListingLineItemComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  @Input()
  previewMode = false;

  equipmentItem$: Observable<EquipmentItem>;

  constructor(
    public readonly store$: Store<State>,
    public readonly commonApiService: CommonApiService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lineItem && changes.lineItem.currentValue) {
      const lineItem: MarketplaceLineItemInterface = changes.lineItem.currentValue;

      if (lineItem.itemContentType && lineItem.itemObjectId) {
        this.commonApiService.getContentTypeById(lineItem.itemContentType).subscribe(contentType => {
          const payload = {
            id: lineItem.itemObjectId,
            type: EquipmentItemType[contentType.model.toUpperCase()]
          };

          this.equipmentItem$ = this.store$.select(selectEquipmentItem, payload);
          this.store$.dispatch(new LoadEquipmentItem(payload));
        });
      }
    }
  }

  equipmentItemType(equipmentItem: EquipmentItem) {
    if (!!equipmentItem) {
      return this.equipmentItemService.humanizeType(equipmentItem.klass);
    }

    return this.equipmentItemService.humanizeType(EquipmentItemType.TELESCOPE);
  }
}
