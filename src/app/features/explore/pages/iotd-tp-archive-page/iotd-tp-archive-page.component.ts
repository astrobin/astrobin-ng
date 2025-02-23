import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@core/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { TopPickArchiveInterface } from "@features/iotd/types/top-pick-archive.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { auditTime, fromEvent, Observable, Subscription } from "rxjs";
import { IotdArchiveInterface } from "@features/iotd/types/iotd-archive.interface";
import { TopPickNominationArchiveInterface } from "@features/iotd/types/top-pick-nomination-archive.interface";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { filter, takeUntil } from "rxjs/operators";
import { NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { fadeInOut } from "@shared/animations";
import { DataSource, FINAL_REVISION_LABEL, ImageInterface, SubjectType } from "@core/interfaces/image.interface";
import { ImageViewerNavigationContext, ImageViewerService } from "@core/services/image-viewer.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { SearchService } from "@core/services/search.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchAwardFilterValue } from "@features/search/components/filters/search-award-filter/search-award-filter.value";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { RouterService } from "@core/services/router.service";

enum ArchiveType {
  IOTD = SearchAwardFilterValue.IOTD,
  TP = SearchAwardFilterValue.TOP_PICK,
  TPN = SearchAwardFilterValue.TOP_PICK_NOMINATION
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
            <button ngbNavLink>
              <span class="d-none d-md-inline">{{ "Image of the day" | translate }}</span>
              <span class="d-inline d-md-none">IOTD</span>
            </button>
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

        <div class="d-flex flex-nowrap align-items-center me-2">
          <div ngbDropdown [placement]="'bottom-end'" class="dropdown px-2 py-3 d-none d-md-block">
            <button ngbDropdownToggle class="btn btn-link text-primary no-toggle">
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

          <a href="https://welcome.astrobin.com/iotd" target="_blank" rel="noopener" class="px-2 py-3">
            <fa-icon icon="info-circle"></fa-icon>
          </a>
        </div>
      </div>

      <div [ngbNavOutlet]="nav" class="mt-2"></div>

      <astrobin-scroll-to-top></astrobin-scroll-to-top>
    </div>

    <ng-template #tabContentTemplate>
      <ng-container *ngIf="loading">
        <ng-template [ngTemplateOutlet]="loadingTemplate"></ng-template>
      </ng-container>

      <astrobin-masonry-layout
        [layout]="'small'"
        [items]="items"
      >
        <ng-template let-item>
          <astrobin-iotd-tp-archive-item
            @fadeInOut
            (click)="openImageById(item.image['hash'] || item.image['pk'])"
            [item]="item"
          ></astrobin-iotd-tp-archive-item>
        </ng-template>
      </astrobin-masonry-layout>

      <ng-container *ngIf="!loading && loadingMore">
        <ng-template [ngTemplateOutlet]="loadingTemplate"></ng-template>
      </ng-container>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./iotd-tp-archive-page.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IotdTpArchivePageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("Image of the day and Top Pick archive");

  @ViewChild("itemsContainer", { static: false }) itemsContainer: ElementRef;

  protected readonly ArchiveType = ArchiveType;
  protected readonly SearchAutoCompleteType = SearchAutoCompleteType;
  protected readonly DataSource = DataSource;

  protected activeTab: ArchiveType;
  protected loading = false;
  protected loadingMore = false;
  protected items: IotdArchiveInterface[] | TopPickArchiveInterface[] | TopPickNominationArchiveInterface[];

  private readonly _isBrowser: boolean;

  // Used to cancel a pending request if the tab changes.
  private _currentRequestId = 0;

  private _page = 1;
  private _next: string | null = null;
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly searchService: SearchService,
    public readonly searchFilterService: SearchFilterService,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);

    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationEnd && router.url.startsWith("/" + RouterService.getCurrentPath(activatedRoute))
      ),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this._initTitleAndBreadcrumb();
      this.changeDetectorRef.markForCheck();
    });
  }

  async ngOnInit() {
    super.ngOnInit();

    this._initScrollListener();
    this._initTab();
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
      this.changeDetectorRef.markForCheck();
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
      fragment: event.nextId.toString()
    });

    this.activeTab = event.nextId;

    // Cancel any ongoing request by bumping the request id.
    this._currentRequestId++;

    this._page = 1;
    this._next = null;
    this.items = null;

    this.utilsService.delay(100).subscribe(() => {
      this._loadData().subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
      this.changeDetectorRef.markForCheck();
    });
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
      fromEvent(this.windowRefService.nativeWindow, "scroll").pipe(
        auditTime(250),
        takeUntil(this.destroyed$)
      ).subscribe(() => {
        this._onScroll();
        this.changeDetectorRef.markForCheck();
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
      this.changeDetectorRef.markForCheck();
    });

    doInit();
  }

  private _loadData(): Observable<(IotdArchiveInterface | TopPickArchiveInterface | TopPickNominationArchiveInterface)[]> {
    if (this._page === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    return new Observable(subscriber => {
      const requestId = ++this._currentRequestId;

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

      api.subscribe(response => {
        this.loading = false;
        this.loadingMore = false;

        // Only process the response if this request is still current.
        if (requestId !== this._currentRequestId) {
          return;
        }

        this._next = response.next;

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

        // Ensure the new items are rendered
        this.changeDetectorRef.detectChanges();

        subscriber.next(response.results);
        subscriber.complete();
      });
    });
  }

  private _onScroll() {
    if (
      this._isBrowser &&
      // If the element is not visible, don't load more.
      this.elementRef.nativeElement.querySelector('.tab-pane.active').offsetHeight !== 0 &&
      this.utilsService.isNearBottom(this.windowRefService, this.elementRef) &&
      !!this._next &&
      !this.loading &&
      !this.loadingMore
    ) {
      this._page++;
      this._loadData().subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
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
          this._next === null
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
          this.changeDetectorRef.markForCheck();
        });
      });
  }
}
