import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, take } from "rxjs/operators";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UserService } from "@shared/services/user.service";

@Component({
  selector: "" + "astrobin-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"]
})
export class AvatarComponent extends BaseComponentDirective implements OnChanges {
  protected avatarUrl: string = "/assets/images/default-avatar.jpeg?v=2";
  protected url: string;

  @Input()
  user: UserInterface;

  @Input()
  userId: UserInterface["id"];

  @Input()
  link = true;

  @Input()
  showPremiumBadge = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly userService: UserService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user || changes.userId) {
      if (this.userId && !this.user) {
        this.store$.select(selectUser, this.userId).pipe(
          filter(user => !!user),
          take(1)
        ).subscribe(user => {
          this.user = user;
          this._setAvatar();
          this._setUrl();
        });

        this.store$.dispatch(new LoadUser({ id: this.userId }));
      } else if (this.user) {
        this._setAvatar();
        this._setUrl();
      }
    }
  }

  protected openGallery(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      this.userService.openGallery(this.user.username, currentUserProfile?.enableNewGalleryExperience);
    });
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

  private _setUrl(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
     return this.userService.getGalleryUrl(this.user.username, currentUserProfile?.enableNewGalleryExperience);
    });
  }
}
