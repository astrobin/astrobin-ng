import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Subscription } from "rxjs";

@Component({
  selector: "astrobin-users-using-equipment-item",
  templateUrl: "./users-using-item.component.html",
  styleUrls: ["../objects-using-item.component.scss"]
})
export class UsersUsingItemComponent extends BaseComponentDirective {
  @Input()
  users: UserInterface[];

  subscription: Subscription;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }
}
