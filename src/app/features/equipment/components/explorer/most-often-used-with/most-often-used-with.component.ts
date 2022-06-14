import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { GetMostOftenUsedWith, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem, selectMostOftenUsedWithForItem } from "@features/equipment/store/equipment.selectors";
import { filter, take, takeUntil } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Observable, Subscription } from "rxjs";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";

@Component({
  selector: "astrobin-equipment-item-most-often-used-with",
  templateUrl: "./most-often-used-with.component.html",
  styleUrls: ["./most-often-used-with.component.scss"]
})
export class MostOftenUsedWithComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  item: EquipmentItem;

  subscription: Subscription;
  mostOftenUsedWith: { item: EquipmentItem; imageCount: number }[];
  fullSearchAllowed$: Observable<boolean> = this.userSubscriptionService.fullSearchAllowed$();

  constructor(
    public readonly store$: Store<State>,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    this.mostOftenUsedWith = undefined;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.store$
      .select(selectMostOftenUsedWithForItem, { itemType: this.item.klass, itemId: this.item.id })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (data === undefined) {
          return;
        }

        this.mostOftenUsedWith = [];

        for (const key of Object.keys(data)) {
          const [type, id] = key.split("-");
          const itemData = { type: type as EquipmentItemType, id: parseInt(id, 10) };
          this.store$
            .select(selectEquipmentItem, itemData)
            .pipe(
              filter(item => !!item),
              take(1)
            )
            .subscribe(item => this.mostOftenUsedWith.push({ item, imageCount: data[key] }));
          this.store$.dispatch(new LoadEquipmentItem(itemData));
        }
      });

    this.store$.dispatch(new GetMostOftenUsedWith({ itemType: this.item.klass, itemId: this.item.id }));
  }

  sortedItems(items: { item: EquipmentItem; imageCount: number }[]): { item: EquipmentItem; imageCount: number }[] {
    return items.sort((a, b) => b.imageCount - a.imageCount);
  }

  onViewMore(): void {
    const modal: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
    const component: SubscriptionRequiredModalComponent = modal.componentInstance;
    component.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
  }
}
