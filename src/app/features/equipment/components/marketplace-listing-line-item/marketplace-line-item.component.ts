import type { OnChanges, SimpleChanges } from "@angular/core";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import type { SafeUrl } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import type { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { MarketplaceImageInterface } from "@features/equipment/types/marketplace-image.interface";
import type { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceListingType } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import type { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take, withLatestFrom } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-listing-line-item",
  templateUrl: "./marketplace-line-item.component.html",
  styleUrls: ["./marketplace-line-item.component.scss"]
})
export class MarketplaceLineItemComponent extends BaseComponentDirective implements OnChanges {
  readonly MarketplaceListingType = MarketplaceListingType;

  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  lineItem: MarketplaceLineItemInterface;

  @Input()
  lineItemIndex: number;

  @Input()
  previewMode = false;

  @Input()
  collapsed = true;

  equipmentItem: EquipmentItem;
  sellerImageCount: string;
  totalImageCount: string;

  @ViewChild("sellerImageSearch", { read: ElementRef, static: false })
  private _sellerImageSearch: ElementRef;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly commonApiService: CommonApiService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  get pendingOffers(): MarketplaceOfferInterface[] {
    if (!this.lineItem || !this.lineItem.offers) {
      return [];
    }

    return this.lineItem.offers.filter(offer => offer.status === MarketplaceOfferStatus.PENDING);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lineItem && changes.lineItem.currentValue) {
      const lineItem: MarketplaceLineItemInterface = changes.lineItem.currentValue;

      this.store$.dispatch(new LoadUser({ id: lineItem.user }));

      this.sellerImageCount = this.translateService.instant("<strong>{{0}}</strong> images by the seller", {
        0: lineItem.sellerImageCount
      });

      this.totalImageCount = this.translateService.instant("<strong>{{0}}</strong> total images on AstroBin", {
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
          });
      }
    }
  }

  getFirstImageUrl(): SafeUrl {
    const image = this.lineItem.images[0];

    if (UtilsService.isString(image)) {
      return image;
    }

    if (image.hasOwnProperty("url")) {
      return (image as any).url;
    }

    if (image.hasOwnProperty("thumbnailFile")) {
      return (image as MarketplaceImageInterface).thumbnailFile;
    }

    if (image.hasOwnProperty("imageFile")) {
      return (image as MarketplaceImageInterface).imageFile;
    }

    return null;
  }

  equipmentItemType(equipmentItem: EquipmentItem) {
    if (!!equipmentItem) {
      return this.equipmentItemService.humanizeType(equipmentItem.klass);
    }

    return this.equipmentItemService.humanizeType(EquipmentItemType.TELESCOPE);
  }

  protected readonly ImageAlias = ImageAlias;
}
