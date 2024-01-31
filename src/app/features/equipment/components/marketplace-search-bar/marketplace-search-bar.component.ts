import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "astrobin-marketplace-search-bar",
  templateUrl: "./marketplace-search-bar.component.html",
  styleUrls: ["./marketplace-search-bar.component.scss"]
})
export class MarketplaceSearchBarComponent extends BaseComponentDirective implements OnInit {
  @Output()
  search = new EventEmitter<MarketplaceFilterModel>();

  query: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly activatedRoute: ActivatedRoute
  ) {
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
