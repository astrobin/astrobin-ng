import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Location } from "@angular/common";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface, SearchType } from "@features/search/interfaces/search-model.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchService } from "@features/search/services/search.service";
import { filter, map, startWith, takeUntil } from "rxjs/operators";
import { merge } from "rxjs";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-search-page",
  templateUrl: "./search.page.component.html",
  styleUrls: ["./search.page.component.scss"]
})
export class SearchPageComponent extends BaseComponentDirective implements OnInit {
  readonly SearchType = SearchType;

  model: SearchModelInterface = {
    text: {
      value: "",
      matchType: undefined
    },
    page: 1,
    pageSize: 100
  };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly location: Location,
    public readonly activatedRoute: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

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

      if (queryParams["i"]) {
        this.imageViewerService.openImageViewer(
          queryParams["i"],
          queryParams["r"] || FINAL_REVISION_LABEL,
          this.activatedRoute.snapshot.fragment?.includes("fullscreen"),
          [],
          this.viewContainerRef
        );
      }
    });
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
          page: 1
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
    this.windowRefService.scroll({ top: 0 });
  }

  updateUrl(): void {
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
