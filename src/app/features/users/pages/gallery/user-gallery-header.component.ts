import { Component, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { UserProfileInterface, UserProfileStatsInterface } from "@shared/interfaces/user-profile.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";

@Component({
  selector: "astrobin-user-gallery-header",
  template: `
    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="user-gallery-header">
      <img *ngIf="userProfile.galleryHeaderImage" [ngSrc]="userProfile.galleryHeaderImage" fill alt="" />
      <div *ngIf="!userProfile.galleryHeaderImage" class="no-image"></div>

      <div class="user-info d-flex justify-content-between">
        <div class="d-flex gap-3 align-items-center">
          <astrobin-avatar [user]="user" [link]="false"></astrobin-avatar>

          <div class="d-flex flex-column gap-1">
            <div class="d-flex flex-column flex-sm-row gap-sm-3 align-items-sm-center">
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
            <div class="d-flex gap-3 align-items-center images-and-followers flex-wrap">
              <span [translate]="'{{ 0 }} images'" [translateParams]="{'0': userProfile.imageCount}"></span>
              <span
                *ngIf="userProfile.wipImageCount && currentUserWrapper.user?.id === user.id"
                [translate]="'({{ 0 }} in staging)'"
                [translateParams]="{'0': userProfile.wipImageCount}"
                class="d-none d-sm-inline"
              ></span>
              <span
                [translate]="'{{ 0 }} followers'" [translateParams]="{'0': userProfile.followersCount}"
              ></span>
              <span
                [translate]="'{{ 0 }} following'" [translateParams]="{'0': userProfile.followingCount}"
                class="d-none d-sm-inline"
              ></span>
              <a
                (click)="openStatsOffcanvas()"
                astrobinEventPreventDefault
                class="btn btn-xs btn-outline-secondary btn-no-block"
                href=""
                translate="More"
              ></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #statsOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ user.displayName }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <table *ngIf="stats; else loadingTemplate" class="table table-striped">
          <tbody>
          <tr *ngFor="let stat of stats.stats">
            <td>{{ stat[0] }}</td>
            <td *ngIf="!stat[2]">{{ stat[1] }}</td>
            <td *ngIf="stat[2] && stat[2] === 'datetime'">
              {{ stat[1] | localDate | timeago }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-header.component.scss"]
})
export class UserGalleryHeaderComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @ViewChild("statsOffcanvas") statsOffcanvas: TemplateRef<any>;

  protected userContentType: ContentTypeInterface;
  protected stats: UserProfileStatsInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageApiService: ImageApiService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly commonApiService: CommonApiService
  ) {
    super(store$);
    this._setUserContentType();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  protected openStatsOffcanvas() {
    this.offcanvasService.open(
      this.statsOffcanvas, {
        position: this.deviceService.offcanvasPosition()
      }
    );

    if (!this.stats) {
      this.commonApiService.getUserProfileStats(this.userProfile.id).subscribe(stats => {
        this.stats = stats;
      });
    }
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
