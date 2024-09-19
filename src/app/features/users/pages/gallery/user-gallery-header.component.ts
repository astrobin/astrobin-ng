import { Component, Input, OnInit } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, map, take } from "rxjs/operators";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FindImages, FindImagesSuccess, LoadImages } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";

@Component({
  selector: "astrobin-user-gallery-header",
  template: `

    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="user-gallery-header">
      <img *ngIf="userProfile.galleryHeaderImage" [ngSrc]="userProfile.galleryHeaderImage" fill alt="" />
      <div *ngIf="!userProfile.galleryHeaderImage" class="no-image"></div>

      <div class="user-info d-flex justify-content-between">
        <div class="d-flex gap-3 align-items-center">
          <astrobin-avatar [user]="user" [link]="false"></astrobin-avatar>

          <div class="d-flex flex-column gap-2">
            <div class="d-flex gap-3 align-items-center">
              <astrobin-username [user]="user" [link]="false"></astrobin-username>
              <div *ngIf="user.displayName !== user.username" class="username">({{ user.username }})</div>
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
              <span [translate]="'{{ 0 }} images'" [translateParams]="{'0': userProfile.imageCount}"></span>
              <span
                *ngIf="userProfile.wipImageCount && currentUserWrapper.user?.id === user.id"
                [translate]="'({{ 0 }} in staging)'"
                [translateParams]="{'0': userProfile.wipImageCount}"></span>
              <span [translate]="'{{ 0 }} followers'" [translateParams]="{'0': userProfile.followersCount}"></span>
              <span [translate]="'{{ 0 }} following'" [translateParams]="{'0': userProfile.followingCount}"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./user-gallery-header.component.scss"]
})
export class UserGalleryHeaderComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  protected userContentType: ContentTypeInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageApiService: ImageApiService
  ) {
    super(store$);
    this._setUserContentType();
  }

  ngOnInit() {
    super.ngOnInit();
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
