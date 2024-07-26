import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "astrobin-search-page",
  templateUrl: "./search.page.component.html",
  styleUrls: ["./search.page.component.scss"]
})
export class SearchPageComponent extends BaseComponentDirective implements OnInit {
  model: SearchModelInterface = {};

  constructor(
    public readonly store$: Store<MainState>,
    public readonly location: Location,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    const params = this.activatedRoute.snapshot.queryParams["p"];
    if (params) {
      try {
        const decompressedParams = UtilsService.decompressQueryString(params);
        const parsedParams = UtilsService.parseQueryString(decodeURIComponent(decompressedParams));

        // Convert JSON strings back to objects where applicable
        Object.keys(parsedParams).forEach(key => {
          if (typeof parsedParams[key] === "string") {
            try {
              parsedParams[key] = JSON.parse(parsedParams[key]);
            } catch (error) {
              // If JSON parsing fails, keep the value as string
            }
          }
        });

        this.model = {
          ...parsedParams,
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
  }

  updateUrl(): void {
    const { page, pageSize, ...model } = this.model;
    const queryString = UtilsService.toQueryString(model);
    const compressedQueryString = UtilsService.compressQueryString(queryString);
    const encodedQueryString = encodeURIComponent(compressedQueryString);

    this.location.go(`/search?p=${encodedQueryString}`);
  }
}
