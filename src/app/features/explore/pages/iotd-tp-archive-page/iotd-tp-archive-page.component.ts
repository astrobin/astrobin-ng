import { ChangeDetectorRef, Component, ComponentRef, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { TopPickArchiveInterface } from "@features/iotd/types/top-pick-archive.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { fromEvent, merge, Observable, Subscription, throttleTime } from "rxjs";
import { IotdArchiveInterface } from "@features/iotd/types/iotd-archive.interface";
import { TopPickNominationArchiveInterface } from "@features/iotd/types/top-pick-nomination-archive.interface";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { debounceTime, filter, takeUntil } from "rxjs/operators";
import { NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { fadeInOut } from "@shared/animations";
import { DataSource, FINAL_REVISION_LABEL, ImageInterface, SubjectType } from "@shared/interfaces/image.interface";
import { ImageViewerNavigationContext, ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { SearchService } from "@features/search/services/search.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchAwardFilterValue } from "@features/search/components/filters/search-award-filter/search-award-filter.value";
import { SearchFilterService } from "@features/search/services/search-filter.service";

enum ArchiveType {
  IOTD = SearchAwardFilterValue.IOTD,
  TP = SearchAwardFilterValue.TOP_PICK,
  TPN = SearchAwardFilterValue.TOP_PICK_NOMINATION
}

interface VisibleItemInterface {
  data: IotdArchiveInterface | TopPickArchiveInterface | TopPickNominationArchiveInterface;
  visible: boolean;
}

@Component({
  selector: "astrobin-iotd-tp-archive-page",
  template: `
    <div class="page has-breadcrumb">
      <div class="tabs-container d-flex justify-content-between align-items-center mb-1 mb-md-2 mb-lg-3">

        <ul
          ngbNav
          #nav="ngbNav"
          (navChange)="onTabChange($event)"
          [(activeId)]="activeTab"
          class="nav-tabs"
        >
          <li [ngbNavItem]="ArchiveType.IOTD">
            <button ngbNavLink>{{ "Image of the day" | translate }}</button>
            <ng-template ngbNavContent>
              <ng-container *ngTemplateOutlet="tabContentTemplate"></ng-container>
            </ng-template>
          </li>
          <li [ngbNavItem]="ArchiveType.TP">
            <button ngbNavLink>{{ "Top Pick" | translate }}</button>
            <ng-template ngbNavContent>
              <ng-container *ngTemplateOutlet="tabContentTemplate"></ng-container>
            </ng-template>
          </li>
          <li [ngbNavItem]="ArchiveType.TPN">
            <button ngbNavLink>{{ "Top Pick Nomination" | translate }}</button>
            <ng-template ngbNavContent>
              <ng-container *ngTemplateOutlet="tabContentTemplate"></ng-container>
            </ng-template>
          </li>
        </ul>

        <div ngbDropdown [placement]="'bottom-end'" class="dropdown d-none d-md-block">
          <button ngbDropdownToggle class="btn btn-link text-primary no-toggle p-3">
            <fa-icon icon="filter"></fa-icon>
          </button>
          <div ngbDropdownMenu>
            <div class="dropdown-header">
              {{ searchFilterService.humanizeSearchAutoCompleteType(SearchAutoCompleteType.DATA_SOURCE) }}
            </div>

            <button
              *ngFor="let source of getDataSourceEnumValues()"
              (click)="openSearch(SearchAutoCompleteType.DATA_SOURCE, source)"
              ngbDropdownItem
            >
              {{ imageService.humanizeDataSource(source) }}
            </button>

            <div class="dropdown-header">
              {{ searchFilterService.humanizeSearchAutoCompleteType(SearchAutoCompleteType.SUBJECT_TYPE) }}
            </div>

            <button
              *ngFor="let subjectType of getSubjectTypeEnumValues()"
              (click)="openSearch(SearchAutoCompleteType.SUBJECT_TYPE, subjectType)"
              ngbDropdownItem
            >
              {{ imageService.humanizeSubjectType(subjectType) }}
            </button>
          </div>
        </div>
      </div>

      <div [ngbNavOutlet]="nav" class="mt-2"></div>
    </div>

    <ng-template #tabContentTemplate>
      <ng-container *ngIf="loading">
        <ng-template [ngTemplateOutlet]="loadingTemplate"></ng-template>
      </ng-container>

      <div class="items-container" #itemsContainer>
        <div
          *ngFor="let item of visibleItems; trackBy: trackByFn"
          class="item"
        >
          <astrobin-iotd-tp-archive-item
            *ngIf="item.visible"
            @fadeInOut
            (click)="openImageById(item.data.image['hash'] || item.data.image['pk'])"
            (imageLoaded)="onImageLoaded($event)"
            [attr.data-item-id]="item.data.id"
            [item]="item.data"
          ></astrobin-iotd-tp-archive-item>
        </div>

        <ng-container *ngIf="loadingMore">
          <ng-template [ngTemplateOutlet]="loadingTemplate"></ng-template>
        </ng-container>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./iotd-tp-archive-page.component.scss"],
  animations: [fadeInOut]
})
export class IotdTpArchivePageComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  readonly title = this.translateService.instant("Image of the day and Top Pick archive");

  @ViewChild("itemsContainer", { static: false }) itemsContainer: ElementRef;

  protected readonly ArchiveType = ArchiveType;

  protected activeTab: ArchiveType;
  protected loading = false;
  protected loadingMore = false;
  protected next: string | null = null;
  protected MasonryModule: any;
  protected masonry: any;
  protected items: IotdArchiveInterface[] | TopPickArchiveInterface[] | TopPickNominationArchiveInterface[];
  protected visibleItems: VisibleItemInterface[];
  protected _page = 1;
  protected readonly SearchAutoCompleteType = SearchAutoCompleteType;
  protected readonly DataSource = DataSource;
  private readonly _isBrowser: boolean;
  private _oldItemsCount = 0;
  private _loadedImages: Set<string> = new Set();
  private _currentBatch: string[] = [];
  private _nearEndOfContextSubscription: Subscription;

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly iotdApiService: IotdApiService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly imageService: ImageService,
    public readonly searchService: SearchService,
    public readonly searchFilterService: SearchFilterService,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    super.ngOnInit();

    if (this._isBrowser) {
      this.MasonryModule = await import("masonry-layout");
    }

    this._initTitleAndBreadcrumb();
    this._initScrollListener();
    this._initResizeListener();
    this._initTab();
  }

  ngOnDestroy() {
    this._destroyMasonry();
    super.ngOnDestroy();
  }

  openImageById(imageId: ImageInterface["hash"] | ImageInterface["pk"]): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      this.items.map(item => ({
        imageId: item.image["hash"] || item.image["pk"],
        thumbnailUrl: this.imageService.getGalleryThumbnail(item.image)
      })),
      this.viewContainerRef,
      true
    ).subscribe(slideshow => {
      this._setupSlideshowPagination(
        slideshow,
        (results) =>
          results.map(result => {
            return {
              imageId: result.image["hash"] || result.image["pk"],
              thumbnailUrl: this.imageService.getGalleryThumbnail(result.image)
            };
          })
      );
    });
  }

  getDataSourceEnumValues(): DataSource[] {
    return Object.values(DataSource).filter(value => typeof value === "string") as DataSource[];
  }

  getSubjectTypeEnumValues(): SubjectType[] {
    return Object.values(SubjectType).filter(value => typeof value === "string") as SubjectType[];
  }

  protected openSearch(key: SearchAutoCompleteType, value: any): void {
    const encodedParams = this.searchService.modelToParams({
      [key]: value,
      [SearchAutoCompleteType.AWARD]: [this.activeTab]
    });

    this.router.navigateByUrl(`/search?p=${encodedParams}`);
  }

  protected onTabChange(event: NgbNavChangeEvent<ArchiveType>) {
    if (this.activeTab == event.nextId && this.items !== undefined) {
      return;
    }

    this.router.navigate([], {
      fragment: event.nextId.toString(),
    });

    this.activeTab = event.nextId;

    this._page = 1;
    this.next = null;

    this.items = null;
    this.visibleItems = null;

    this._destroyMasonry();

    this.utilsService.delay(100).subscribe(() => {
      this._loadData().subscribe();
    });
  }

  protected trackByFn(index: number, item: VisibleItemInterface) {
    return item.data.id;
  }

  protected onImageLoaded(imageId: string): void {
    this._loadedImages.add(imageId);

    // If all images in the current batch are loaded, trigger masonry layout
    if (this._currentBatch.every(id => this._loadedImages.has(id))) {
      if (this.masonry) {
        this.masonry.layout();
      } else {
        this._initMasonry();
      }
    }
  }

  private _initTitleAndBreadcrumb() {
    this.titleService.setTitle(this.title);
    this.store$.dispatch(new SetBreadcrumb({
      breadcrumb: [
        {
          label: this.translateService.instant("Explore")
        },
        {
          label: this.title
        }
      ]
    }));
  }

  private _initScrollListener() {
    if (this._isBrowser) {
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

  private _initResizeListener() {
    if (this._isBrowser) {
      fromEvent(this.windowRefService.nativeWindow, "resize").pipe(
        takeUntil(this.destroyed$),
        debounceTime(100)
      ).subscribe(() => {
        this.visibleItems = this.items.map(item => {
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

  private _initTab() {
    const doInit = () => {
      const fragment = this.activatedRoute.snapshot.fragment;

      this.onTabChange({
        nextId: fragment
          ? (fragment as any) as ArchiveType
          : ArchiveType.IOTD
      } as NgbNavChangeEvent<ArchiveType>);
    };

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      doInit();
    });

    doInit();
  }

  private _loadData(): Observable<(IotdArchiveInterface | TopPickArchiveInterface | TopPickNominationArchiveInterface)[]> {
    return new Observable(subscriber => {
      let api: Observable<PaginatedApiResultInterface<(
        IotdArchiveInterface |
        TopPickArchiveInterface |
        TopPickNominationArchiveInterface
        )>>;

      switch (this.activeTab) {
        case ArchiveType.IOTD:
          api = this.iotdApiService.getIotdArchive(this._page);
          break;
        case ArchiveType.TP:
          api = this.iotdApiService.getTopPickArchive(this._page);
          break;
        case ArchiveType.TPN:
          api = this.iotdApiService.getTopPickNominationsArchive(this._page);
          break;
      }

      if (this._page === 1) {
        this.loading = true;
      } else {
        this.loadingMore = true;
      }

      api.subscribe(response => {
        this.loading = false;
        this.loadingMore = false;
        this.next = response.next;

        this._currentBatch = response.results.map(item => item.id.toString());

        switch (this.activeTab) {
          case ArchiveType.IOTD:
            this.items = [...this.items || [], ...response.results as IotdArchiveInterface[]];
            break;
          case ArchiveType.TP:
            this.items = [...this.items || [], ...response.results as TopPickArchiveInterface[]];
            break;
          case ArchiveType.TPN:
            this.items = [...this.items || [], ...response.results as TopPickNominationArchiveInterface[]];
            break;
        }

        this.visibleItems = this.items.map(item => ({
          data: item,
          visible: true
        }));

        // Ensure the new items are rendered
        this.changeDetectorRef.detectChanges();

        if (!this.masonry) {
          this._initMasonry().then(() => {
            subscriber.next(response.results);
            subscriber.complete();
          });
        } else if (response.results) {
          // Find newly added elements
          const items = this.itemsContainer.nativeElement.querySelectorAll(".item");
          // Assuming we know how many items were there before, we can isolate the new ones.
          // For simplicity, let's say we track the old count and new count:
          const newElements = Array.from(items).slice(this._oldItemsCount);
          this._oldItemsCount = items.length;

          // Call appended on just the new elements
          this.masonry.appended(newElements);
          this._masonryLayoutComplete();
          subscriber.next(response.results);
          subscriber.complete();
        }
      });
    });
  }

  private async _initMasonry() {
    if (!this._isBrowser || !this.MasonryModule || !this.itemsContainer) {
      return;
    }

    // Initialize masonry for the first time
    this.masonry = new this.MasonryModule.default(this.itemsContainer.nativeElement, {
      itemSelector: ".item",
      columnWidth: ".item",
      percentPosition: true,
      gutter: 20,
      transitionDuration: "0"
    });

    // Keep track of how many items we itemsContainer had.
    const items = this.itemsContainer.nativeElement.querySelectorAll(".item");
    this._oldItemsCount = items.length;

    this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
    this.masonry.layout();
  }

  private _masonryLayoutComplete() {
    if (!this.itemsContainer) {
      return;
    }

    const items = this.itemsContainer.nativeElement.querySelectorAll(".item") as NodeListOf<HTMLElement>;
    items.forEach(item => {
      this.renderer.setStyle(item, "opacity", "1");
    });
    this._updateVisibleItems();
    this.changeDetectorRef.detectChanges();
  }

  private _destroyMasonry() {
    if (this.masonry) {
      this.masonry.destroy();
      this.masonry = null;
    }
  }

  private _updateVisibleItems() {
    if (!this.items || !this._isBrowser) {
      return;
    }

    const bufferSize = 2000;
    const _win = this.windowRefService.nativeWindow;
    const _doc = _win.document;
    const newVisibleFeedItems: VisibleItemInterface[] = [];

    for (const item of this.items) {
      const element = this.itemsContainer.nativeElement.querySelector(`[data-item-id="${item.id}"]`) as HTMLElement;
      let isVisible = true;

      if (element) {
        const rect = element.getBoundingClientRect();
        isVisible = rect.top + rect.height >= -bufferSize &&
          rect.top <= (_win.innerHeight || _doc.documentElement.clientHeight) + bufferSize;
      }

      // Only create a new object if visibility has changed, or it's a new item
      const existingItem = this.visibleItems?.find(vfi => vfi.data.id === item.id);
      if (!existingItem || existingItem.visible !== isVisible) {
        newVisibleFeedItems.push({
          data: item,
          visible: isVisible
        });
      } else if (existingItem) {
        newVisibleFeedItems.push(existingItem); // Keep the existing object
      }
    }
    this.visibleItems = newVisibleFeedItems;
  }

  private _onScroll() {
    this._updateVisibleItems();

    if (
      this._isBrowser &&
      this.utilsService.isNearBottom(this.windowRefService, this.elementRef) &&
      !!this.next &&
      !this.loading &&
      !this.loadingMore
    ) {
      this._loadData().subscribe();
    }
  }

  private _setupSlideshowPagination(
    slideshow: ComponentRef<ImageViewerSlideshowComponent>,
    getNewNavigationContext:
      (results: (IotdArchiveInterface | TopPickArchiveInterface | TopPickNominationArchiveInterface)[]) => ImageViewerNavigationContext
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
}
