import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  user: UserInterface;

  @Input()
  userId: UserInterface["id"];

  @Input()
  link = true;

  @Input()
  linkTarget = "_self";

  username$: Observable<string>;

  constructor(
    public readonly store$: Store<State>,
    public readonly usernameService: UsernameService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges() {
    if (this.user) {
      this.username$ = this.usernameService.getDisplayName$(this.user);
    } else if (this.userId) {
      this.username$ = this.store$.select(selectUser, this.userId).pipe(
        filter(user => !!user),
        tap(user => (this.user = user)),
        take(1),
        switchMap(user => this.usernameService.getDisplayName$(user))
      );
      this.store$.dispatch(new LoadUser({ id: this.userId }));
    }
  }
}
