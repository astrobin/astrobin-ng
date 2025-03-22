import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from "rxjs/operators";
import { UserProfileInterface, UserProfileStatsInterface } from "@core/interfaces/user-profile.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { CommonApiService, FollowersInterface, FollowingInterface, MutualFollowersInterface } from "@core/services/api/classic/common/common-api.service";
import { SearchService } from "@core/services/search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowRefService } from "@core/services/window-ref.service";
import { Subject } from "rxjs";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { RemoveShadowBanUserProfile, ShadowBanUserProfile } from "@features/account/store/auth.actions";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-user-gallery-header",
  template: `
    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="user-gallery-header">
      <img *ngIf="userProfile.galleryHeaderImage" [src]="userProfile.galleryHeaderImage" (error)="handleImageError($event)" alt="" />
      <div *ngIf="!userProfile.galleryHeaderImage" class="no-image">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
      </div>
      <div class="header-gradient"></div>
      <div class="user-info d-flex justify-content-between">
        <div class="d-flex gap-3 align-items-center">
          <div class="avatar-container position-relative">
            <astrobin-avatar
              [user]="user"
              [link]="false"
              [showPremiumBadge]="true"
              [showFollowsYouBadge]="true"
            ></astrobin-avatar>
          </div>

          <div class="d-flex flex-column gap-3 gap-md-2">
            <div class="d-flex flex-column flex-sm-row username-and-follows align-items-sm-center">
              <div class="d-flex flex-row align-items-center gap-3">
                <astrobin-username
                  [user]="user" [link]="false"
                  class="d-inline-block"
                ></astrobin-username>

                <div
                  *ngIf="user.displayName !== user.username"
                  class="username d-none d-sm-block"
                >
                  ({{ user.username }})
                </div>

                <div ngbDropdown class="d-inline-block py-0">
                  <button
                    class="btn btn-sm btn-link btn-no-block no-toggle text-secondary px-2"
                    id="user-gallery-dropdown"
                    ngbDropdownToggle
                  >
                    <fa-icon [icon]="['fas', 'ellipsis-v']" class="m-0"></fa-icon>
                  </button>
                  <div ngbDropdownMenu [attr.aria-labelledby]="'user-gallery-dropdown'">
                    <button
                      *ngIf="currentUserWrapper.user?.id === user.id"
                      (click)="openChangeHeaderImageOffcanvas()"
                      class="dropdown-item"
                      translate="Change header image"
                    ></button>
                    <a
                      *ngIf="currentUserWrapper.user?.id === user.id"
                      [href]="classicRoutesService.SETTINGS"
                      class="dropdown-item"
                      translate="Settings"
                    ></a>
                    <a
                      *ngIf="currentUserWrapper.user?.id !== user.id && !currentUserWrapper.userProfile?.shadowBans?.includes(userProfile.id)"
                      (click)="shadowBan(userProfile.id)"
                      href="#"
                      astrobinEventPreventDefault
                      astrobinEventStopPropagation
                      class="dropdown-item"
                      translate="Shadow-ban"
                    ></a>
                    <a
                      *ngIf="currentUserWrapper.user?.id !== user.id && currentUserWrapper.userProfile?.shadowBans?.includes(userProfile.id)"
                      (click)="removeShadowBan(userProfile.id)"
                      href="#"
                      astrobinEventPreventDefault
                      astrobinEventStopPropagation
                      class="dropdown-item"
                      translate="Remove shadow-ban"
                    ></a>
                    <a
                      *ngIf="currentUserWrapper.user?.id !== user.id"
                      [href]="classicRoutesService.SEND_MESSAGE(user.username)"
                      class="dropdown-item"
                      translate="Send private message"
                    ></a>
                  </div>
                </div>
              </div>

              <astrobin-toggle-property
                *ngIf="userContentType && currentUserWrapper.user?.id !== user.id"
                [contentType]="userContentType.id"
                [objectId]="user.id"
                [userId]="currentUserWrapper.user?.id"
                [showIcon]="false"
                [setLabel]="'Follow' | translate"
                [unsetLabel]="'Unfollow' | translate"
                class="w-auto p-0"
                btnClass="btn btn-dark btn-no-block"
                propertyType="follow"
              ></astrobin-toggle-property>
            </div>
            <div class="d-flex align-items-center images-and-followers flex-wrap">
              <span
                *ngIf="userProfile.imageCount === 1"
                translate="1 image"
              ></span>
              <span
                *ngIf="userProfile.imageCount !== 1"
                [translate]="'{{ 0 }} images'"
                [translateParams]="{'0': userProfile.imageCount}"
              ></span>

              <span
                *ngIf="userProfile.wipImageCount === 1 && currentUserWrapper.user?.id === user.id"
                translate="(1 in staging)"
                class="d-none d-sm-inline"
              ></span>
              <span
                *ngIf="userProfile.wipImageCount > 1 && currentUserWrapper.user?.id === user.id"
                [translate]="'({{ 0 }} in staging)'"
                [translateParams]="{'0': userProfile.wipImageCount}"
                class="d-none d-sm-inline"
              ></span>

              <span
                *ngIf="userProfile.followersCount === 1"
                (click)="openFollowersOffcanvas()"
                translate="1 follower"
                data-toggle="offcanvas"
              ></span>
              <span
                *ngIf="userProfile.followersCount !== 1"
                (click)="userProfile.followersCount ? openFollowersOffcanvas() : null"
                [translate]="'{{ 0 }} followers'" [translateParams]="{'0': userProfile.followersCount}"
                [attr.data-toggle]="userProfile.followersCount ? 'offcanvas' : ''"
              ></span>

              <span
                *ngIf="currentUserWrapper.user?.id === user.id && userProfile.followingCount === 1"
                (click)="openFollowingOffcanvas()"
                translate="1 following"
                data-toggle="offcanvas"
              ></span>
              <span
                *ngIf="currentUserWrapper.user?.id === user.id && userProfile.followingCount !== 1"
                (click)="userProfile.followingCount ? openFollowingOffcanvas() : null"
                [translate]="'{{ 0 }} following'" [translateParams]="{'0': userProfile.followingCount}"
                [attr.data-toggle]="userProfile.followingCount ? 'offcanvas' : ''"
              ></span>

              <span
                *ngIf="currentUserWrapper.user?.id !== user.id && userProfile.followingCount === 1"
                translate="1 following"
              ></span>
              <span
                *ngIf="currentUserWrapper.user?.id !== user.id && userProfile.followingCount !== 1"
                [translate]="'{{ 0 }} following'" [translateParams]="{'0': userProfile.followingCount}"
              ></span>

              <span
                *ngIf="currentUserWrapper.user?.id === user.id"
                (click)="openMutualFollowersOffcanvas()"
                translate="(view mutual)"
                class="d-none d-sm-inline"
                data-toggle="offcanvas"
              ></span>

              <a
                (click)="openStatsOffcanvas()"
                astrobinEventPreventDefault
                class="btn btn-xs btn-link btn-no-block p-0 p-md-2 more"
                data-toggle="offcanvas"
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
        <ng-container *ngIf="stats === null" [ngTemplateOutlet]="loadingTemplate">
        </ng-container>

        <ng-container *ngIf="stats !== null && Object.keys(stats).length === 0">
          <p translate="No additional information available at the moment. Please check again later!"></p>
        </ng-container>

        <table *ngIf="stats !== null && Object.keys(stats).length > 0" class="table table-striped">
          <tbody>
          <tr *ngFor="let stat of stats.stats">
            <td>{{ stat[0] }}</td>
            <td *ngIf="!stat[2]">{{ stat[1] }}</td>
            <td *ngIf="stat[2] && stat[2] === 'datetime'">
              <ng-container *ngIf="!!stat[1]">
                {{ stat[1] | localDate | timeago }}
              </ng-container>
              <ng-container *ngIf="!stat[1]">
                {{ "n/a" | translate }}
              </ng-container>
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
          <p *ngIf="!searching && followers.followers?.length === 0" translate="No followers."></p>
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
          <p *ngIf="!searching && following.following?.length === 0" translate="Not following anyone."></p>
        </div>
      </div>
    </ng-template>

    <ng-template #mutualFollowersOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="Mutual followers"></h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <p class="mb-3 text-muted">
          {{ "These are the users that follow you and are followed by you." | translate }}
        </p>
        <div *ngIf="mutualFollowers; else loadingTemplate" class="d-flex flex-column gap-1">
          <input
            type="search"
            class="form-control mb-2"
            placeholder="{{ 'Search' | translate }}"
            [ngModelOptions]="{standalone: true}"
            [(ngModel)]="mutualFollowersSearch"
            (ngModelChange)="mutualFollowersSearchSubject.next($event)"
          />

          <ng-container *ngIf="!searching; else loadingTemplate">
            <a *ngFor="let follower of mutualFollowers['mutual-followers']" [routerLink]="['/u', follower[1]]">
              {{ follower[2] || follower[1] }}
            </a>
          </ng-container>

          <p *ngIf="!searching && mutualFollowers['mutual-followers']?.length === 0" translate="No mutual followers."></p>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator class="h-auto"></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryHeaderComponent extends BaseComponentDirective implements OnInit, AfterViewInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @ViewChild("statsOffcanvas") statsOffcanvas: TemplateRef<any>;
  @ViewChild("changeHeaderImageOffcanvas") changeHeaderImageOffcanvas: TemplateRef<any>;
  @ViewChild("followersOffcanvas") followersOffcanvas: TemplateRef<any>;
  @ViewChild("followingOffcanvas") followingOffcanvas: TemplateRef<any>;
  @ViewChild("mutualFollowersOffcanvas") mutualFollowersOffcanvas: TemplateRef<any>;

  protected userContentType: ContentTypeInterface;
  protected stats: UserProfileStatsInterface;
  protected followers: FollowersInterface;
  protected following: FollowingInterface;
  protected mutualFollowers: MutualFollowersInterface;
  protected followersSearch: string;
  protected followingSearch: string;
  protected mutualFollowersSearch: string;
  protected followersSearchSubject = new Subject<string>();
  protected followingSearchSubject = new Subject<string>();
  protected mutualFollowersSearchSubject = new Subject<string>();
  protected searching = true;

  private readonly _isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageApiService: ImageApiService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly commonApiService: CommonApiService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
    this._setUserContentType();
  }

  ngOnInit() {
    super.ngOnInit();

    this.followersSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => {
      this._searchFollowers(searchTerm);
      this.changeDetectorRef.markForCheck();
    });

    this.followingSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => {
      this._searchFollowing(searchTerm);
      this.changeDetectorRef.markForCheck();
    });

    this.mutualFollowersSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => {
      this._searchMutualFollowers(searchTerm);
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has("followers")) {
      this.openFollowersOffcanvas();
    } else if (this.activatedRoute.snapshot.queryParamMap.has("following")) {
      this.openFollowingOffcanvas();
    } else if (this.activatedRoute.snapshot.queryParamMap.has("mutual-followers")) {
      this.openMutualFollowersOffcanvas();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stats = null;
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
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  protected openChangeHeaderImageOffcanvas() {
    this.offcanvasService.open(
      this.changeHeaderImageOffcanvas, {
        panelClass: "change-header-image-offcanvas",
        position: this.deviceService.offcanvasPosition()
      }
    );
  }

  protected openFollowersOffcanvas() {
    if (!this._isBrowser) {
      return;
    }

    this.followersSearch = "";
    this._searchFollowers();
    this.offcanvasService.open(
      this.followersOffcanvas, {
        position: this.deviceService.offcanvasPosition()
      }
    );
  }

  protected openFollowingOffcanvas() {
    if (!this._isBrowser) {
      return;
    }

    this.currentUser$.pipe(
      take(1),
      filter(currentUser => currentUser?.id === this.user.id)
    ).subscribe(() => {
      this.followingSearch = "";
      this._searchFollowing();
      this.offcanvasService.open(
        this.followingOffcanvas, {
          position: this.deviceService.offcanvasPosition()
        }
      );
      this.changeDetectorRef.markForCheck();
    });
  }

  protected openMutualFollowersOffcanvas() {
    if (!this._isBrowser) {
      return;
    }

    this.currentUser$.pipe(
      take(1),
      filter(currentUser => currentUser?.id === this.user.id)
    ).subscribe(() => {
      this.mutualFollowersSearch = "";
      this._searchMutualFollowers();
      this.offcanvasService.open(
        this.mutualFollowersOffcanvas, {
          position: this.deviceService.offcanvasPosition()
        }
      );
      this.changeDetectorRef.markForCheck();
    });
  }

  protected searchBookmarks() {
    const params = this.searchService.modelToParams(
      {
        "personal_filters": {
          "value": [ "my_bookmarks" ],
        }
      }
    );
    this.router.navigateByUrl(`/search?p=${params}`);
  }

  protected searchLikedImages() {
    const params = this.searchService.modelToParams(
      {
        "personal_filters": {
          "value": [ "my_likes" ],
        }
      }
    );
    this.router.navigateByUrl(`/search?p=${params}`);
  }

  protected shadowBan(userProfileId: UserProfileInterface["id"]) {
    this.store$.dispatch(new ShadowBanUserProfile({ id: userProfileId }));
  }

  protected removeShadowBan(userProfileId: UserProfileInterface["id"]) {
    this.store$.dispatch(new RemoveShadowBanUserProfile({ id: userProfileId }));
  }

  protected handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    // Clear the galleryHeaderImage so that the no-image div shows
    this.userProfile.galleryHeaderImage = null;
    this.changeDetectorRef.markForCheck();
  }

  private _searchFollowers(searchTerm?: string) {
    this.searching = true;
    this.commonApiService.getUserProfileFollowers(this.userProfile.id, searchTerm).subscribe(followers => {
      this.followers = followers;
      this.searching = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _searchFollowing(searchTerm?: string) {
    this.searching = true;
    this.commonApiService.getUserProfileFollowing(this.userProfile.id, searchTerm).subscribe(following => {
      this.following = following;
      this.searching = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _searchMutualFollowers(searchTerm?: string) {
    this.searching = true;
    this.commonApiService.getUserProfileMutualFollowers(this.userProfile.id, searchTerm).subscribe(mutualFollowers => {
      this.mutualFollowers = mutualFollowers;
      this.searching = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _setUserContentType() {
    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
      this.changeDetectorRef.markForCheck();
    });
    this.store$.dispatch(new LoadContentType({ appLabel: "auth", model: "user" }));
  }

  protected readonly Object = Object;
}
