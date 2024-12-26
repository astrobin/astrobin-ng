import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { FeedApiService } from "@features/home/services/feed-api.service";
import { FeedService } from "@features/home/services/feed.service";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { debounceTime, take, takeUntil } from "rxjs/operators";
import { FrontPageSection, UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, merge, Subscription, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ActivatedRoute, Router } from "@angular/router";
import { fadeInOut } from "@shared/animations";

enum FeedTab {
  FEED = "FEED",
  RECENT = "RECENT"
}

enum FeedType {
  GLOBAL = "GLOBAL",
  PERSONAL = "PERSONAL",
}

interface VisibleFeedItemInterface {
  data: FeedItemInterface;
  visible: boolean;
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

            <div
              #feed
              class="feed"
            >
              <div
                class="feed-item"
                *ngFor="let item of visibleFeedItems; trackBy: trackByFn"
                [attr.data-feed-item-id]="item.data.id"
              >
                <astrobin-feed-item
                  @fadeInOut
                  *ngIf="item.visible"
                  (openImage)="openImageById($event)"
                  [feedItem]="item.data"
                ></astrobin-feed-item>
              </div>
            </div>

            <astrobin-loading-indicator
              *ngIf="loadingMore"
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
  protected MasonryModule: any;
  protected masonry: any;
  protected feedItems: FeedItemInterface[] = null;
  protected visibleFeedItems: VisibleFeedItemInterface[] = null;

  // For the recent images.
  protected images: ImageInterface[] = null;
  protected gridItems: MasonryLayoutGridItem[] = null;
  protected averageHeight = 150;

  protected loading = true;
  protected loadingMore = false;
  protected next: string | null = null;

  protected readonly isBrowser: boolean;

  private _page = 1;
  private _oldFeedItemsCount = 0;
  private _currentDataSubscription: Subscription;

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
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  trackByFn(index: number, item: VisibleFeedItemInterface): string {
    return "" + item.data.id;
  }

