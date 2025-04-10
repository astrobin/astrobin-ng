import { OnInit, Component, EventEmitter, HostBinding, Output } from "@angular/core";
import { MainState } from "@app/store/state";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentCompareModalComponent } from "@features/equipment/components/equipment-compare-modal/equipment-compare-modal.component";
import { CompareService } from "@features/equipment/services/compare.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { fromEvent } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

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
    public readonly store$: Store<MainState>,
    public readonly compareService: CompareService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly windowRefService: WindowRefService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

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

    return `/assets/images/${item.klass.toLowerCase()}-placeholder.png?v=2`;
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
