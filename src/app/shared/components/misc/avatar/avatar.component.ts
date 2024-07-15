import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "" + "astrobin-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"]
})
export class AvatarComponent extends BaseComponentDirective implements OnInit {
  avatarUrl: string = "/assets/images/default-avatar.jpeg?v=2";

  @Input()
  user: UserInterface;

  @Input()
  userId: UserInterface["id"];

  @Input()
  link = true;

  constructor(public readonly store$: Store<State>, public readonly classicRoutesService: ClassicRoutesService) {
    super(store$);
  }

  ngOnInit(): void {
    if (this.userId && !this.user) {
      this.store$.select(selectUser, this.userId).pipe(
        filter(user => !!user),
        take(1)
      ).subscribe(user => {
        this.user = user;
        this._setAvatar();
      });

      this.store$.dispatch(new LoadUser({ id: this.userId }));
    } else if (this.user) {
      this._setAvatar();
    }
  }

  private _setAvatar(): void {
    if (
      this.user.hasOwnProperty("largeAvatar") &&
      typeof this.user.largeAvatar === "string"
      && this.user.largeAvatar.indexOf("default-avatar") > -1
    ) {
      this.avatarUrl = "/assets/images/default-avatar.jpeg?v=2";
    } else {
      this.avatarUrl = this.user.largeAvatar;
    }
  }
}
