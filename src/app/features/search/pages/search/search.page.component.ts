import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";

@Component({
  selector: "astrobin-search-page",
  templateUrl: "./search.page.component.html",
  styleUrls: ["./search.page.component.scss"]
})
export class SearchPageComponent extends BaseComponentDirective implements OnInit {
  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }
}
