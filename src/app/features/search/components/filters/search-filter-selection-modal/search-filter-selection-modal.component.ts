import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { SearchService } from "@features/search/services/search.service";
import { merge, Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

@Component({
  selector: "astrobin-search-filter-selection-modal",
  templateUrl: "./search-filter-selection-modal.component.html",
  styleUrls: ["./search-filter-selection-modal.component.scss"]
})
export class SearchFilterSelectionModalComponent extends BaseComponentDirective implements OnInit {
  public model: string;
  public options = Object.entries(this.searchService.allFilters)
    .filter(([_, value]) => !this.searchService.autoCompleteOnlyFilters.includes(value))
    .map(([label, value]) => ({ label, value }));
  public focus$ = new Subject<string>();
  public click$ = new Subject<string>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly searchService: SearchService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());

    return merge(debouncedText$, this.focus$, this.click$).pipe(
      map(term =>
        term === ""
          ? this.options
          : this.options.filter(v => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1)
      ),
      map(options => options.map(option => option.label))
    );
  };

  onSelect(label: string) {
    const selectedOption = this.options.find(option => option.label === label);
    this.modal.close(selectedOption.value);
  }
}
