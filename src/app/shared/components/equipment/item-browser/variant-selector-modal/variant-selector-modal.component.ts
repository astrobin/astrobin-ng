import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";

@Component({
  selector: "astrobin-variant-selector-modal",
  templateUrl: "./variant-selector-modal.component.html",
  styleUrls: ["./variant-selector-modal.component.scss"]
})
export class VariantSelectorModalComponent extends BaseComponentDirective {
  @Input()
  variants: EquipmentItemBaseInterface[];

  constructor(public readonly store$: Store<State>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
