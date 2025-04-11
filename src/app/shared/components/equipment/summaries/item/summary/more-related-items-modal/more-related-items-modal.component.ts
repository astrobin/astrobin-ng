import { Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal
  ) {
    super(store$);
  }
}
