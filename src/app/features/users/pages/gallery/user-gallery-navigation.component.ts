import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, Renderer2, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { DefaultGallerySortingOption, UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@core/services/window-ref.service";
import { auditTime, fromEvent, Subject } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { debounceTime, distinctUntilChanged, filter, map, startWith, take, takeUntil } from "rxjs/operators";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { selectCollections } from "@app/store/selectors/app/collection.selectors";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { FindImagesOptionsInterface } from "@core/services/api/classic/images/image/image-api.service";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";
import { UpdateUserProfile } from "@features/account/store/auth.actions";

type GalleryNavigationComponent =
  "gallery" |
  "staging" |
  "collections" |
  "smart-folders" |
  "equipment" |
  "marketplace" |
  "about" |
  "trash";

@Component({
  selector: "astrobin-user-gallery-navigation",
  template: `
    <ng-container *ngIf="isBrowser; else loadingTemplate">
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

              <div
                *ngIf="currentUserWrapper.user?.id === user.id"
                [autoClose]="'outside'"
                ngbDropdown
                class="d-inline-block ms-3"
                container="body"
              >
                <a
                  class="btn btn-sm btn-link no-toggle text-secondary"
                  ngbDropdownToggle
                >
                  <fa-icon icon="cog"></fa-icon>
                </a>
                <div ngbDropdownMenu>
                  <div class="dropdown-item">
                    <astrobin-toggle-button
                      [label]="'Collections in separate tab' | translate"
                      [value]="!userProfile.displayCollectionsOnPublicGallery"
                      (toggle)="onDisplayCollectionsOnSeparateTabToggle($event)"
                      class="gallery-settings"
                    ></astrobin-toggle-button>
                  </div>

                  <div class="dropdown-item">
                    <astrobin-toggle-button
                      [label]="'Staging area in separate tab' | translate"
                      [value]="!userProfile.displayWipImagesOnPublicGallery"
                      (toggle)="onDisplayWipImagesOnSeparateTabToggle($event)"
                      class="gallery-settings"
                    ></astrobin-toggle-button>
                  </div>
                </div>
              </div>
            </a>
            <ng-template ngbNavContent>
              <astrobin-user-gallery-collections
                *ngIf="userProfile.displayCollectionsOnPublicGallery"
                [user]="user"
                [userProfile]="userProfile"
                [parent]="collectionId"
              ></astrobin-user-gallery-collections>

              <astrobin-user-gallery-buttons
                [(activeLayout)]="activeLayout"
                [subsection]="publicGalleryOptions.subsection"
                [ordering]="publicGalleryOptions.ordering"
                (sortChange)="onSortChange($event)"
              ></astrobin-user-gallery-buttons>

              <ng-container *ngTemplateOutlet="quickSearchTemplate"></ng-container>

              <astrobin-user-gallery-images
                [activeLayout]="activeLayout"
                [expectedImageCount]="activeCollection ? activeCollection.imageCount : userProfile.imageCount"
                [user]="user"
                [userProfile]="userProfile"
                [options]="publicGalleryOptions"
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
              <astrobin-user-gallery-buttons
                [(activeLayout)]="activeLayout"
                [subsection]="stagingAreaOptions.subsection"
                [ordering]="stagingAreaOptions.ordering"
              ></astrobin-user-gallery-buttons>
              <ng-container *ngTemplateOutlet="quickSearchTemplate"></ng-container>
              <astrobin-user-gallery-images
                [activeLayout]="activeLayout"
                [user]="user"
                [userProfile]="userProfile"
                [options]="stagingAreaOptions"
              ></astrobin-user-gallery-images>
            </ng-template>
          </li>

          <li *ngIf="!userProfile.displayCollectionsOnPublicGallery" ngbNavItem="collections">
            <a ngbNavLink>
              <fa-icon icon="layer-group" class="me-2"></fa-icon>
              <span translate="Collections"></span>
            </a>
            <ng-template ngbNavContent>
              <astrobin-user-gallery-collections
                [user]="user"
                [userProfile]="userProfile"
                [parent]="collectionId"
              ></astrobin-user-gallery-collections>

              <ng-container *ngIf="activeCollection">
                <astrobin-user-gallery-buttons
                  [(activeLayout)]="activeLayout"
                  (sortChange)="onSortChange($event)"
                  [subsection]="publicGalleryOptions.subsection"
                  [ordering]="publicGalleryOptions.ordering"
                ></astrobin-user-gallery-buttons>

                <ng-container *ngTemplateOutlet="quickSearchTemplate"></ng-container>

                <astrobin-user-gallery-images
                  [activeLayout]="activeLayout"
                  [expectedImageCount]="activeCollection ? activeCollection.imageCount : userProfile.imageCount"
                  [user]="user"
                  [userProfile]="userProfile"
                  [options]="publicGalleryOptions"
                ></astrobin-user-gallery-images>
              </ng-container>
            </ng-template>
          </li>

          <li ngbNavItem="smart-folders">
            <a ngbNavLink>
              <fa-icon icon="folder-open" class="me-2"></fa-icon>
              <span translate="Smart folders"></span>
            </a>
            <ng-template ngbNavContent>
              <astrobin-user-gallery-smart-folders
                [user]="user"
                [userProfile]="userProfile"
              ></astrobin-user-gallery-smart-folders>
            </ng-template>
          </li>

          <li ngbNavItem="equipment">
            <a ngbNavLink>
              <fa-icon icon="camera" class="me-2"></fa-icon>
              <span translate="Equipment"></span>
            </a>
            <ng-template ngbNavContent>
              <astrobin-user-gallery-equipment
                [user]="user"
                [userProfile]="userProfile"
              ></astrobin-user-gallery-equipment>
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
    </ng-container>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator class="mt-4"></astrobin-loading-indicator>
    </ng-template>

    <ng-template #createCollectionOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Create collection" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-user-gallery-collection-create
          [user]="user"
          [userProfile]="userProfile"
          [parent]="null"
          (cancelClick)="offcanvas.close()"
        ></astrobin-user-gallery-collection-create>
      </div>
    </ng-template>

    <ng-template #quickSearchTemplate>
      <input
        class="form-control mb-3 user-gallery-quick-search"
        type="search"
        placeholder="{{ 'Search' | translate }}"
        [(ngModel)]="searchModel"
        (ngModelChange)="onSearchModelChange()"
      />
    </ng-template>
  `,
  styleUrls: ["./user-gallery-navigation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryNavigationComponent extends BaseComponentDirective implements OnInit, AfterViewInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @ViewChild("createCollectionOffcanvas") createCollectionOffcanvas: TemplateRef<any>;

  protected readonly ImageAlias = ImageAlias;
  protected readonly isBrowser: boolean;

  protected activeTab: GalleryNavigationComponent = "gallery";
  protected activeLayout: ImageGalleryLayout;
  protected collectionId: CollectionInterface["id"] | null = null;
  protected activeCollection: CollectionInterface | null = null;
  protected searchModel: string | null = null;
  protected publicGalleryOptions: FindImagesOptionsInterface;
  protected stagingAreaOptions: FindImagesOptionsInterface;
  private _searchSubject: Subject<string> = new Subject<string>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly elementRef: ElementRef,
    public readonly renderer: Renderer2,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.destroyed$)).subscribe((fragment: string | null) => {
      this._setActiveTabFromRoute();
      this.changeDetectorRef.markForCheck();
    });

    this._searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => {
      this.publicGalleryOptions = {
        ...this.publicGalleryOptions,
        q: searchTerm,
        page: 1
      };

      this.stagingAreaOptions = {
        ...this.stagingAreaOptions,
        q: searchTerm,
        page: 1
      };

      this.changeDetectorRef.markForCheck();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this._setCollectionFromRoute();
      this._setFindImageOptions();
      this.changeDetectorRef.markForCheck();
    });

    this._setActiveTabFromRoute();
    this._setCollectionFromRoute();
    this._setFindImageOptions();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
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
          auditTime(300),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          updateFadeVisibility();
          this.changeDetectorRef.markForCheck();
        });

      fromEvent(navTabsElement, "scroll")
        .pipe(
          auditTime(100),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          updateFadeVisibility();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  ngOnChanges() {
    this._setFindImageOptions();
    this._updateSearchModel();

    const navTabsElement = this.elementRef.nativeElement.querySelector(".nav-tabs");
    if (navTabsElement) {
      navTabsElement.scrollLeft = 0;
    }
  }

  onTabClick(tab: GalleryNavigationComponent) {
    this.router.navigate([], { fragment: tab });
  }

  protected createCollection() {
    this.offcanvasService.open(this.createCollectionOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected onSearchModelChange() {
    this._searchSubject.next(this.searchModel);
  }

  protected onSortChange(sort: string) {
    let prop: string;
    let otherProp: string;

    if (["title", "uploaded", "acquired"].includes(sort)) {
      prop = "subsection";
      otherProp = "ordering";
    } else if (["views", "likes", "bookmarks", "comments"].includes(sort)) {
      prop = "ordering";
      otherProp = "subsection";
    }

    this.publicGalleryOptions = {
      ...this.publicGalleryOptions,
      [prop]: sort,
      [otherProp]: null
    };

    this.stagingAreaOptions = {
      ...this.stagingAreaOptions,
      [prop]: sort,
      [otherProp]: null
    };
  }

  protected onDisplayCollectionsOnSeparateTabToggle(value: boolean) {
    this.store$.dispatch(new UpdateUserProfile({
      id: this.userProfile.id,
      displayCollectionsOnPublicGallery: !value
    }));
  }

  protected onDisplayWipImagesOnSeparateTabToggle(value: boolean) {
    this.store$.dispatch(new UpdateUserProfile({
      id: this.userProfile.id,
      displayWipImagesOnPublicGallery: !value
    }));
  }

  private _updateSearchModel() {
    this.searchModel = null;

    if (
      this.userProfile &&
      this.userProfile.defaultGallerySorting &&
      this.userProfile.defaultGallerySorting === DefaultGallerySortingOption.TITLE
    ) {
      this.publicGalleryOptions = {
        ...this.publicGalleryOptions,
        subsection: "title"
      };
    }
  }

  private _setFindImageOptions() {
    this.searchModel = this.route.snapshot.queryParamMap.get("q");
    this.currentUserWrapper$.pipe(take(1)).subscribe(currentUserWrapper => {
      this.publicGalleryOptions = {
        includeStagingArea:
          currentUserWrapper.user?.id === this.user.id &&
          (
            currentUserWrapper.userProfile?.displayWipImagesOnPublicGallery ||
            !!this.collectionId
          ),
        collection: this.collectionId,
        q: this.searchModel,
        subsection: this.userProfile?.defaultGallerySorting === DefaultGallerySortingOption.TITLE ? "title" : null
      };

      this.stagingAreaOptions = {
        onlyStagingArea: currentUserWrapper.user?.id === this.user.id,
        q: this.searchModel
      };

      this.changeDetectorRef.markForCheck();
    });
  }

  private _setActiveTabFromRoute() {
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      this.activeTab = fragment as GalleryNavigationComponent;
    }
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
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.activeCollection = null;
    }
  }
}
