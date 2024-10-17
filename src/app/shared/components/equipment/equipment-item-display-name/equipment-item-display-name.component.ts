import { Component, HostBinding, Input, OnChanges, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { EquipmentItemBaseInterface, EquipmentItemReviewerDecision, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";
import { filter, take } from "rxjs/operators";
import { EquipmentItemService } from "@shared/services/equipment-item.service";
import { NgbModal, NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { ItemSummaryModalComponent } from "@shared/components/equipment/summaries/item-summary-modal/item-summary-modal.component";
import { ItemUnapprovedInfoModalComponent } from "@shared/components/equipment/item-unapproved-info-modal/item-unapproved-info-modal.component";
import { UtilsService } from "@shared/services/utils/utils.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: "astrobin-equipment-item-display-name",
  templateUrl: "./equipment-item-display-name.component.html",
  styleUrls: ["./equipment-item-display-name.component.scss"]
})
export class EquipmentItemDisplayNameComponent extends BaseComponentDirective implements OnChanges {
  readonly EquipmentItemReviewerDecision = EquipmentItemReviewerDecision;

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
  enableSummaryModal = false;

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
    public readonly deviceService: DeviceService
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
            });
          this.store$.dispatch(new LoadBrand({ id: this.item.brand }));
        }
      } else {
        this.brandName = this.translateService.instant("(DIY)");
      }

      this.equipmentItemService
        .getName$(this.item)
        .pipe(take(1))
        .subscribe(name => (this.itemName = name.replace(this.cut, "")));

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
          _onChanges(item);
        });
    } else {
      _onChanges(this.item);
    }
  }

  openRetailersOffcanvas() {
    this.offcanvasService.open(this.retailersTemplate, { position: this.deviceService.offcanvasPosition() });
  }

  openItemSummaryModal(item: EquipmentItemBaseInterface) {
    const modal: NgbModalRef = this.modalService.open(ItemSummaryModalComponent);
    modal.componentInstance.item = item;
  }

  openItemUnapprovedInfoModal(item: EquipmentItemBaseInterface) {
    const modal: NgbModalRef = this.modalService.open(ItemUnapprovedInfoModalComponent);
    modal.componentInstance.item = item;
  }
}
