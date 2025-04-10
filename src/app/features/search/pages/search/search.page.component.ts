import type { Location } from "@angular/common";
import { isPlatformBrowser } from "@angular/common";
import { Component, HostListener, Inject, PLATFORM_ID, ViewChild } from "@angular/core";
import type { AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { ImageService } from "@core/services/image/image.service";
import type { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import type { TitleService } from "@core/services/title/title.service";
import type { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { distinctUntilChangedObj } from "@core/services/utils/utils.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { SearchType } from "@features/search/interfaces/search-model.interface";
import type { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import type { CookieService } from "ngx-cookie";
import { merge } from "rxjs";
import { filter, map, startWith, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-search-page",
  templateUrl: "./search.page.component.html",
  styleUrls: ["./search.page.component.scss"]
})
export class SearchPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("ad", { static: false, read: AdManagerComponent }) adManagerComponent: AdManagerComponent;
  model: SearchModelInterface = {
    text: {
      value: "",
      matchType: MatchType.ALL,
      onlySearchInTitlesAndDescriptions: this.searchService.isSimpleMode()
    },
    page: 1,
    pageSize: SearchService.DEFAULT_PAGE_SIZE
  };
  protected readonly SearchType = SearchType;
  protected allowAds: boolean;
  protected showAd: boolean;

  private readonly _isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly location: Location,
    public readonly activatedRoute: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly cookieService: CookieService,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super(store$);

    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.activatedRoute.snapshot.data.image) {
      this.imageService.setMetaTags(this.activatedRoute.snapshot.data.image);
    } else {
      this.titleService.setTitle(this.translateService.instant("Search"));
    }

    this.userSubscriptionService
      .displayAds$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allowAds => {
        this.allowAds = allowAds;
        this.showAd = allowAds && !this.activatedRoute.snapshot.data.image;
        this.changeDetectionRef.markForCheck();
      });

    this.imageViewerService.slideshowState$.pipe(takeUntil(this.destroyed$)).subscribe(isOpen => {
      this.showAd = this.allowAds && !isOpen;

      if (this.showAd && this.adManagerComponent) {
        this.utilsService.delay(100).subscribe(() => {
          this.adManagerComponent.refreshAd();
          this.changeDetectionRef.markForCheck();
        });
      }
    });

    merge(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute.snapshot.queryParams)
      ),
      this.activatedRoute.queryParams.pipe(startWith(this.activatedRoute.snapshot.queryParams))
    )
      .pipe(takeUntil(this.destroyed$), distinctUntilChangedObj())
      .subscribe((queryParams: Record<string, string>) => {
        this.loadModel(queryParams);
        this.changeDetectionRef.markForCheck();
      });
  }

  ngAfterViewInit() {
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute);
  }

  ngOnDestroy() {
    if (this.adManagerComponent) {
      this.adManagerComponent.destroyAd();
    }

    super.ngOnDestroy();
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event: PopStateEvent): void {
    if (!this._isBrowser) {
      return;
    }

    const queryParams = this.windowRefService.nativeWindow.location.search;
    const isImage = queryParams.includes("i=");

    if (isImage) {
      event.preventDefault();
      return;
    }

    if (this.adManagerComponent) {
      this.adManagerComponent.refreshAd();
    }
  }

  loadModel(queryParams: Record<string, string> = {}): void {
    const params = queryParams["p"];
    if (params) {
      try {
        const parsedParams = this.searchService.paramsToModel(params);

        this.model = {
          ...parsedParams,
          text: {
            value: parsedParams.text?.value || "",
            matchType: parsedParams.text?.matchType || MatchType.ALL,
            onlySearchInTitlesAndDescriptions:
              parsedParams.text?.onlySearchInTitlesAndDescriptions || this.searchService.isSimpleMode()
          },
          page: 1
        };
      } catch (e) {
        this.model = {
          text: {
            value: "",
            matchType: MatchType.ALL,
            onlySearchInTitlesAndDescriptions: this.searchService.isSimpleMode()
          },
          page: 1,
          pageSize: SearchService.DEFAULT_PAGE_SIZE
        };
      }
    }
  }

  updateModel(model: SearchModelInterface): void {
    this.model = {
      ...model,
      page: 1
    };

    this.updateUrl();
  }

  updateUrl(): void {
    const currentUrlParams = decodeURIComponent(this.activatedRoute.snapshot.queryParams["p"]);
    const modelParams = decodeURIComponent(this.searchService.modelToParams(this.model));

    if (currentUrlParams === modelParams) {
      return;
    }

    const { page, pageSize, ...model } = this.model;

    if (
      Object.keys(model).filter(key => key !== "text" && key !== "ordering" && key !== "searchType").length > 0 ||
      (Object.keys(model).length === 1 && model.hasOwnProperty("text") && model.text?.value !== "") ||
      (model.hasOwnProperty("ordering") && model.ordering !== null && model.ordering !== "relevance") ||
      (model.hasOwnProperty("searchType") && model.searchType !== null && model.searchType !== SearchType.IMAGE)
    ) {
      this.windowRefService.pushState({}, `/search?p=${this.searchService.modelToParams(model)}`);
    } else {
      this.windowRefService.pushState({}, `/search`);
    }
  }
}
