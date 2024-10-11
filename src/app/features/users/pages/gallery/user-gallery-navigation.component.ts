import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, Renderer2 } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { fromEvent, throttleTime } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { filter, map, startWith, take, takeUntil } from "rxjs/operators";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { selectCollections } from "@app/store/selectors/app/collection.selectors";

type GalleryNavigationComponent = "gallery" | "staging" | "about";

@Component({
  selector: "astrobin-user-gallery-navigation",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="nav-tabs-fade"></div>
      <ul
        ngbNav
        #nav="ngbNav"
        (click)="onTabClick(activeTab)"
        [(activeId)]="activeTab"
        class="nav-tabs"
      >
        <li ngbNavItem="gallery">
          <a ngbNavLink>
            <fa-icon icon="images" class="me-2"></fa-icon>
            <span translate="Gallery"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-buttons [(activeLayout)]="activeLayout"></astrobin-user-gallery-buttons>

            <astrobin-user-gallery-collections
              class="d-block mb-5"
              [user]="user"
              [userProfile]="userProfile"
              [parent]="collectionId"
            ></astrobin-user-gallery-collections>

            <astrobin-user-gallery-images
              [activeLayout]="activeLayout"
              [expectedImageCount]="activeCollection ? activeCollection.imageCount : userProfile.imageCount"
              [user]="user"
              [userProfile]="userProfile"
              [options]="{
                includeStagingArea:
                  currentUserWrapper.user?.id === user.id &&
                  userProfile.displayWipImagesOnPublicGallery,
                collection: collectionId
              }"
            ></astrobin-user-gallery-images>
          </ng-template>
        </li>

        <li
          *ngIf="currentUserWrapper.user?.id === user.id && !userProfile.displayWipImagesOnPublicGallery"
          ngbNavItem="staging"
        >
          <a ngbNavLink>
            <fa-icon icon="lock" class="me-2"></fa-icon>
            <span translate="Staging area"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-buttons [(activeLayout)]="activeLayout"></astrobin-user-gallery-buttons>
            <astrobin-user-gallery-images
              [activeLayout]="activeLayout"
              [user]="user"
              [userProfile]="userProfile"
              [options]="{ onlyStagingArea: currentUserWrapper.user?.id === user.id }"
            ></astrobin-user-gallery-images>
          </ng-template>
        </li>

        <li ngbNavItem="marketplace">
          <a ngbNavLink>
            <fa-icon icon="shopping-cart" class="me-2"></fa-icon>
            <span translate="Marketplace"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-marketplace
              [user]="user"
            ></astrobin-user-gallery-marketplace>
          </ng-template>
        </li>

        <li ngbNavItem="about">
          <a ngbNavLink>
            <fa-icon icon="user" class="me-2"></fa-icon>
            <span translate="About"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-about
              [user]="user"
              [userProfile]="userProfile"
            ></astrobin-user-gallery-about>
          </ng-template>
        </li>

        <ng-container *ngIf="currentUserWrapper.user?.id === user.id">
          <!-- spacer -->
          <li class="flex-grow-1"></li>

          <li ngbNavItem="trash">
            <a ngbNavLink>
              <fa-icon icon="trash" class="me-2"></fa-icon>
              <span translate="Trash"></span>
            </a>
            <ng-template ngbNavContent>
              <astrobin-user-gallery-trash
                [user]="user"
                [userProfile]="userProfile"
              ></astrobin-user-gallery-trash>
            </ng-template>
          </li>
        </ng-container>
      </ul>

      <div [ngbNavOutlet]="nav"></div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-navigation.component.scss"]
})
export class UserGalleryNavigationComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  protected readonly ImageAlias = ImageAlias;
  protected activeTab: GalleryNavigationComponent = "gallery";
  protected activeLayout = UserGalleryActiveLayout.TINY;
  protected collectionId: CollectionInterface["id"] | null = null;
  protected activeCollection: CollectionInterface | null = null;
  private readonly _isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly elementRef: ElementRef,
    public readonly renderer: Renderer2
  ) {
    super(store$);

    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.destroyed$)).subscribe((fragment: string | null) => {
      if (fragment) {
        this.activeTab = fragment as GalleryNavigationComponent;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this._setCollectionFromRoute();
    });

    this._setCollectionFromRoute();
  }

  ngAfterViewInit() {
    if (this._isBrowser) {
      const navTabsElement = this.elementRef.nativeElement.querySelector(".nav-tabs");
      const navTabsFadeElement = this.elementRef.nativeElement.querySelector(".nav-tabs-fade");

      const updateFadeVisibility = () => {
        const scrollLeft = navTabsElement.scrollLeft;
        const maxScrollLeft = navTabsElement.scrollWidth - navTabsElement.clientWidth;

        // Check if scrolling is needed (content is overflowing)
        if (navTabsElement.scrollWidth > navTabsElement.clientWidth) {
          this.renderer.setStyle(navTabsFadeElement, "opacity", scrollLeft >= maxScrollLeft ? "0" : "1");
        } else {
          this.renderer.setStyle(navTabsFadeElement, "opacity", "0");
        }
      };

      fromEvent(this.windowRefService.nativeWindow, "resize")
        .pipe(
          startWith(null),
          throttleTime(300),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          updateFadeVisibility();
        });

      fromEvent(navTabsElement, "scroll")
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => updateFadeVisibility());
    }
  }

  onTabClick(tab: GalleryNavigationComponent) {
    this.router.navigate([], { fragment: tab });
  }

  private _setCollectionFromRoute() {
    this.collectionId = this.route.snapshot.queryParams.collection
      ? parseInt(this.route.snapshot.queryParams.collection, 10)
      : null;

    if (this.collectionId) {
      this.store$.select(selectCollections).pipe(
        filter(collections => collections?.length > 0),
        map(collections => collections.find(collection => collection.id === this.collectionId)),
        filter(collection => !!collection),
        take(1)
      ).subscribe(collection => {
        this.activeCollection = collection;
      });
    } else {
      this.activeCollection = null;
    }
  }
}
