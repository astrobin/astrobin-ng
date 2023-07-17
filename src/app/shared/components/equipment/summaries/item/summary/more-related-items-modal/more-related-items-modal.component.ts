import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-more-related-items-modal",
  templateUrl: "./more-related-items-modal.component.html",
  styleUrls: ["./more-related-items-modal.component.scss"]
})
export class MoreRelatedItemsModalComponent extends BaseComponentDirective {
  @Input()
  items: EquipmentItem[];

  @Input()
  title: string;

  constructor(public readonly store$: Store<State>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
