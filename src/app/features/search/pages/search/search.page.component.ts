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

    this.model = {
      ...this.activatedRoute.snapshot.queryParams as SearchModelInterface,
      page: 1
    };
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
    this.location.go(`/search?${UtilsService.toQueryString(model)}`);
  }
}
