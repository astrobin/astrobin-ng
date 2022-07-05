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
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { Router } from "@angular/router";

@Component({
  selector: "astrobin-equipment-compare-modal",
  templateUrl: "./equipment-compare-modal.component.html",
  styleUrls: ["./equipment-compare-modal.component.scss"]
})
export class EquipmentCompareModalComponent extends BaseComponentDirective implements OnInit {
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;

  public data: ComparisonInterface;

  get rows() {
    if (!this.data) {
      return [];
    }

    const compareItems = this.compareService.getAll();
    const retVal = [];

    // We need to preserve the order in which they were added to the CompareService.
    for (const item of compareItems) {
      retVal.push(this.data[item.id]);
    }

    return retVal;
  }

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly compareService: CompareService,
    public readonly windowRefService: WindowRefService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.compareService.comparison$().subscribe(data => {
      this.data = data;
    });

    fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => {
        if (this.windowRefService.nativeWindow.innerWidth < 992) {
          this.modal.dismiss();
        }
      });
  }

  editButtonClicked(klass: EquipmentItem["klass"], id: EquipmentItem["id"]) {
    this.router
      .navigate(["equipment", "explorer", klass.toLowerCase(), id], { queryParams: { edit: "true" } })
      .then(() => {
        this.modal.close();
        this.compareService.clear();
      });
  }
}