  async ngOnInit() {
    super.ngOnInit();

    if (this.isBrowser) {
      this.MasonryModule = await import("masonry-layout");
    }

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

      fromEvent(this.windowRefService.nativeWindow, "resize").pipe(
        takeUntil(this.destroyed$),
        debounceTime(100)
      ).subscribe(() => {
        this.visibleFeedItems = this.feedItems.map(item => {
          return {
            data: item,
            visible: true
          };
        });

        this.changeDetectorRef.detectChanges();

        if (this.masonry) {
          this.masonry.once("layoutComplete", () => {
            this._masonryLayoutComplete();
          });
          this.masonry.layout();
        }
      });
    }
  }

  ngAfterViewInit() {
    this.imageViewerService.closeSlideShow(false);
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute, this.viewContainerRef);
  }

  ngOnDestroy() {
    this._destroyMasonry();
    super.ngOnDestroy();
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
    this.visibleFeedItems = null;
    this.images = null;
    this._oldFeedItemsCount = 0;
    this.loading = true;

    this._destroyMasonry();

    this.utilsService.delay(500).subscribe(() => {
      this._loadData();
    });
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
      [],
      this.viewContainerRef,
      true
    ).subscribe();
  }

  openImage(image: ImageInterface): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      image.hash || image.pk.toString(),
      FINAL_REVISION_LABEL,
      this.images.map(i => ({
        imageId: i.hash || i.pk.toString(),
        thumbnailUrl: i.finalGalleryThumbnail
        // Can't pass the image here because it's from an ImageSerializer.
      })),
      this.viewContainerRef,
      true
    ).subscribe();
  }

  private _loadData() {
    if (this._page === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    if (this._currentDataSubscription) {
      this._currentDataSubscription.unsubscribe();
      this._currentDataSubscription = null;
    }

    const _cleanUp = (newItemsAdded: boolean) => {
      this.loading = false;
      this.loadingMore = false;

      // Ensure the new items are rendered
      this.changeDetectorRef.detectChanges();

      if (!this.masonry) {
        this._initMasonry().then(() => {
          this._masonryLayoutComplete();
        });
      } else if (newItemsAdded) {
        // Find newly added elements
        const feedItems = this.feedElement.nativeElement.querySelectorAll(".feed-item");
        // Assuming we know how many items were there before, we can isolate the new ones.
        // For simplicity, let's say we track the old count and new count:
        const newElements = Array.from(feedItems).slice(this._oldFeedItemsCount);
        this._oldFeedItemsCount = feedItems.length;

        // Call appended on just the new elements
        this.masonry.appended(newElements);
        this._masonryLayoutComplete();
      }
    };

    const _loadFeed = (section: FrontPageSection) => {
      this._currentDataSubscription = this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        const prevCount = this.feedItems?.length || 0;

        this.feedItems = this.feedService.removeDuplicates([
          ...(this.feedItems || []),
          ...(feedItems.results as FeedItemInterface[])
        ]);

        this.visibleFeedItems = this.feedItems.map(item => {
          return {
            data: item,
            visible: true
          };
        });

        const newItemsAdded = (this.feedItems.length > prevCount);
        this.next = feedItems.next;
        this.lastKnownHeight = null;
        _cleanUp(newItemsAdded);
      });
    };

    const _loadRecent = (section: FrontPageSection) => {
      this._currentDataSubscription = this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        const prevCount = this.images?.length || 0;

        this.images = [
          ...this.images || [],
          ...feedItems.results as ImageInterface[]
        ];

        const newItemsAdded = (this.images.length > prevCount);
        this.next = feedItems.next;
        this.lastKnownHeight = null;
        _cleanUp(newItemsAdded);
      });
    };

    if (this.activeTab === FeedTab.FEED) {
      if (this.activeFeedType === FeedType.GLOBAL) {
        _loadFeed(FrontPageSection.GLOBAL);
      } else {
        _loadFeed(FrontPageSection.PERSONAL);
      }
    } else {
      if (this.activeFeedType === FeedType.GLOBAL) {
        _loadRecent(FrontPageSection.RECENT);
      } else {
        _loadRecent(FrontPageSection.FOLLOWED);
      }
    }
  }

  private _updateVisibleFeedItems(newItemsAdded: boolean) {
    if (!this.feedItems || !this.isBrowser) {
      return;
    }

    const bufferSize = 2000;
    const _win = this.windowRefService.nativeWindow;
    const _doc = _win.document;
    const newVisibleFeedItems: VisibleFeedItemInterface[] = [];

    for (const item of this.feedItems) {
      const element = this.feedElement.nativeElement.querySelector(`[data-feed-item-id="${item.id}"]`) as HTMLElement;
      let isVisible = true;

      if (element) {
        const rect = element.getBoundingClientRect();
        isVisible = rect.top + rect.height >= -bufferSize &&
          rect.top <= (_win.innerHeight || _doc.documentElement.clientHeight) + bufferSize;
      }

      // Only create a new object if visibility has changed or it's a new item
      const existingItem = this.visibleFeedItems?.find(vfi => vfi.data.id === item.id);
      if (!existingItem || existingItem.visible !== isVisible) {
        newVisibleFeedItems.push({
          data: item,
          visible: isVisible
        });
      } else if (existingItem) {
        newVisibleFeedItems.push(existingItem); // Keep the existing object
      }
    }
    this.visibleFeedItems = newVisibleFeedItems;
  }

  private async _initMasonry() {
    if (!this.isBrowser || !this.MasonryModule || !this.feedElement) {
      return;
    }

    // Initialize masonry for the first time
    this.masonry = new this.MasonryModule.default(this.feedElement.nativeElement, {
      itemSelector: ".feed-item",
      columnWidth: ".feed-item",
      percentPosition: true,
      gutter: 20,
      transitionDuration: "0"
    });

    // Keep track of how many items we initially had.
    const feedItems = this.feedElement.nativeElement.querySelectorAll(".feed-item");
    this._oldFeedItemsCount = feedItems.length;

    this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
    this.masonry.layout();
  }

  private _masonryLayoutComplete() {
    const feedItems = this.feedElement.nativeElement.querySelectorAll(".feed-item") as NodeListOf<HTMLElement>;
    feedItems.forEach(item => {
      this.renderer.setStyle(item, "opacity", "1");
    });
    this._updateVisibleFeedItems(false);
    this.changeDetectorRef.detectChanges();
  }

  private _destroyMasonry() {
    if (this.masonry) {
      this.masonry.destroy();
      this.masonry = null;
    }
  }

  private _onScroll(): void {
    this._updateVisibleFeedItems(false);

    if (
      this.loading ||
      this.loadingMore ||
      this.next === null ||
      !this.utilsService.isNearBottom(this.windowRefService, this.elementRef)
    ) {
      return;
    }

    this._page++;
    this._loadData();
  }
}
