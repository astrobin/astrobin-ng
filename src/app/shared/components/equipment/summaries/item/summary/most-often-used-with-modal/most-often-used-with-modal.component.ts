import { OnChanges, OnInit, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { GetMostOftenUsedWith } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem, selectMostOftenUsedWithForItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-most-often-used-with-modal",
  templateUrl: "./most-often-used-with-modal.component.html",
  styleUrls: ["./most-often-used-with-modal.component.scss"]
})
export class MostOftenUsedWithModalComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  item: EquipmentItem;

  mostOftenUsedWith: { item: EquipmentItem; matches: number }[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._loadData();
  }

  ngOnChanges(): void {
    this._loadData();
  }

  sortedItems(items: { item: EquipmentItem; matches: number }[]): { item: EquipmentItem; matches: number }[] {
    return items.sort((a, b) => b.matches - a.matches);
  }

  _loadData() {
    this.mostOftenUsedWith = undefined;

    this.store$
      .select(selectMostOftenUsedWithForItem, { itemType: this.item.klass, itemId: this.item.id })
      .pipe(
        filter(data => !!data),
        take(1)
      )
      .subscribe(data => {
        const keys: string[] = Object.keys(data);

        if (keys.length === 0) {
          this.mostOftenUsedWith = [];
          return;
        }

        for (const key of keys) {
          const [type, id] = key.split("-");
          const itemData = { type: type as EquipmentItemType, id: parseInt(id, 10) };
          this.store$
            .select(selectEquipmentItem, itemData)
            .pipe(
              filter(item => !!item),
              take(1)
            )
            .subscribe(item => {
              if (this.mostOftenUsedWith === undefined) {
                this.mostOftenUsedWith = [];
              }

              this.mostOftenUsedWith.push({ item, matches: data[key] });
            });
        }
      });

    this.store$.dispatch(new GetMostOftenUsedWith({ itemType: this.item.klass, itemId: this.item.id }));
  }
}
