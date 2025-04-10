import type { OnChanges, OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UserService } from "@core/services/user.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { filter, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-username",
  templateUrl: "./username.component.html",
  styleUrls: ["./username.component.scss"],
  providers: [UsernameService]
})
export class UsernameComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  user: UserInterface;

  @Input()
  userId: UserInterface["id"];

  @Input()
  link = true;

  @Input()
  linkTarget = "_self";

  username: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly usernameService: UsernameService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly userService: UserService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this._initUsername();
  }

  ngOnChanges() {
    this._initUsername();
  }

  private _initUsername() {
    if (this.user) {
      this.usernameService.getDisplayName$(this.user).subscribe(username => {
        this.username = username;
      });
    } else if (this.userId) {
      this.store$
        .select(selectUser, this.userId)
        .pipe(
          filter(user => !!user),
          tap(user => (this.user = user)),
          take(1),
          switchMap(user => this.usernameService.getDisplayName$(user))
        )
        .subscribe(username => (this.username = username));
      this.store$.dispatch(new LoadUser({ id: this.userId }));
    }
  }
}
