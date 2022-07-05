import { Component, HostBinding, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { CompareService } from "@features/equipment/services/compare.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { WindowRefService } from "@shared/services/window-ref.service";
import { fromEvent } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentCompareModalComponent } from "@features/equipment/components/equipment-compare-modal/equipment-compare-modal.component";

@Component({
  selector: "astrobin-equipment-compare",
  templateUrl: "./equipment-compare.component.html",
  styleUrls: ["./equipment-compare.component.scss"]
})
export class EquipmentCompareComponent extends BaseComponentDirective implements OnInit {
  @HostBinding("class.d-block")
  show = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly compareService: CompareService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly windowRefService: WindowRefService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.setVisibility();
      });

    this.compareService.changes.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.setVisibility();
    });

    this.setVisibility();
  }

  setVisibility() {
    this.show = this.windowRefService.nativeWindow.innerWidth >= 992 && this.compareService.amount() > 0;
  }

  image(item: EquipmentItem) {
    if (!!item.image) {
      return item.image;
    }

    return `/assets/images/${item.klass.toLowerCase()}-placeholder.png`;
  }

  compare() {
    this.modalService.open(EquipmentCompareModalComponent, { size: "xl", windowClass: "fullscreen" });
  }
}
