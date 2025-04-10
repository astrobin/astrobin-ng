import {
  ChangeDetectorRef,
  OnChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewChild
} from "@angular/core";
import { MainState } from "@app/store/state";
import { DeviceService } from "@core/services/device.service";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import {
  EquipmentItemReviewerDecision,
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import {
  EquipmentItemListingInterface,
  EquipmentItemListingType
} from "@features/equipment/types/equipment-listings.interface";
import { NgbModal, NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ItemUnapprovedInfoModalComponent } from "@shared/components/equipment/item-unapproved-info-modal/item-unapproved-info-modal.component";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-item-display-name",
  templateUrl: "./equipment-item-display-name.component.html",
  styleUrls: ["./equipment-item-display-name.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentItemDisplayNameComponent extends BaseComponentDirective implements OnChanges {
  readonly EquipmentItemReviewerDecision = EquipmentItemReviewerDecision;
  readonly EquipmentItemListingType = EquipmentItemListingType;

  protected sellsListings: EquipmentItemListingInterface[] = [];
  protected pairsWellListings: EquipmentItemListingInterface[] = [];

  @Input()
  itemId: EquipmentItem["id"];

  @Input()
  itemType: EquipmentItemType;

  @Input()
  item: EquipmentItem;

  @Input()
  enableKlassIcon = false;

  @Input()
  klassIconColor = "white";

  @Input()
  enableSummaryPopover = false;

  @Input()
  showBrand = true;

  @Input()
  enableBrandLink = false;

  @Input()
  enableNameLink = false;

  @Input()
  showFrozenAsAmbiguous = true;

  @Input()
  showItemUnapprovedInfo = true;

  @Input()
  showRetailers = false;

  // A part of the name to remove. This is useful if this display-name is shown in a list of variants, to avoid
  // repetitions.
  @Input()
  cut = "";

  @Input()
  highlightTerms: string;

  @ViewChild("retailersTemplate", { static: true })
  retailersTemplate: TemplateRef<any>;

  @HostBinding("class")
  get klass(): string {
    return `equipment-item-display-name ${this.enableKlassIcon ? "with-klass-icon" : ""}`;
  }

  brandName: string;
  brandLink: string;
  itemName: string;
  nameLink: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly modalService: NgbModal,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    if (!this.item && !this.itemId && !this.itemType) {
      return;
    }

    const _onChanges = (item: EquipmentItem) => {
      this.brandLink = !!this.item.brand
        ? `/equipment/explorer/brand/${this.item.brand}/${UtilsService.slugify(this.item.brandName)}`
        : undefined;

      if (!!this.item.brand) {
        if (!!this.item.brandName) {
          this.brandName = this.item.brandName;
        } else {
          this.store$
            .select(selectBrand, this.item.brand)
            .pipe(
              filter(brand => !!brand && brand.id === this.item.brand),
              take(1)
            )
            .subscribe(brand => {
              this.brandName = brand.name;
              this.changeDetectorRef.markForCheck();
            });
          this.store$.dispatch(new LoadBrand({ id: this.item.brand }));
        }
      } else {
        this.brandName = this.translateService.instant("(DIY)");
      }

      this.equipmentItemService
        .getName$(this.item)
        .pipe(take(1))
        .subscribe(name => {
          this.itemName = name.replace(this.cut, "");
          this.changeDetectorRef.markForCheck();
        });

      this.nameLink = `/equipment/explorer/${this.item.klass.toLowerCase()}/${this.item.id}`;
    };

    if (!this.item) {
      this.store$
        .select(selectEquipmentItem, { id: this.itemId, type: this.itemType })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe((item: EquipmentItem) => {
          this.item = item;

          if (!!this.item.listings && !!this.item.listings.itemListings) {
            this.sellsListings = this.item.listings.itemListings.filter(
              listing => listing.listingType === EquipmentItemListingType.SELLS
            );
            this.pairsWellListings = this.item.listings.itemListings.filter(
              listing => listing.listingType === EquipmentItemListingType.PAIRS_WELL
            );
          }

          _onChanges(item);
          this.changeDetectorRef.markForCheck();
        });
    } else {
      if (!!this.item.listings && !!this.item.listings.itemListings) {
        this.sellsListings = this.item.listings.itemListings.filter(
          listing => listing.listingType === EquipmentItemListingType.SELLS
        );
        this.pairsWellListings = this.item.listings.itemListings.filter(
          listing => listing.listingType === EquipmentItemListingType.PAIRS_WELL
        );
      }

      _onChanges(this.item);
    }
  }

  openRetailersOffcanvas() {
    this.offcanvasService.open(this.retailersTemplate, {
      panelClass: "equipment-item-display-name-retailers-offcanvas",
      backdropClass: "equipment-item-display-name-retailers-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  openItemUnapprovedInfoModal(item: EquipmentItemBaseInterface) {
    const modal: NgbModalRef = this.modalService.open(ItemUnapprovedInfoModalComponent);
    modal.componentInstance.item = item;
  }
}
