import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchAutoCompleteItem, SearchService } from "@features/search/services/search.service";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { forkJoin, Observable } from "rxjs";
import { DynamicSearchFilterLoaderService } from "@features/search/services/dynamic-search-filter-loader.service";
import { SearchSubjectFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subject-filter.component";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  searchControl = new FormControl();
  autoCompleteItems: SearchAutoCompleteItem[] = [];
  selectedAutoCompleteItemIndex = -1;

  @ViewChild("searchInput")
  searchInput: ElementRef;

  @ViewChild("filterContainer", { read: ViewContainerRef })
  filterContainer: ViewContainerRef;

  @ViewChildren("autoCompleteItem")
  autoCompleteItemsRefs!: QueryList<ElementRef>;

  @Input()
  model: SearchModelInterface = {};

  @Output()
  modelChanged = new EventEmitter<SearchModelInterface>();

  private _filterComponentRefs: ComponentRef<SearchBaseFilterComponent>[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly dynamicSearchFilterLoaderService: DynamicSearchFilterLoaderService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      this.selectedAutoCompleteItemIndex = -1;

      if (value && value.length > 0) {
        let observables$: Observable<SearchAutoCompleteItem[]>[] = [];

        // Only allow one instance of this filter.
        if (!this.model.hasOwnProperty("subject")) {
          observables$ = [
            ...observables$, this.searchService.autoCompleteSubjects$(this.searchControl.value)
          ];
        }

        forkJoin(observables$).subscribe(results => {
          this.autoCompleteItems = [].concat(...results);
        });
      } else {
        this.autoCompleteItems = [];
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeFilters();
  }

  initializeFilters(): void {
    Object.keys(this.model).forEach(key => {
      const filterComponent = this.getFilterComponent(key);
      if (filterComponent) {
        this.addFilter(key, this.model[key], filterComponent);
      }
    });
  }

  resetAutoCompleteItems(): void {
    this.autoCompleteItems = [];
    this.selectedAutoCompleteItemIndex = -1;
  }

  onSearch(model: SearchModelInterface): void {
    this.resetAutoCompleteItems();
    this.modelChanged.emit(model);
  }

  selectNextAutoCompleteItem(): void {
    if (this.autoCompleteItems.length === 0) {
      return;
    }

    this.selectedAutoCompleteItemIndex = this.selectedAutoCompleteItemIndex === -1
      ? 0
      : (this.selectedAutoCompleteItemIndex + 1) % this.autoCompleteItems.length;

    this.scrollToSelectedItem();
  }

  selectPreviousAutoCompleteItem(): void {
    if (this.autoCompleteItems.length === 0) {
      return;
    }

    this.selectedAutoCompleteItemIndex = this.selectedAutoCompleteItemIndex === -1
      ? this.autoCompleteItems.length - 1
      : (this.selectedAutoCompleteItemIndex - 1 + this.autoCompleteItems.length) % this.autoCompleteItems.length;

    this.scrollToSelectedItem();
  }

  onEnter(): void {
    if (this.autoCompleteItems.length > 0) {
      const selectedItem = this.autoCompleteItems[this.selectedAutoCompleteItemIndex];
      if (selectedItem) {
        this.onAutoCompleteItemClicked(selectedItem);
      }
    } else {
      this.onSearch(this.model);
    }
  }

  onBackspace(): void {
    if (this.searchControl.value === "") {
      const lastFilterRef = this._filterComponentRefs.pop();
      if (lastFilterRef) {
        this.removeFilter(lastFilterRef);
      }
    }
  }

  scrollToSelectedItem(): void {
    if (this.selectedAutoCompleteItemIndex !== -1 && this.autoCompleteItemsRefs.length > 0) {
      const selectedItem = this.autoCompleteItemsRefs.toArray()[this.selectedAutoCompleteItemIndex];
      if (selectedItem) {
        selectedItem.nativeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  onAutoCompleteItemClicked(item: SearchAutoCompleteItem): void {
    this.addFilter(item.type, item.label, this.getFilterComponent(item.type));
  }

  getFilterComponent(key: string): any {
    const filterComponents = [
      SearchSubjectFilterComponent
      // Add more filters here
    ];

    return filterComponents.find(component => component.keys.includes(key));
  }

  addFilter(key: string, value: string, component: any): void {
    const componentRef = this.dynamicSearchFilterLoaderService.loadComponent(
      this.filterContainer,
      component,
      value,
      { [key]: value }
    );

    this._filterComponentRefs.push(componentRef);

    componentRef.instance.valueChanges.subscribe(filterValue => {
      this.model = {
        ...this.model,
        ...filterValue
      };
      this.onSearch(this.model);
    });

    componentRef.instance.remove.subscribe(() => {
      this.removeFilter(componentRef);
    });

    this.searchControl.setValue("");
    this.resetAutoCompleteItems();
    this.searchInput.nativeElement.focus();
  }

  removeFilter(componentRef: ComponentRef<SearchBaseFilterComponent>): void {
    const index = this._filterComponentRefs.indexOf(componentRef);
    if (index !== -1) {
      this._filterComponentRefs.splice(index, 1);
    }

    Object.keys(componentRef.instance.value).forEach(key => {
      delete this.model[key];
    });

    componentRef.destroy();
    this.onSearch(this.model);
  }

}
