import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-item-summary-modal",
  templateUrl: "./item-unapproved-info-modal.component.html",
  styleUrls: ["./item-unapproved-info-modal.component.scss"]
})
export class ItemUnapprovedInfoModalComponent extends BaseComponentDirective {
  @Input()
  item: EquipmentItemBaseInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal
  ) {
    super(store$);
  }
}
