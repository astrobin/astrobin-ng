import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { GetUsers } from "@features/equipment/store/equipment.actions";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUsersUsingEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { skip, takeUntil } from "rxjs/operators";
import { LoadingService } from "@shared/services/loading.service";
import { Subscription } from "rxjs";

@Component({
  selector: "astrobin-users-using-equipment-item",
  templateUrl: "./users-using-item.component.html",
  styleUrls: ["../objects-using-item.component.scss"]
})
export class UsersUsingItemComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  itemType: EquipmentItemType;

  @Input()
  itemId: EquipmentItemBaseInterface["id"];

  users: UserInterface[];

  subscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    const data = { itemType: this.itemType, itemId: this.itemId };

    this.users = undefined;

    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }

    this.store$
      .select(selectUsersUsingEquipmentItem, data)
      .pipe(takeUntil(this.destroyed$), skip(1))
      .subscribe(usersUsingEquipmentItem => {
        this.users = usersUsingEquipmentItem ? usersUsingEquipmentItem.users : [];
      });

    this.store$.dispatch(new GetUsers(data));
  }
}
