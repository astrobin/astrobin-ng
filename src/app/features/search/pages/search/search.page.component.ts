import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { isPlatformBrowser, Location } from "@angular/common";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface, SearchType } from "@features/search/interfaces/search-model.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchService } from "@features/search/services/search.service";
import { filter, map, startWith, take, takeUntil } from "rxjs/operators";
import { merge } from "rxjs";
import { distinctUntilChangedObj, UtilsService } from "@shared/services/utils/utils.service";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-search-page",
  templateUrl: "./search.page.component.html",
  styleUrls: ["./search.page.component.scss"]
})
export class SearchPageComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  readonly SearchType = SearchType;

  @ViewChild("ad", { static: false, read: AdManagerComponent }) adManagerComponent: AdManagerComponent;

  model: SearchModelInterface = {
    text: {
      value: "",
      matchType: undefined
    },
    page: 1,
    pageSize: SearchService.DEFAULT_PAGE_SIZE
  };

  protected allowAds: boolean;
  protected showAd: boolean;

  private _isBrowser: boolean;

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
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);

    this._isBrowser = isPlatformBrowser(platformId);

    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      this.imageViewerService.autoOpenSlideshow(this.componentId, activatedRoute);
    });
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.activatedRoute.snapshot.data.image) {
      this.imageService.setMetaTags(this.activatedRoute.snapshot.data.image);
    } else {
      this.titleService.setTitle(this.translateService.instant("Search"));
    }

    this.userSubscriptionService.displayAds$().pipe(
      takeUntil(this.destroyed$)
    ).subscribe(allowAds => {
      this.allowAds = allowAds;
      this.showAd = allowAds && !this.activatedRoute.snapshot.data.image;
    });

    this.imageViewerService.slideshowState$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isOpen => {
        this.showAd = this.allowAds && !isOpen;

        if (!this.showAd && this.adManagerComponent) {
        } else if (this.showAd && this.adManagerComponent) {
          this.utilsService.delay(100).subscribe(() => {
            this.adManagerComponent.refreshAd();
          });
        }
      });

    merge(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute.snapshot.queryParams)
      ),
      this.activatedRoute.queryParams.pipe(
        startWith(this.activatedRoute.snapshot.queryParams)
      )
    ).pipe(
      takeUntil(this.destroyed$),
      distinctUntilChangedObj()
    ).subscribe((queryParams: Record<string, string>) => {
      this.loadModel(queryParams);
    });
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
            matchType: parsedParams.text?.matchType
          },
          page: 1
        };
      } catch (e) {
        this.model = {
          text: {
            value: "",
            matchType: undefined
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
      Object.keys(model).filter(key =>
        key !== "text" &&
        key !== "ordering" &&
        key !== "searchType"
      ).length > 0 ||
      (
        Object.keys(model).length === 1 &&
        model.hasOwnProperty("text") &&
        model.text?.value !== ""
      ) ||
      (
        model.hasOwnProperty("ordering") &&
        model.ordering !== null &&
        model.ordering !== "relevance"
      ) ||
      (
        model.hasOwnProperty("searchType") &&
        model.searchType !== null &&
        model.searchType !== SearchType.IMAGE
      )
    ) {
      this.windowRefService.pushState(
        {},
        `/search?p=${this.searchService.modelToParams(model)}`
      );
    } else {
      this.windowRefService.pushState(
        {},
        `/search`
      );
    }
  }
}
