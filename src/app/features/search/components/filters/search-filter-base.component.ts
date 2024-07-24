import { Component } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-search-filter-base",
  template: ""
})
export abstract class SearchFilterBaseComponent extends BaseComponentDirective {
}
