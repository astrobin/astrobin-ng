import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-item-summary-modal",
  templateUrl: "./item-summary-modal.component.html",
  styleUrls: ["./item-summary-modal.component.scss"]
})
export class ItemSummaryModalComponent extends BaseComponentDirective {
  @Input()
  item: EquipmentItemBaseInterface;

  constructor(public readonly store$: Store<State>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
