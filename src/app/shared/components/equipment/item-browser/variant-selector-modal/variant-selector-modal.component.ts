import { Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-variant-selector-modal",
  templateUrl: "./variant-selector-modal.component.html",
  styleUrls: ["./variant-selector-modal.component.scss"]
})
export class VariantSelectorModalComponent extends BaseComponentDirective {
  @Input()
  variants: EquipmentItemBaseInterface[];

  @Input()
  enableSelectFrozen = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  variantClicked($event, variant: EquipmentItem) {
    if (variant.frozenAsAmbiguous && !this.enableSelectFrozen) {
      return this.equipmentItemService.cannotSelectedBecauseFrozenAsAmbiguousError();
    }

    this.modal.close(variant);
  }
}
