import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { FeedApiService } from "@features/home/services/feed-api.service";
import { FeedService } from "@features/home/services/feed.service";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { filter, take, takeUntil } from "rxjs/operators";
import { FrontPageSection, UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import Masonry from 'masonry-layout';
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

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
        <li [ngbNavItem]="FeedTab.FEED">
          <a ngbNavLink translate="Activity feed"></a>
          <ng-template ngbNavContent>
            <astrobin-loading-indicator *ngIf="loading"></astrobin-loading-indicator>
            <div
              *ngIf="feedItems !== null"
              #feed
              class="feed"
            >
              <astrobin-feed-item
                *ngFor="let item of feedItems; trackBy: trackByFn"
                [feedItem]="item"
                class="feed-item"
              ></astrobin-feed-item>
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

    <div [ngbNavOutlet]="nav"></div>
  `,
  styleUrls: ["./feed.component.scss"]
})
export class FeedComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @ViewChild("feed") protected feedElement: ElementRef;

  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;
  protected readonly FeedTab = FeedTab;
  protected readonly FeedType = FeedType;

  protected activeTab = FeedTab.FEED;
  protected activeFeedType = FeedType.GLOBAL;
  protected currentUserProfile: UserProfileInterface;

  // For the activity feed.
  protected masonry: Masonry;
  protected feedItems: FeedItemInterface[] = null;

  // For the recent images.
  protected images: ImageInterface[] = null;
  protected gridItems: MasonryLayoutGridItem[] = null;
  protected averageHeight = 150;

  protected loading = true;
  protected loadingMore = false;
  protected next: string | null = null;

  private readonly _isBrowser: boolean;
  private _page = 1;
  private _oldFeedItemsCount = 0;

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
    this._isBrowser = isPlatformBrowser(platformId);

    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.imageViewerService.closeSlideShow(false);
      this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute, this.viewContainerRef);
    });
  }

  trackByFn(index: number, item: FeedItemInterface): string {
    return '' + item.id
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.currentUserProfile$.pipe(take(1)).subscribe(userProfile => {
      this.currentUserProfile = userProfile;

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

    if (this._isBrowser) {
      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(takeUntil(this.destroyed$), throttleTime(200))
        .subscribe(() => this._onScroll());
    }
  }

  ngOnDestroy() {
    this._destroyMasonry()
    super.ngOnDestroy();
  }

  onFeedTypeChange(feedType: FeedType) {
    this.activeFeedType = feedType;
    this.onTabChange(this.activeTab);
  }

  onTabChange(feedType: FeedTab) {
    this.activeTab = feedType;
    this._page = 1;
    this.next = null;
    this.feedItems = null;
    this.images = null;

    this._destroyMasonry();
    this._loadData();
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
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

    const _cleanUp = (newItemsAdded: boolean) => {
      this.loading = false;
      this.loadingMore = false;

      // Ensure the new items are rendered
      this.changeDetectorRef.detectChanges();

      if (!this.masonry) {
        this._initMasonry();
      } else if (newItemsAdded) {
        // Find newly added elements
        const feedItems = this.feedElement.nativeElement.querySelectorAll('.feed-item');
        // Assuming we know how many items were there before, we can isolate the new ones.
        // For simplicity, let's say we track the old count and new count:
        const newElements = Array.from(feedItems).slice(this._oldFeedItemsCount);
        this._oldFeedItemsCount = feedItems.length;

        // Call appended on just the new elements
        this.masonry.appended(newElements);
      }

      this._masonryLayoutComplete();
    }

    const _loadFeed = (section: FrontPageSection) => {
      this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        const prevCount = this.feedItems?.length || 0;

        this.feedItems = this.feedService.removeDuplicates([
          ...(this.feedItems || []),
          ...(feedItems.results as FeedItemInterface[])
        ]);

        const newItemsAdded = (this.feedItems.length > prevCount);
        this.next = feedItems.next;
        _cleanUp(newItemsAdded);
      });
    };

    const _loadRecent = (section: FrontPageSection) => {
      this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        const prevCount = this.images?.length || 0;

        this.images = [
          ...this.images || [],
          ...feedItems.results as ImageInterface[]
        ];

        const newItemsAdded = (this.images.length > prevCount);
        this.next = feedItems.next;
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

  private _initMasonry() {
    if (!this._isBrowser) {
      return;
    }

    // Initialize masonry for the first time
    this.masonry = new Masonry(this.feedElement.nativeElement, {
      itemSelector: ".feed-item",
      columnWidth: ".feed-item",
      percentPosition: true,
      gutter: 20,
      transitionDuration: "0"
    });

    // Keep track of how many items we initially had.
    const feedItems = this.feedElement.nativeElement.querySelectorAll('.feed-item');
    this._oldFeedItemsCount = feedItems.length;

    this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
    this.masonry.layout();
  }

  private _masonryLayoutComplete() {
    const feedItems = this.feedElement.nativeElement.querySelectorAll('.feed-item') as NodeListOf<HTMLElement>;
    feedItems.forEach(item => {
      this.renderer.setStyle(item, "opacity", "1");
    });
  }

  private _destroyMasonry() {
    if (this.masonry) {
      this.masonry.destroy();
      this.masonry = null
    }
  }

  private _onScroll(): void {
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
