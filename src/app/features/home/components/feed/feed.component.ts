import { ChangeDetectorRef, Component, ComponentRef, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { FeedApiService } from "@features/home/services/feed-api.service";
import { FeedService } from "@features/home/services/feed.service";
import { filter, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { FrontPageSection, UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem, ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser } from "@angular/common";
import { auditTime, finalize, fromEvent, Observable, Subscription } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ActivatedRoute, Router } from "@angular/router";
import { fadeInOut } from "@shared/animations";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { ImageGalleryLayout } from "@shared/enums/image-gallery-layout.enum";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";

enum FeedTab {
  FEED = "FEED",
  RECENT = "RECENT"
}

enum FeedType {
  GLOBAL = "GLOBAL",
  PERSONAL = "PERSONAL",
}

@Component({
  selector: "astrobin-feed",
  template: `
    <div class="feed-container d-flex justify-content-between align-items-center mb-3">
      <ul
        ngbNav
        (activeIdChange)="onTabChange($event)"
        [(activeId)]="activeTab"
        #nav="ngbNav"
        class="nav-tabs"
      >
        <li [ngbNavItem]="FeedTab.FEED" class="me-2">
          <a ngbNavLink translate="Activity feed"></a>
          <ng-template ngbNavContent>
            <div
              *ngIf="loading && isBrowser"
              class="d-flex d-md-none flex-column mobile-feed-loading gap-3"
            >
              <astrobin-image-loading-indicator
                *ngFor="let x of Array(50)"
              ></astrobin-image-loading-indicator>
            </div>

            <astrobin-image-gallery-loading
              *ngIf="loading && isBrowser"
              [numberOfImages]="50"
              [activeLayout]="UserGalleryActiveLayout.LARGE"
              class="activity-feed-gallery-loading d-none d-md-block"
            ></astrobin-image-gallery-loading>

            <div [style.min-height.px]="lastKnownHeight">
              <astrobin-masonry-layout
                class="activity-feed-masonry-layout"
                [layout]="'xl'"
                [items]="feedItems"
                [widthProperty]="'imageW'"
                [heightProperty]="'imageH'"
              >
                <ng-template let-item>
                  <astrobin-feed-item
                    (openImage)="openImageById(item.id, $event)"
                    [feedItem]="item"
                  ></astrobin-feed-item>

                  <astrobin-loading-indicator
                    *ngIf="loadingItemId === item.id.toString()"
                    @fadeInOut
                    class="position-absolute top-0 h-100"
                  ></astrobin-loading-indicator>
                </ng-template>
              </astrobin-masonry-layout>
            </div>

            <div
              *ngIf="!loadingMore && !loading && !!next"
              class="w-100 d-flex justify-content-center mt-4"
            >
              <button
                (click)="onScroll()"
                class="btn btn-outline-primary btn-no-block"
              >
                {{ "Load more" | translate }}
              </button>
            </div>

            <div
              *ngIf="!loading && loadingMore"
              class="d-flex d-md-none flex-column mobile-feed-loading gap-3"
            >
              <astrobin-image-loading-indicator
                *ngFor="let x of Array(50)"
              ></astrobin-image-loading-indicator>
            </div>

            <astrobin-image-gallery-loading
              *ngIf="!loading && loadingMore"
              class="d-none d-md-block mt-4 mb-2 mb-md-0 activity-feed-gallery-loading"
              [numberOfImages]="50"
              [activeLayout]="UserGalleryActiveLayout.LARGE"
            ></astrobin-image-gallery-loading>

            <astrobin-scroll-to-top></astrobin-scroll-to-top>
          </ng-template>
        </li>

        <li [ngbNavItem]="FeedTab.RECENT">
          <a ngbNavLink translate="Recent images"></a>
          <ng-template ngbNavContent>
            <astrobin-image-gallery-loading
              *ngIf="loading && isBrowser"
              [numberOfImages]="50"
              [activeLayout]="UserGalleryActiveLayout.MEDIUM"
            ></astrobin-image-gallery-loading>

            <div [style.min-height.px]="lastKnownHeight">
              <astrobin-masonry-layout
                [layout]="'medium'"
                [items]="images"
                [idProperty]="'pk'"
              >
                <ng-template let-item>
                  <div class="image-container">
                    <a
                      (click)="openImage(item)"
                      [href]="'/i/' + (item.hash || item.pk)"
                      astrobinEventPreventDefault
                      class="image-link"
                    >
                      <!-- ImageSerializerGallery always only has the regular thumbnail and no more -->
                      <img
                        *ngIf="item?.thumbnails?.length"
                        [alt]="item.title"
                        [src]="item.thumbnails[0].url"
                      />

                      <astrobin-loading-indicator
                        *ngIf="loadingItemId === item.hash || loadingItemId === item.pk.toString()"
                        @fadeInOut
                        class="position-absolute top-0 h-100"
                      ></astrobin-loading-indicator>
                    </a>
                  </div>

                  <astrobin-image-icons [image]="item"></astrobin-image-icons>

                  <astrobin-image-hover
                    *ngIf="!loadingItemId"
                    @fadeInOut
                    [image]="item"
                    [activeLayout]="UserGalleryActiveLayout.MEDIUM"
                  ></astrobin-image-hover>
                </ng-template>
              </astrobin-masonry-layout>
            </div>

            <div
              *ngIf="!loadingMore && !loading && !!next"
              class="w-100 d-flex justify-content-center mt-4"
            >
              <button
                (click)="onScroll()"
                class="btn btn-outline-primary btn-no-block"
              >
                {{ "Load more" | translate }}
              </button>
            </div>

            <astrobin-image-gallery-loading
              *ngIf="!loading && loadingMore"
              class="d-block mt-5"
              [numberOfImages]="50"
              [activeLayout]="UserGalleryActiveLayout.MEDIUM"
            ></astrobin-image-gallery-loading>

            <astrobin-scroll-to-top></astrobin-scroll-to-top>
          </ng-template>
        </li>
      </ul>

      <div class="global-personal-switcher">
        <fa-icon
          (click)="onFeedTypeChange(FeedType.GLOBAL)"
          [class.active]="activeFeedType === FeedType.GLOBAL"
          [icon]="['fas', 'globe']"
          [ngbTooltip]="'Global feed' | translate"
        ></fa-icon>

        <fa-icon
          (click)="onFeedTypeChange(FeedType.PERSONAL)"
          [icon]="['fas', 'user']"
          [class.active]="activeFeedType === FeedType.PERSONAL"
          [ngbTooltip]="'Personal feed' | translate"
        ></fa-icon>
      </div>
    </div>

    <div #tabsContentWrapper class="tabs-content-wrapper">
      <div [ngbNavOutlet]="nav"></div>
    </div>
  `,
  styleUrls: ["./feed.component.scss"],
  animations: [fadeInOut]
})
export class FeedComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @ViewChild("tabsContentWrapper", { static: false }) tabsContentWrapper: ElementRef;
  @ViewChild("feed") protected feedElement: ElementRef;

  protected lastKnownHeight = null;

  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;
  protected readonly FeedTab = FeedTab;
  protected readonly FeedType = FeedType;

  protected activeTab = FeedTab.FEED;
  protected activeFeedType = FeedType.GLOBAL;
  protected currentUserProfile: UserProfileInterface;

  // For the activity feed.
  protected feedItems: FeedItemInterface[] = null;

  // For the recent images.
  protected images: ImageInterface[] = null;

  protected loading = true;
  protected loadingMore = false;
  protected next: string | null = null;
  protected loadingItemId: string = null;

  protected readonly isBrowser: boolean;

  private _page = 1;
  private _currentDataSubscription: Subscription;
  private _imageContentType: ContentTypeInterface;
  private _nearEndOfContextSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly feedApiService: FeedApiService,
    public readonly feedService: FeedService,
    public readonly imageViewerService: ImageViewerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly renderer: Renderer2,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly imageService: ImageService,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    super.ngOnInit();

    this._initContentTypes();

    this.currentUserProfile$.pipe(take(1)).subscribe(userProfile => {
      this.currentUserProfile = userProfile;

      if (!userProfile) {
        this.activeTab = FeedTab.FEED;
        this.activeFeedType = FeedType.GLOBAL;
        return;
      }

      switch (userProfile.defaultFrontPageSection) {
        case FrontPageSection.GLOBAL:
          this.activeTab = FeedTab.FEED;
          this.activeFeedType = FeedType.GLOBAL;
          break;
        case FrontPageSection.PERSONAL:
          this.activeTab = FeedTab.FEED;
          this.activeFeedType = FeedType.PERSONAL;
          break;
        case FrontPageSection.RECENT:
          this.activeTab = FeedTab.RECENT;
          this.activeFeedType = FeedType.GLOBAL;
          break;
        case FrontPageSection.FOLLOWED:
          this.activeTab = FeedTab.RECENT;
          this.activeFeedType = FeedType.PERSONAL;
          break;
        default:
          this.activeTab = FeedTab.FEED;
          this.activeFeedType = FeedType.GLOBAL;
      }
    });

    this.onTabChange(this.activeTab);

    if (this.isBrowser) {
      fromEvent(this.windowRefService.nativeWindow, "scroll").pipe(
        auditTime(100),
        takeUntil(this.destroyed$)
      ).subscribe(() => this.onScroll());
    }
  }

  onFeedTypeChange(feedType: FeedType) {
    this.activeFeedType = feedType;
    this.onTabChange(this.activeTab);
  }

  onTabChange(feedType: FeedTab) {
    if (this.tabsContentWrapper?.nativeElement) {
      this.lastKnownHeight = this.tabsContentWrapper.nativeElement.offsetHeight;
    }

    this.changeDetectorRef.detectChanges();

    this.activeTab = feedType;
    this._page = 1;
    this.next = null;
    this.feedItems = null;
    this.images = null;
    this.loading = true;

    this._loadData().subscribe();
  }

  openImageById(feedItemId: FeedItemInterface["id"], imageId: ImageInterface["hash"] | ImageInterface["pk"]): void {
    const navigationContext = this._imageContentType
      ? this._filterFeedItemsByContentType(this.feedItems, this._imageContentType).map(
        item => this._navigationContextItemFromFeedItem(item)
      )
      : [];

    const paginationMapper = (results: any) => {
      if (this.activeTab === FeedTab.FEED) {
        return this._filterFeedItemsByContentType(results.results as FeedItemInterface[], this._imageContentType)
          .map(item => this._navigationContextItemFromFeedItem(item));
      } else {
        return (results.results as ImageInterface[])
          .map(item => ({
            imageId: item.hash || item.pk.toString(),
            thumbnailUrl: this.imageService.getGalleryThumbnail(item)
          }));
      }
    };

    this._openImageInSlideshow(
      feedItemId.toString(),
      imageId,
      navigationContext,
      paginationMapper
    );
  }

  openImage(image: ImageInterface): void {
    const imageId = image.hash || image.pk.toString();
    const navigationContext = this.images.map(i => ({
      imageId: i.hash || i.pk.toString(),
      thumbnailUrl: i.finalGalleryThumbnail
    }));

    const paginationMapper = (results: any) =>
      (results.results as ImageInterface[]).map(i => ({
        imageId: i.hash || i.pk.toString(),
        thumbnailUrl: this.imageService.getGalleryThumbnail(i)
      }));

    this._openImageInSlideshow(
      imageId.toString(),
      imageId,
      navigationContext,
      paginationMapper
    );
  }

  protected onScroll(): void {
    if (
      this.loading ||
      this.loadingMore ||
      this.next === null ||
      !this.utilsService.isNearBottom(this.windowRefService, this.elementRef)
    ) {
      return;
    }

    this._page++;
    this._loadData().subscribe();
  }

  private _openImageInSlideshow(
    loadingId: string,
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    navigationContext: ImageViewerNavigationContext,
    paginationMapper: (results: any) => ImageViewerNavigationContext
  ): void {
    this.loadingItemId = loadingId;

    this.imageService.loadImage(imageId).pipe(
      switchMap(dbImage => {
        const alias: ImageAlias = this.deviceService.lgMax() ? ImageAlias.HD : ImageAlias.QHD;
        const thumbnailUrl = this.imageService.getThumbnail(dbImage, alias);
        return this.imageService.loadImageFile(thumbnailUrl, () => {
        });
      }),
      switchMap(() =>
        this.imageViewerService.openSlideshow(
          this.componentId,
          imageId,
          FINAL_REVISION_LABEL,
          navigationContext,
          true
        )
      ),
      tap(slideshow => {
        this._setupSlideshowPagination(slideshow, paginationMapper);
      }),
      finalize(() => {
        this.loadingItemId = null;
      })
    ).subscribe({
      error: (error) => {
        console.error("Failed to load image:", error);
      }
    });
  }

  private _filterFeedItemsByContentType(items: FeedItemInterface[], contentType: ContentTypeInterface): FeedItemInterface[] {
    return items.filter(item => {
      return item.targetContentType === contentType.id || item.actionObjectContentType === contentType.id;
    });
  }

  private _navigationContextItemFromFeedItem(item: FeedItemInterface): ImageViewerNavigationContextItem {
    if (item.targetContentType === this._imageContentType.id) {
      return ({
        imageId: item.targetObjectId,
        thumbnailUrl: item.thumbnail
      });
    } else {
      return ({
        imageId: item.actionObjectObjectId,
        thumbnailUrl: item.thumbnail
      });
    }
  }

  private _setupSlideshowPagination(
    slideshow: ComponentRef<ImageViewerSlideshowComponent>,
    getNewNavigationContext:
      (results: PaginatedApiResultInterface<FeedItemInterface | ImageInterface>) => ImageViewerNavigationContext
  ): void {
    if (this._nearEndOfContextSubscription) {
      this._nearEndOfContextSubscription.unsubscribe();
    }

    this._nearEndOfContextSubscription = slideshow.instance.nearEndOfContext
      .pipe(
        filter(callerComponentId => callerComponentId === this.componentId),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        if (
          this.loading ||
          this.loadingMore ||
          this.next === null
        ) {
          return;
        }

        this._page++;
        this._loadData().subscribe(results => {
          const currentNavigationContext = slideshow.instance.navigationContext;
          const newItems = getNewNavigationContext(results);

          const newNavigationContext = [
            ...currentNavigationContext,
            ...newItems
          ];

          slideshow.instance.setNavigationContext(newNavigationContext);
        });
      });
  }

  private _loadData(): Observable<PaginatedApiResultInterface<FeedItemInterface | ImageInterface>> {
    if (this._page === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    if (this._currentDataSubscription) {
      this._currentDataSubscription.unsubscribe();
      this._currentDataSubscription = null;
    }

    const _cleanUp = () => {
      this.loading = false;
      this.loadingMore = false;
      this.lastKnownHeight = null;

      // Ensure the new items are rendered
      this.changeDetectorRef.detectChanges();
    };

    const _loadFeed = (section: FrontPageSection): Observable<PaginatedApiResultInterface<FeedItemInterface>> => {
      return new Observable(observer => {
        this._currentDataSubscription = this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
          this.feedItems = this.feedService.removeDuplicates([
            ...(this.feedItems || []),
            ...(feedItems.results as FeedItemInterface[])
          ]);

          this.next = feedItems.next;
          _cleanUp();

          observer.next(feedItems as PaginatedApiResultInterface<FeedItemInterface>);
          observer.complete();
        });
      });
    };

    const _loadRecent = (section: FrontPageSection): Observable<PaginatedApiResultInterface<ImageInterface>> => {
      return new Observable(observer => {
        this._currentDataSubscription = this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
          this.images = [
            ...this.images || [],
            ...feedItems.results as ImageInterface[]
          ];

          this.next = feedItems.next;
          _cleanUp();

          observer.next(feedItems as PaginatedApiResultInterface<ImageInterface>);
          observer.complete();
        });
      });
    };

    if (this.activeTab === FeedTab.FEED) {
      if (this.activeFeedType === FeedType.GLOBAL) {
        return _loadFeed(FrontPageSection.GLOBAL);
      } else {
        return _loadFeed(FrontPageSection.PERSONAL);
      }
    } else {
      if (this.activeFeedType === FeedType.GLOBAL) {
        return _loadRecent(FrontPageSection.RECENT);
      } else {
        return _loadRecent(FrontPageSection.FOLLOWED);
      }
    }
  }

  private _initContentTypes() {
    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this._imageContentType = contentType;
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "image"
    }));
  }

  protected readonly Array = Array;
}
