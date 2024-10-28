import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from "rxjs/operators";
import { UserProfileInterface, UserProfileStatsInterface } from "@shared/interfaces/user-profile.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { CommonApiService, FollowersInterface, FollowingInterface } from "@shared/services/api/classic/common/common-api.service";
import { SearchService } from "@features/search/services/search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Subject } from "rxjs";

@Component({
  selector: "astrobin-user-gallery-header",
  template: `
    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="user-gallery-header">
      <button
        *ngIf="currentUserWrapper.user?.id === user.id"
        (click)="openChangeHeaderImageOffcanvas()"
        class="btn btn-link btn-no-block btn-change-header-image"
        translate="Change header image"
      ></button>
      <img *ngIf="userProfile.galleryHeaderImage" [src]="userProfile.galleryHeaderImage" alt="" />
      <div *ngIf="!userProfile.galleryHeaderImage" class="no-image"></div>

      <div class="user-info d-flex justify-content-between">
        <div class="d-flex gap-3 align-items-center">
          <astrobin-avatar [user]="user" [link]="false" [showPremiumBadge]="true"></astrobin-avatar>

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
                (click)="openFollowersOffcanvas()"
                [translate]="'{{ 0 }} followers'" [translateParams]="{'0': userProfile.followersCount}"
                data-toggle="offcanvas"
              ></span>
              <span
                (click)="openFollowingOffcanvas()"
                [translate]="'{{ 0 }} following'" [translateParams]="{'0': userProfile.followingCount}"
                class="d-none d-sm-inline"
                data-toggle="offcanvas"
              ></span>
              <a
                (click)="openStatsOffcanvas()"
                astrobinEventPreventDefault
                class="btn btn-xs btn-outline-secondary btn-no-block"
                href=""
                translate="More"
              ></a>
            </div>
            <div
              *ngIf="currentUserWrapper.user?.id === user.id"
              class="d-flex align-items-center images-and-followers flex-wrap my-bookmarks-and-likes"
            >
              <button
                (click)="searchBookmarks()"
                class="btn btn-xs btn-outline-secondary btn-no-block"
              >
                <fa-icon [icon]="['fas', 'bookmark']"></fa-icon>
                {{ "My bookmarks" | translate }}
              </button>

              <button
                (click)="searchLikedImages()"
                class="btn btn-xs btn-outline-secondary btn-no-block"
              >
                <fa-icon [icon]="['fas', 'thumbs-up']"></fa-icon>
                {{ "My likes" | translate }}
              </button>
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

    <ng-template #changeHeaderImageOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="Change header image"></h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-user-gallery-header-change-image
          [user]="user"
          [userProfile]="userProfile"
          (imageChange)="offcanvas.close()"
        ></astrobin-user-gallery-header-change-image>
      </div>
    </ng-template>

    <ng-template #followersOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="Followers"></h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <div *ngIf="followers; else loadingTemplate" class="d-flex flex-column gap-1">
          <input
            type="search"
            class="form-control mb-2"
            placeholder="{{ 'Search' | translate }}"
            [ngModelOptions]="{standalone: true}"
            [(ngModel)]="followersSearch"
            (ngModelChange)="followersSearchSubject.next($event)"
          />
          <ng-container *ngIf="!searching; else loadingTemplate">
            <a *ngFor="let follower of followers.followers" [routerLink]="['/u', follower[1]]">
              {{ follower[2] || follower[1] }}
            </a>
          </ng-container>
        </div>
      </div>
    </ng-template>

    <ng-template #followingOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="Following"></h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <div *ngIf="following; else loadingTemplate" class="d-flex flex-column gap-1">
          <input
            type="search"
            class="form-control mb-2"
            placeholder="{{ 'Search' | translate }}"
            [ngModelOptions]="{standalone: true}"
            [(ngModel)]="followingSearch"
            (ngModelChange)="followingSearchSubject.next($event)"
          />
          <ng-container *ngIf="!searching; else loadingTemplate">
            <a *ngFor="let following of following.following" [routerLink]="['/u', following[1]]">
              {{ following[2] || following[1] }}
            </a>
          </ng-container>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-header.component.scss"]
})
export class UserGalleryHeaderComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @ViewChild("statsOffcanvas") statsOffcanvas: TemplateRef<any>;
  @ViewChild("changeHeaderImageOffcanvas") changeHeaderImageOffcanvas: TemplateRef<any>;
  @ViewChild("followersOffcanvas") followersOffcanvas: TemplateRef<any>;
  @ViewChild("followingOffcanvas") followingOffcanvas: TemplateRef<any>;

  protected userContentType: ContentTypeInterface;
  protected stats: UserProfileStatsInterface;
  protected followers: FollowersInterface;
  protected following: FollowingInterface
  protected followersSearch: string;
  protected followingSearch: string;
  protected followersSearchSubject = new Subject<string>();
  protected followingSearchSubject = new Subject<string>();
  protected searching = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageApiService: ImageApiService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly commonApiService: CommonApiService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
    this._setUserContentType();
  }

  ngOnInit() {
    super.ngOnInit();

    this.followersSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => this._searchFollowers(searchTerm));

    this.followingSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => this._searchFollowing(searchTerm));
  }

  ngAfterViewInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has("followers")) {
      this.openFollowersOffcanvas();
    } else if (this.activatedRoute.snapshot.queryParamMap.has("following")) {
      this.openFollowingOffcanvas();
    }
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

  protected openChangeHeaderImageOffcanvas() {
    this.offcanvasService.open(
      this.changeHeaderImageOffcanvas, {
        position: this.deviceService.offcanvasPosition()
      }
    );
  }

  protected openFollowersOffcanvas() {
    this._searchFollowers();
    this.offcanvasService.open(
      this.followersOffcanvas, {
        position: this.deviceService.offcanvasPosition()
      }
    );
  }

  protected openFollowingOffcanvas() {
    this._searchFollowing();
    this.offcanvasService.open(
      this.followingOffcanvas, {
        position: this.deviceService.offcanvasPosition()
      }
    );
  }

  protected searchBookmarks() {
    const params = this.searchService.modelToParams(
      {
        "personal_filters": {
          "value": [ "my_bookmarks" ],
        }
      }
    );
    this.router.navigateByUrl(`/search?p=${params}`).then(() => {
      this.windowRefService.scroll({ top: 0 });
    });
  }

  protected searchLikedImages() {
    const params = this.searchService.modelToParams(
      {
        "personal_filters": {
          "value": [ "my_likes" ],
        }
      }
    );
    this.router.navigateByUrl(`/search?p=${params}`).then(() => {
      this.windowRefService.scroll({ top: 0 });
    });
  }

  private _searchFollowers(searchTerm?: string) {
    this.searching = true;
    this.commonApiService.getUserProfileFollowers(this.userProfile.id, searchTerm).subscribe(followers => {
      this.followers = followers;
      this.searching = false;
    });
  }

  private _searchFollowing(searchTerm?: string) {
    this.searching = true;
    this.commonApiService.getUserProfileFollowing(this.userProfile.id, searchTerm).subscribe(following => {
      this.following = following;
      this.searching = false;
    });
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
