import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { UserInterface } from "@shared/interfaces/user.interface";
import { LoadUser } from "@features/account/store/auth.actions";
import { Observable } from "rxjs";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-user-card",
  templateUrl: "./marketplace-user-card.component.html",
  styleUrls: ["./marketplace-user-card.component.scss"]
})
export class MarketplaceUserCardComponent extends BaseComponentDirective implements OnInit {
  @Input()
  userId: UserInterface["id"];

  user$: Observable<UserInterface>;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.user$ = this.store$.select(selectUser, this.userId).pipe(
      filter(user => !!user),
      takeUntil(this.destroyed$)
    );

    this.store$.dispatch(new LoadUser({ id: this.userId }))
  }
}
