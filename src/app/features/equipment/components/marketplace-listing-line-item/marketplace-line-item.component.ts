import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { filter, take, withLatestFrom } from "rxjs/operators";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-marketplace-listing-line-item",
  templateUrl: "./marketplace-line-item.component.html",
  styleUrls: ["./marketplace-line-item.component.scss"]
})
export class MarketplaceLineItemComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  @Input()
  previewMode = false;

  equipmentItem: EquipmentItem;
  sellerImageCount: string;
  totalImageCount: string;
  sellerImagesUrl: string;
  allImagesUrl: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly commonApiService: CommonApiService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lineItem && changes.lineItem.currentValue) {
      const lineItem: MarketplaceLineItemInterface = changes.lineItem.currentValue;

      this.store$.dispatch(new LoadUser({ id: lineItem.user }));

      this.sellerImageCount = this.translateService.instant("<strong>{{0}}</strong> images by the seller", {
        0: lineItem.sellerImageCount
      });

      this.totalImageCount = this.translateService.instant("<strong>{{0}}</strong> total images on AstorBin", {
        0: lineItem.totalImageCount
      });

      if (lineItem.itemContentType && lineItem.itemObjectId) {
        this.equipmentMarketplaceService
          .getLineItemEquipmentItem$(lineItem)
          .pipe(
            filter(item => !!item),
            take(1),
            withLatestFrom(this.store$.select(selectUser, lineItem.user))
          )
          .subscribe(([item, user]) => {
            this.equipmentItem = item;

            this.sellerImagesUrl = `${
              this.classicRoutesService.GALLERY(user)
            }?public=&sub=gear&active=N${item.klass[0]}${item.id}`;

            this.allImagesUrl = `${
              this.classicRoutesService.SEARCH
            }?d=i&sort=-likes&${item.klass.toLowerCase()}_ids=${item.id}`;
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
