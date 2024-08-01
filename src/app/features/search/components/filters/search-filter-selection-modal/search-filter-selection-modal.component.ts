import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { SearchService } from "@features/search/services/search.service";
import { merge, Observable, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, startWith } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-search-filter-selection-modal",
  templateUrl: "./search-filter-selection-modal.component.html",
  styleUrls: ["./search-filter-selection-modal.component.scss"]
})
export class SearchFilterSelectionModalComponent extends BaseComponentDirective implements OnInit {
  public model: string;
  public labels: string[];
  public keys: string[];
  public focus$ = new Subject<string>();
  public click$ = new Subject<string>();

  @ViewChild("filterContainer", { read: ViewContainerRef })
  filterContainer: ViewContainerRef;

  public search: (text$: Observable<string>) => Observable<string[]>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly searchService: SearchService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.utilsService.delay(1).subscribe(() => {
      this.initializeSearch();
    });
  }

  initializeSearch(): void {
    this.search = (text$: Observable<string>): Observable<string[]> => {
      if (!this.filterContainer) {
        return of([]);
      }

      const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());

      // We only search for the filters that are possible to be selected here.
      const possibleFilters = this.searchService.allFiltersTypes.filter(
        filterType => !this.searchService.autoCompleteOnlyFiltersTypes.includes(filterType)
      );

      // In order to get the labels of filters that can be used, we need to instantiate them.
      const componentRefs = possibleFilters.map(filterType => {
        return this.searchService.instantiateFilterComponent(
          filterType,
          null,
          this.filterContainer
        );
      });

      this.labels = componentRefs.map(componentRef => componentRef.instance.label);
      this.keys = componentRefs.map(
        componentRefs => this.searchService.getKeyByFilterComponentType(componentRefs.componentType)
      );

      // Now that we have the labels, we don't need these anymore.
      componentRefs.forEach(componentRefs => componentRefs.destroy());

      return merge(debouncedText$, this.focus$, this.click$).pipe(
        startWith(""),
        map(term =>
          term === "" ? this.labels : this.labels.filter(label => label.toLowerCase().indexOf(term.toLowerCase()) > -1)
        )
      );
    };
  }

  onSelect(label: string) {
    const index = this.labels.indexOf(label);

    if (index === -1) {
      return;
    }

    const key = this.keys[index];
    const componentType = this.searchService.getFilterComponentTypeByKey(key);
    this.modal.close(componentType);
  }
}
