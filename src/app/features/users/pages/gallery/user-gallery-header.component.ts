import { Component, Input } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-header",
  template: `
    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="user-gallery-header">
      <img *ngIf="userProfile.galleryHeaderImage" [ngSrc]="userProfile.galleryHeaderImage" fill alt="" />
      <div *ngIf="!userProfile.galleryHeaderImage" class="no-image"></div>

      <div class="user-info d-flex justify-content-between">
        <div class="d-flex gap-3 align-items-center">
          <astrobin-avatar [user]="user"></astrobin-avatar>

          <div class="d-flex flex-column gap-2">
            <div class="d-flex gap-3 align-items-center">
              <astrobin-username [user]="user" [link]="false"></astrobin-username>
              <astrobin-toggle-property
                *ngIf="userContentType && currentUserWrapper.user?.id !== user.id"
                [contentType]="userContentType.id"
                [objectId]="user.id"
                [userId]="currentUserWrapper.user?.id"
                [showIcon]="false"
                [setLabel]="'Follow' | translate"
                [unsetLabel]="'Unfollow' | translate"
                class="w-auto"
                btnClass="btn btn-outline-secondary btn-no-block"
                propertyType="follow"
              ></astrobin-toggle-property>
            </div>
            <div class="d-flex gap-3 align-items-center images-and-followers">
              <span translate="{{ 0 }} images" [translateParams]="{'0': user.imageCount}"></span>
              <span translate="{{ 0 }} followers" [translateParams]="{'0': user.followerCount}"></span>
              <span translate="{{ 0 }} following" [translateParams]="{'0': user.followingCount}"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./user-gallery-header.component.scss"]
})
export class UserGalleryHeaderComponent extends BaseComponentDirective {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  protected userContentType: ContentTypeInterface;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
    this._setUserContentType();
  }

  private _setUserContentType() {
    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => this.userContentType = contentType);
    this.store$.dispatch(new LoadContentType({ appLabel: "auth", model: "user" }));
  }
}
