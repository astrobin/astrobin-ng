import { AfterViewInit, ChangeDetectorRef, OnInit, ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { FindCollectionsSuccess, FindCollections } from "@app/store/actions/collection.actions";
import { MainState } from "@app/store/state";
import { UserProfileInterface, DefaultGallerySortingOption } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { TitleService } from "@core/services/title/title.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { WindowRefService } from "@core/services/window-ref.service";
import {
  selectCurrentUser,
  selectCurrentUserProfile,
  selectUser,
  selectUserProfile
} from "@features/account/store/auth.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { filter, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-page",
  template: `
    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="page has-infinite-scroll">
      <astrobin-ad-manager
        #ad
        [style.visibility]="showAd ? 'visible' : 'hidden'"
        [configName]="showAd ? 'wide' : null"
      ></astrobin-ad-manager>

      <astrobin-user-gallery-header [user]="user" [userProfile]="userProfile"></astrobin-user-gallery-header>

      <p
        *ngIf="currentUserWrapper.userProfile?.shadowBans?.includes(userProfile.id)"
        class="alert alert-warning shadow-ban-alert"
      >
        {{ "You shadow-banned this user. They won't be able to contact you." | translate }}
      </p>

      <astrobin-user-gallery-navigation [user]="user" [userProfile]="userProfile"></astrobin-user-gallery-navigation>
    </div>
  `,
  styleUrls: ["./user-gallery-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @ViewChild("ad", { static: false, read: AdManagerComponent }) adManagerComponent: AdManagerComponent;

  protected user: UserInterface;
  protected userProfile: UserProfileInterface;
  protected showAd: boolean;
  protected allowAds: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly imageService: ImageService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.actions$
      .pipe(
        ofType(AppActionTypes.FIND_COLLECTIONS_SUCCESS),
        map((action: FindCollectionsSuccess) => action.payload.response),
        takeUntil(this.destroyed$)
      )
      .subscribe(response => {
        if (response.next) {
          const page = response.next.match(/page=(\d+)/)[1];
          if (page) {
            this.store$.dispatch(new FindCollections({ params: { user: this.user.id, page: +page } }));
          }
        }
      });

    this.route.data.pipe(takeUntil(this.destroyed$)).subscribe(
      (data: {
        userData: {
          user: UserInterface;
          userProfile: UserProfileInterface;
        };
      }) => {
        this.user = data.userData.user;
        this.userProfile = data.userData.userProfile;
        this.changeDetectorRef.markForCheck();

        this.userSubscriptionService
          .displayAds$()
          .pipe(
            filter(showAd => typeof showAd !== "undefined"),
            take(1)
          )
          .subscribe(showAd => {
            /*
             * showAd = if the viewer gets ads.
             * this.userProfile.allowAds = if the user allows ads to be shown on their profile.
             */
            this.allowAds = showAd && this.userProfile.allowAds;
            this.showAd = this.allowAds && !this.activatedRoute.snapshot.data.image;
            this.changeDetectorRef.markForCheck();
          });

        this.imageViewerService.slideshowState$.pipe(takeUntil(this.destroyed$)).subscribe(isOpen => {
          this.showAd = this.allowAds && !isOpen;

          if (!this.showAd && this.adManagerComponent) {
          } else if (this.showAd && this.adManagerComponent) {
            this.adManagerComponent.refreshAd();
          }

          this.changeDetectorRef.markForCheck();
        });

        if (!this.activatedRoute.snapshot.fragment) {
          switch (this.userProfile.defaultGallerySorting) {
            case DefaultGallerySortingOption.PUBLICATION:
              void this.router.navigate([], {
                fragment: "gallery",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
              break;
            case DefaultGallerySortingOption.COLLECTIONS: {
              if (this.userProfile.displayCollectionsOnPublicGallery) {
                void this.router.navigate([], {
                  fragment: "gallery",
                  replaceUrl: true,
                  queryParamsHandling: "merge"
                });
              } else {
                void this.router.navigate([], {
                  fragment: "collections",
                  replaceUrl: true,
                  queryParamsHandling: "merge"
                });
              }
              break;
            }
            case DefaultGallerySortingOption.SUBJECT_TYPE:
              void this.router.navigate([], {
                queryParams: { "folder-type": "subject" },
                fragment: "smart-folders",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
              break;
            case DefaultGallerySortingOption.YEAR:
              void this.router.navigate([], {
                queryParams: { "folder-type": "year" },
                fragment: "smart-folders",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
              break;
            case DefaultGallerySortingOption.GEAR:
              void this.router.navigate([], {
                queryParams: { "folder-type": "gear" },
                fragment: "smart-folders",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
              break;
            case DefaultGallerySortingOption.CONSTELLATION:
              void this.router.navigate([], {
                queryParams: { "folder-type": "constellation" },
                fragment: "smart-folders",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
              break;
          }
        }

        this._setMetaTags();
        this._listenToUserChanges();
        this.store$.dispatch(new FindCollections({ params: { user: this.user.id } }));
      }
    );
  }

  ngAfterViewInit() {
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute);
  }

  private _listenToUserChanges() {
    this.store$
      .select(selectCurrentUserProfile)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(userProfile => {
        if (userProfile?.id === this.userProfile.id) {
          this.userProfile = { ...userProfile };
          this.changeDetectorRef.markForCheck();
        }
      });

    this.store$
      .select(selectCurrentUser)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(user => {
        if (user?.id === this.user.id) {
          this.user = { ...user };
          this.changeDetectorRef.markForCheck();
        }
      });

    this.store$
      .select(selectUserProfile, this.userProfile.id)
      .pipe(
        filter(userProfile => !!userProfile),
        takeUntil(this.destroyed$)
      )
      .subscribe(userProfile => {
        if (userProfile) {
          this.userProfile = { ...userProfile };
          this.changeDetectorRef.markForCheck();
        }
      });

    this.store$
      .select(selectUser, this.user.id)
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroyed$)
      )
      .subscribe(user => {
        if (user) {
          this.user = { ...user };
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private _setMetaTags() {
    if (this.route.snapshot.data.image) {
      this.imageService.setMetaTags(this.route.snapshot.data.image);
    } else {
      const title = this.user.displayName;
      const description = this.translateService.instant("A gallery on AstroBin.");

      this.titleService.setTitle(title);
      this.titleService.setDescription(description);
      this.titleService.addMetaTag({ name: "og:title", content: title });
      this.titleService.addMetaTag({ name: "og:description", content: description });

      if (this.user.avatar) {
        this.titleService.addMetaTag({ name: "og:gallery", content: this.user.avatar });
      }
    }
  }
}
