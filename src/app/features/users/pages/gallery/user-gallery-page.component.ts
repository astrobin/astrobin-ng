import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Actions, ofType } from "@ngrx/effects";
import { WindowRefService } from "@core/services/window-ref.service";
import { TitleService } from "@core/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { DefaultGallerySortingOption, UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { FindCollections, FindCollectionsSuccess } from "@app/store/actions/collection.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { selectCurrentUser, selectCurrentUserProfile, selectUser, selectUserProfile } from "@features/account/store/auth.selectors";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { ImageService } from "@core/services/image/image.service";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { DeviceService } from "@core/services/device.service";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { RemoveShadowBanUserProfile, ShadowBanUserProfile } from "@features/account/store/auth.actions";
import { UserGalleryHeaderComponent } from "./user-gallery-header.component";
import { UtilsService } from "@core/services/utils/utils.service";

@Component({
  selector: "astrobin-user-gallery-page",
  template: `
    <div
      *ngIf="currentUserWrapper$ | async as currentUserWrapper"
      class="page has-infinite-scroll mobile-flush-top"
    >
      <astrobin-ad-manager
        #ad
        [style.visibility]="showAd ? 'visible' : 'hidden'"
        [configName]="showAd ? 'wide' : null"
      ></astrobin-ad-manager>

      <astrobin-user-gallery-header
        [user]="user"
        [userProfile]="userProfile"
      ></astrobin-user-gallery-header>

      <p
        *ngIf="currentUserWrapper.userProfile?.shadowBans?.includes(userProfile.id)"
        class="alert alert-warning shadow-ban-alert"
      >
        {{ "You shadow-banned this user. They won't be able to contact you." | translate }}
      </p>

      <astrobin-user-gallery-navigation
        [user]="user"
        [userProfile]="userProfile"
      ></astrobin-user-gallery-navigation>
    </div>
    
    <!-- Templates for mobile page menu -->
    <ng-template #titleTemplate>
      <span>{{ user?.displayName }}</span>
    </ng-template>
    
    <ng-template #navTemplate>
      <ul class="mobile-user-menu nav flex-column">
        <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          <!-- Dropdown items from the user-gallery-header dropdown -->
          <ng-container *ngIf="currentUserWrapper.user?.id === user?.id">
            <li class="nav-item">
              <button 
                (click)="openHeaderImageChange()" 
                class="nav-link"
              >
                <fa-icon icon="image"></fa-icon>
                {{ "Change header image" | translate }}
              </button>
            </li>
            
            <li class="nav-item">
              <a 
                [href]="classicRoutesService.SETTINGS" 
                class="nav-link"
              >
                <fa-icon icon="cog"></fa-icon>
                {{ "Settings" | translate }}
              </a>
            </li>
          </ng-container>
          
          <ng-container *ngIf="currentUserWrapper.user?.id !== user?.id">
            <li class="nav-item" *ngIf="!currentUserWrapper.userProfile?.shadowBans?.includes(userProfile?.id)">
              <a
                (click)="shadowBan(userProfile?.id)"
                href="#"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="ban"></fa-icon>
                {{ "Shadow-ban" | translate }}
              </a>
            </li>
            
            <li class="nav-item" *ngIf="currentUserWrapper.userProfile?.shadowBans?.includes(userProfile?.id)">
              <a
                (click)="removeShadowBan(userProfile?.id)"
                href="#"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="undo"></fa-icon>
                {{ "Remove shadow-ban" | translate }}
              </a>
            </li>
            
            <li class="nav-item">
              <a
                [href]="classicRoutesService.SEND_MESSAGE(user?.username)"
                class="nav-link"
              >
                <fa-icon icon="envelope"></fa-icon>
                {{ "Send private message" | translate }}
              </a>
            </li>
          </ng-container>
        </ng-container>
      </ul>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("ad", { static: false, read: AdManagerComponent }) adManagerComponent: AdManagerComponent;
  
  // Templates for mobile page menu
  @ViewChild("titleTemplate", { static: true }) titleTemplate: TemplateRef<any>;
  @ViewChild("navTemplate", { static: true }) navTemplate: TemplateRef<any>;
  
  // Reference to user-gallery-header component to access its methods
  @ViewChild(UserGalleryHeaderComponent) userGalleryHeader: any;

  protected user: UserInterface;
  protected userProfile: UserProfileInterface;
  protected userContentType: ContentTypeInterface;
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly deviceService: DeviceService,
    public readonly mobilePageMenuService: MobilePageMenuService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
    this._setUserContentType();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.actions$.pipe(
      ofType(AppActionTypes.FIND_COLLECTIONS_SUCCESS),
      map((action: FindCollectionsSuccess) => action.payload.response),
      takeUntil(this.destroyed$)
    ).subscribe(response => {
      if (response.next) {
        const page = response.next.match(/page=(\d+)/)[1];
        if (page) {
          this.store$.dispatch(new FindCollections({ params: { user: this.user.id, page: +page } }));
        }
      }
    });

    this.route.data.pipe(takeUntil(this.destroyed$)).subscribe((data: {
      userData: {
        user: UserInterface, userProfile: UserProfileInterface
      }
    }) => {
      this.user = data.userData.user;
      this.userProfile = data.userData.userProfile;
      this.changeDetectorRef.markForCheck();

      this.userSubscriptionService.displayAds$().pipe(
        filter(showAd => typeof showAd !== "undefined"),
        take(1)
      ).subscribe(showAd => {
        /*
         * showAd = if the viewer gets ads.
         * this.userProfile.allowAds = if the user allows ads to be shown on their profile.
         */
        this.allowAds = showAd && this.userProfile.allowAds;
        this.showAd = this.allowAds && !this.activatedRoute.snapshot.data.image;
        this.changeDetectorRef.markForCheck();
      });

      this.imageViewerService.slideshowState$
        .pipe(takeUntil(this.destroyed$))
        .subscribe(isOpen => {
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
            this.router.navigate([], {
              fragment: "gallery",
              replaceUrl: true,
              queryParamsHandling: "merge"
            });
            break;
          case DefaultGallerySortingOption.COLLECTIONS: {
            if (this.userProfile.displayCollectionsOnPublicGallery) {
              this.router.navigate([], {
                fragment: "gallery",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
            } else {
              this.router.navigate([], {
                fragment: "collections",
                replaceUrl: true,
                queryParamsHandling: "merge"
              });
            }
            break;
          }
          case DefaultGallerySortingOption.SUBJECT_TYPE:
            this.router.navigate([], {
              queryParams: { "folder-type": "subject" },
              fragment: "smart-folders",
              replaceUrl: true,
              queryParamsHandling: "merge"
            });
            break;
          case DefaultGallerySortingOption.YEAR:
            this.router.navigate([], {
              queryParams: { "folder-type": "year" },
              fragment: "smart-folders",
              replaceUrl: true,
              queryParamsHandling: "merge"
            });
            break;
          case DefaultGallerySortingOption.GEAR:
            this.router.navigate([], {
              queryParams: { "folder-type": "gear" },
              fragment: "smart-folders",
              replaceUrl: true,
              queryParamsHandling: "merge"
            });
            break;
          case DefaultGallerySortingOption.CONSTELLATION:
            this.router.navigate([], {
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
    });
  }

  ngAfterViewInit() {
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute);
    
    // Register the mobile page menu
    this._registerMobilePageMenu();
  }
  
  ngOnDestroy(): void {
    super.ngOnDestroy();
    
    // Clear the mobile page menu when navigating away
    if (this.deviceService.mdMax()) {
      this.mobilePageMenuService.clearMenu();
    }
  }
  
  /**
   * User profile menu methods
   */
  protected openHeaderImageChange(): void {
    // Close the menu first
    this.mobilePageMenuService.closeMenu();
    
    // Then open the header image change offcanvas from the header component
    // Using utilsService.delay for SSR-friendliness
    this.utilsService.delay(100).subscribe(() => {
      if (this.userGalleryHeader) {
        this.userGalleryHeader.openChangeHeaderImageOffcanvas();
      }
    });
  }
  
  protected shadowBan(userProfileId: UserProfileInterface["id"]): void {
    this.store$.dispatch(new ShadowBanUserProfile({ id: userProfileId }));
    this.mobilePageMenuService.closeMenu();
  }
  
  protected removeShadowBan(userProfileId: UserProfileInterface["id"]): void {
    this.store$.dispatch(new RemoveShadowBanUserProfile({ id: userProfileId }));
    this.mobilePageMenuService.closeMenu();
  }
  
  /**
   * Register the mobile page menu with the service
   */
  private _registerMobilePageMenu(): void {
    // Only register on mobile devices
    if (!this.deviceService.mdMax()) {
      return;
    }
    
    // Only register if both templates are available
    if (!this.titleTemplate || !this.navTemplate) {
      return;
    }
    
    // Register the menu configuration with the service
    this.mobilePageMenuService.registerMenu({
      titleTemplate: this.titleTemplate,
      template: this.navTemplate,
      offcanvasClass: "user-gallery-menu-offcanvas",
    });
  }
  
  /**
   * Get the user content type for the toggle-property component
   */
  private _setUserContentType(): void {
    this.store$.select(selectContentType, { appLabel: "auth", model: "user" })
      .pipe(
        filter(contentType => !!contentType),
        take(1)
      )
      .subscribe(contentType => {
        this.userContentType = contentType;
        this.changeDetectorRef.markForCheck();
      });
    
    this.store$.dispatch(new LoadContentType({ appLabel: "auth", model: "user" }));
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
