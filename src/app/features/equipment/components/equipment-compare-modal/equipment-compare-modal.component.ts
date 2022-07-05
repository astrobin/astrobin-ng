import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CompareService, ComparisonInterface } from "@features/equipment/services/compare.service";
import { EquipmentItemDisplayProperty } from "@features/equipment/services/equipment-item.service";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-equipment-compare-modal",
  templateUrl: "./equipment-compare-modal.component.html",
  styleUrls: ["./equipment-compare-modal.component.scss"]
})
export class EquipmentCompareModalComponent extends BaseComponentDirective implements OnInit {
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;

  public data: ComparisonInterface;

  public firstItem;

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly compareService: CompareService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.compareService.comparison$().subscribe(data => {
      this.data = data;
      this.firstItem = data[Object.keys(data)[0]];
    });

    fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => {
        if (this.windowRefService.nativeWindow.innerWidth < 992) {
          this.modal.dismiss();
        }
      });
  }
}
