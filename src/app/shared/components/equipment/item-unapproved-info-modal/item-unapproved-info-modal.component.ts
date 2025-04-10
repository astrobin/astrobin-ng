import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-item-summary-modal",
  templateUrl: "./item-unapproved-info-modal.component.html",
  styleUrls: ["./item-unapproved-info-modal.component.scss"]
})
export class ItemUnapprovedInfoModalComponent extends BaseComponentDirective {
  @Input()
  item: EquipmentItemBaseInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal
  ) {
    super(store$);
  }
}
