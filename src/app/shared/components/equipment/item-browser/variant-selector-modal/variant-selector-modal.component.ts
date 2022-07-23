import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";

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
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  variantClicked($event, variant: EquipmentItem) {
    if (variant.frozenAsAmbiguous && !this.enableSelectFrozen) {
      this.popNotificationsService.error(
        this.translateService.instant("This item cannot be selected because it's frozen as ambiguous.")
      );
      return;
    }

    this.modal.close(variant);
  }
}
