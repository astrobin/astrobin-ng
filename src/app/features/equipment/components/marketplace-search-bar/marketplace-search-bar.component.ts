import type { OnInit } from "@angular/core";
import { Component, EventEmitter, Output } from "@angular/core";
import type { ActivatedRoute } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-search-bar",
  templateUrl: "./marketplace-search-bar.component.html",
  styleUrls: ["./marketplace-search-bar.component.scss"]
})
export class MarketplaceSearchBarComponent extends BaseComponentDirective implements OnInit {
  @Output()
  search = new EventEmitter<MarketplaceFilterModel>();

  query: string;

  constructor(public readonly store$: Store<MainState>, public readonly activatedRoute: ActivatedRoute) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.activatedRoute.queryParams.subscribe(params => {
      this.query = params.query || "";
    });
  }

  onInputEnter(event: Event) {
    event.preventDefault();
    this.search.emit({
      query: (event.target as HTMLInputElement).value
    });
  }
}
