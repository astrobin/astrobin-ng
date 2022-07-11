import { Component, EventEmitter, HostBinding, OnInit, Output } from "@angular/core";
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

  @Output()
  visibilityChanged = new EventEmitter<boolean>();

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
    fromEvent(this.windowRefService.nativeWindow, "resize")
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
    this.visibilityChanged.emit(this.show);
  }

  image(item: EquipmentItem) {
    if (!!item.image) {
      return item.image;
    }

    return `/assets/images/${item.klass.toLowerCase()}-placeholder.png`;
  }

  compare() {
    const windowWidth = this.windowRefService.nativeWindow.innerWidth;
    const amount = this.compareService.amount();
    let windowClass = "";

    if ((windowWidth < 1200 && amount > 2) || amount > 3) {
      windowClass = "fullscreen";
    }

    this.modalService.open(EquipmentCompareModalComponent, { size: "lg", windowClass });
  }
}
