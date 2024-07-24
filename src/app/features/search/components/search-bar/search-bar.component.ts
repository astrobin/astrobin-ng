import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchService } from "@features/search/services/search.service";

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit {
  model: SearchModelInterface = {};

  @Output()
  modelChanged = new EventEmitter<SearchModelInterface>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  onSearch(): void {
    this.modelChanged.emit(this.model);
  }
}
