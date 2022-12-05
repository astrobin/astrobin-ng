import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import {
  EquipmentBrandListingInterface,
  EquipmentItemListingInterface,
  EquipmentListingsInterface
} from "@features/equipment/types/equipment-listings.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { take } from "rxjs/operators";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { AuthService } from "@shared/services/auth.service";
import { RemoveAdsDialogComponent } from "@shared/components/misc/remove-ads-dialog/remove-ads-dialog.component";
import { BrandInterface } from "@features/equipment/types/brand.interface";

@Component({
  selector: "astrobin-equipment-listings",
  templateUrl: "./equipment-listings.component.html",
  styleUrls: ["./equipment-listings.component.scss"]
})
export class EquipmentListingsComponent extends BaseComponentDirective implements OnChanges, OnInit {
  @Input()
  brand: BrandInterface;

  @Input()
  item: EquipmentItem;

  @Input()
  listings: EquipmentListingsInterface = null;

  itemCardHeaderTemplate: TemplateRef<any>;
  itemCardBodyTemplate: TemplateRef<any>;

  brandCardHeaderTemplate: TemplateRef<any>;
  brandCardBodyTemplate: TemplateRef<any>;

  @ViewChild("loadingTemplate")
  private _loadingTemplate: TemplateRef<any>;

  @ViewChild("cardHeaderItemListingsFullTemplate")
  private _cardHeaderItemListingsFullTemplate: TemplateRef<any>;

  @ViewChild("cardHeaderItemListingsLiteTemplate")
  private _cardHeaderItemListingsLiteTemplate: TemplateRef<any>;

  @ViewChild("cardHeaderBrandListingsFullTemplate")
  private _cardHeaderBrandListingsFullTemplate: TemplateRef<any>;

  @ViewChild("cardHeaderBrandListingsLiteTemplate")
  private _cardHeaderBrandListingsLiteTemplate: TemplateRef<any>;

  @ViewChild("cardBodyItemListingsFullTemplate")
  private _cardBodyItemListingsFullTemplate: TemplateRef<any>;

  @ViewChild("cardBodyItemListingsLiteTemplate")
  private _cardBodyItemListingsLiteTemplate: TemplateRef<any>;

  @ViewChild("cardBodyBrandListingsFullTemplate")
  private _cardBodyBrandListingsFullTemplate: TemplateRef<any>;

  @ViewChild("cardBodyBrandListingsLiteTemplate")
  private _cardBodyBrandListingsLiteTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService,
    public readonly authService: AuthService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  get shopItemLabel(): string {
    return this.translateService.instant("AstroBin sponsors that sell {{0}}", {
      0: `${this.item.brandName} ${this.item.name}`
    });
  }

  get shopBrandLabel(): string {
    return this.translateService.instant("AstroBin sponsors that sell {{0}}", {
      0: this.item ? this.item.brandName : this.brand.name
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.listings && !changes.listings.firstChange) {
      this._setCardTemplates();
    }
  }

  ngOnInit(): void {
    this.utilsService.delay(1).subscribe(() => {
      this._setCardTemplates();
    });
  }

  urlWithTags(listing: EquipmentBrandListingInterface | EquipmentItemListingInterface): string {
    let url = listing.url;
    const source = !!this.item ? "equipment-item-page" : "equipment-brand-page";

    if (url.indexOf("brand") > -1 || url.indexOf("retailer") > -1 || url.indexOf("source") > -1) {
      return url;
    }

    url = UtilsService.addOrUpdateUrlParam(url, "brand", !!this.item ? this.item.brandName : this.brand.name);

    if (!!this.item && Object.keys(listing).indexOf("itemObjectId") > -1) {
      // This is an item listing.
      url = UtilsService.addOrUpdateUrlParam(url, "name", this.item.name);
    }

    url = UtilsService.addOrUpdateUrlParam(url, "retailer", listing.retailer.name);
    url = UtilsService.addOrUpdateUrlParam(url, "source", source);

    return url;
  }

  infoButtonClicked() {
    const modalRef: NgbModalRef = this.modalService.open(InformationDialogComponent);
    const componentInstance = modalRef.componentInstance;
    componentInstance.message = this.translateService.instant(
      "AstroBin partners with retailer of astrophotography equipment in your country. For some of them, when " +
      "you make a purchase within a few weeks after clicking on a link on a page like this, AstroBin gets a " +
      "commission and it doesn't cost you anything."
    );
  }

  removeButtonClicked() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.windowRefService.locationAssign(this.authService.getLoginUrl());
        return;
      }

      this.userSubscriptionService.canRemoveAds$().subscribe(allowed => {
        if (allowed) {
          this.modalService.open(RemoveAdsDialogComponent);
        } else {
          const modalRef: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
          const componentInstance: SubscriptionRequiredModalComponent = modalRef.componentInstance;
          componentInstance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_PREMIUM;
        }
      });
    });
  }

  private _setCardTemplates(): void {
    if (!!this.listings) {
      if (this.listings.allowFullRetailerIntegration) {
        if (this.listings.itemListings.length > 0) {
          this.itemCardHeaderTemplate = this._cardHeaderItemListingsFullTemplate;
          this.itemCardBodyTemplate = this._cardBodyItemListingsFullTemplate;
        }

        if (this.listings.brandListings.length > 0) {
          this.brandCardHeaderTemplate = this._cardHeaderBrandListingsFullTemplate;
          this.brandCardBodyTemplate = this._cardBodyBrandListingsFullTemplate;
        }
      } else {
        if (this.listings.itemListings.length > 0) {
          this.itemCardHeaderTemplate = this._cardHeaderItemListingsLiteTemplate;
          this.itemCardBodyTemplate = this._cardBodyItemListingsLiteTemplate;
        }

        if (this.listings.brandListings.length > 0) {
          this.brandCardHeaderTemplate = this._cardHeaderBrandListingsLiteTemplate;
          this.brandCardBodyTemplate = this._cardBodyBrandListingsLiteTemplate;
        }
      }
    }

    if (!this.itemCardHeaderTemplate) {
      this.itemCardHeaderTemplate = this._loadingTemplate;
    }

    if (!this.itemCardBodyTemplate) {
      this.itemCardBodyTemplate = this._loadingTemplate;
    }

    if (!this.brandCardHeaderTemplate) {
      this.brandCardHeaderTemplate = this._loadingTemplate;
    }

    if (!this.brandCardBodyTemplate) {
      this.brandCardBodyTemplate = this._loadingTemplate;
    }
  }
}
