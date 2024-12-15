import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { FeedApiService } from "@features/home/services/feed-api.service";
import { FeedService } from "@features/home/services/feed.service";
import { take, takeUntil } from "rxjs/operators";
import { FrontPageSection, UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";

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
    <div class="d-flex justify-content-between align-items-center mb-3">
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
    public readonly renderer: Renderer2
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
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

    const _cleanUp = () => {
      this.loading = false;
      this.loadingMore = false;
    };

    const _loadFeed = (section: FrontPageSection) => {
      this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        this.feedItems = this.feedService.removeDuplicates([
          ...(this.feedItems || []),
          ...(feedItems.results as FeedItemInterface[])
        ]);
        _cleanUp();
        this.next = feedItems.next;
      });
    };

    const _loadRecent = (section: FrontPageSection) => {
      this.feedApiService.getFeed(this._page, section).subscribe(feedItems => {
        this.images = [
          ...this.images || [],
          ...feedItems.results as ImageInterface[]
        ];
        _cleanUp();
        this.next = feedItems.next;
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
