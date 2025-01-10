import { AfterViewInit, ChangeDetectorRef, Component, ComponentRef, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { FeedApiService } from "@features/home/services/feed-api.service";
import { FeedService } from "@features/home/services/feed.service";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { debounceTime, filter, switchMap, take, takeUntil } from "rxjs/operators";
import { FrontPageSection, UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem, ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, merge, Observable, Subscription, throttleTime } from "rxjs";
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
            <astrobin-loading-indicator *ngIf="loading || !isBrowser"></astrobin-loading-indicator>

            <astrobin-masonry-layout
              (layoutReady)="masonryLayoutReady = true"
              [items]="feedItems"
            >
              <ng-template let-item let-notifyReady="notifyReady">
                <astrobin-feed-item
                  @fadeInOut
                  (loaded)="notifyReady()"
                  (openImage)="openImageById($event)"
                  [feedItem]="item"
                ></astrobin-feed-item>
              </ng-template>
            </astrobin-masonry-layout>

            <astrobin-loading-indicator
              *ngIf="!loading && (loadingMore || !masonryLayoutReady)"
              class="mt-5"
            ></astrobin-loading-indicator>
          </ng-template>
        </li>

        <li [ngbNavItem]="FeedTab.RECENT">
          <a ngbNavLink translate="Recent images"></a>
          <ng-template ngbNavContent>
            <astrobin-loading-indicator *ngIf="loading"></astrobin-loading-indicator>

            <div
              (gridItemsChange)="onGridItemsChange($event)"
              [activeLayout]="UserGalleryActiveLayout.SMALL"
              [astrobinMasonryLayout]="images"
              class="masonry-layout-container"
            >
              <ng-container *ngIf="gridItems?.length > 0">
                <a
                  *ngFor="let item of gridItems"
                  (click)="openImage(item)"
                  [style.width.px]="item.displayWidth * averageHeight / item.displayHeight * .5"
                  [style.flex-grow]="item.displayWidth * averageHeight / item.displayHeight * .5"
                  [style.min-width.px]="averageHeight"
                  [style.min-height.px]="averageHeight"
                  [href]="'/i/' + (item.hash || item.pk)"
                  astrobinEventPreventDefault
                  class="image-link"
                >
                  <!-- ImageSerializerGallery always only has the regular thumbnail and no more -->
                  <img
                    *ngIf="item?.thumbnails?.length"
                    [alt]="item.title"
                    [ngSrc]="item.thumbnails[0].url"
                    [style.object-position]="item.objectPosition"
                    fill
                  />

                  <astrobin-image-icons [image]="item"></astrobin-image-icons>
                  <astrobin-image-hover [image]="item"></astrobin-image-hover>
                </a>
              </ng-container>
            </div>
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

    <div
      #tabsContentWrapper
      class="tabs-content-wrapper"
      [style.min-height.px]="lastKnownHeight"
    >
      <div [ngbNavOutlet]="nav"></div>
    </div>
  `,
  styleUrls: ["./feed.component.scss"],
  animations: [fadeInOut]
})
export class FeedComponent extends BaseComponentDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("tabsContentWrapper", { static: false }) tabsContentWrapper: ElementRef;
  @ViewChild("feed") protected feedElement: ElementRef;

  protected lastKnownHeight = null;

  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;
  protected readonly FeedTab = FeedTab;
  protected readonly FeedType = FeedType;

  protected activeTab = FeedTab.FEED;
  protected activeFeedType = FeedType.GLOBAL;
  protected currentUserProfile: UserProfileInterface;

  // For the activity feed.
  protected feedItems: FeedItemInterface[] = null;
  protected masonryLayoutReady = false;

  // For the recent images.
  protected images: ImageInterface[] = null;
  protected gridItems: MasonryLayoutGridItem[] = null;
  protected averageHeight = 150;

  protected loading = true;
  protected loadingMore = false;
  protected next: string | null = null;

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
    public readonly viewContainerRef: ViewContainerRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly renderer: Renderer2,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly imageService: ImageService
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
      merge(
        fromEvent(this.windowRefService.nativeWindow, "scroll").pipe(
          takeUntil(this.destroyed$),
          throttleTime(200)
        ),
        fromEvent(this.windowRefService.nativeWindow, "scroll").pipe(
          takeUntil(this.destroyed$),
          debounceTime(100)
        )
      ).subscribe(() => this._onScroll());
    }
  }

  ngAfterViewInit() {
    this.imageViewerService.closeSlideShow(false);
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute, this.viewContainerRef);
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

    this.utilsService.delay(500).pipe(
      switchMap(() => this._loadData())
    ).subscribe();
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
  }

  openImageById(imageId: ImageInterface["hash"] | ImageInterface["pk"]): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      this._imageContentType
        ? this._filterFeedItemsByContentType(this.feedItems, this._imageContentType).map(
          item => this._navigationContextItemFromFeedItem(item)
        )
        : [],
      this.viewContainerRef,
      true
    ).subscribe(slideshow => {
      this._setupSlideshowPagination(
        slideshow,
        (results) => {
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
        }
      );
    });
  }

  openImage(image: ImageInterface): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      image.hash || image.pk.toString(),
      FINAL_REVISION_LABEL,
      this.images.map(i => ({
        imageId: i.hash || i.pk.toString(),
        thumbnailUrl: i.finalGalleryThumbnail
      })),
      this.viewContainerRef,
      true
    ).subscribe(slideshow => {
      this._setupSlideshowPagination(
        slideshow,
        (results) => {
          return (results.results as ImageInterface[]).map(i => ({
            imageId: i.hash || i.pk.toString(),
            thumbnailUrl: this.imageService.getGalleryThumbnail(i)
          }));
        }
      );
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
    this.masonryLayoutReady = false;

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
          this.lastKnownHeight = null;
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
          this.lastKnownHeight = null;
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

  private _onScroll(): void {
    if (
      this.loading ||
      this.loadingMore ||
      this.next === null ||
      !this.masonryLayoutReady ||
      !this.utilsService.isNearBottom(this.windowRefService, this.elementRef)
    ) {
      return;
    }

    this._page++;
    this._loadData().subscribe();
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
}
