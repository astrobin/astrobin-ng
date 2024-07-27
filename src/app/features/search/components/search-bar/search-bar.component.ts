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
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchAutoCompleteItem, SearchService } from "@features/search/services/search.service";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { forkJoin, Observable, Subject } from "rxjs";
import { DynamicSearchFilterLoaderService } from "@features/search/services/dynamic-search-filter-loader.service";
import { SearchSubjectFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subject-filter.component";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
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

  private _modelChanged: Subject<string> = new Subject<string>();
  private _filterComponentRefs: ComponentRef<SearchBaseFilterComponent>[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly dynamicSearchFilterLoaderService: DynamicSearchFilterLoaderService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._modelChanged.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      this.selectedAutoCompleteItemIndex = -1;

      if (value && value.length > 0) {
        let observables$: Observable<SearchAutoCompleteItem[]>[] = [];

        if (!this.model.hasOwnProperty(SearchTelescopeFilterComponent.key)) {
          observables$.push(this.searchService.autoCompleteTelescopes$(this.model.text));
        }

        if (!this.model.hasOwnProperty(SearchCameraFilterComponent.key)) {
          observables$.push(this.searchService.autoCompleteCameras$(this.model.text));
        }

        if (!this.model.hasOwnProperty(SearchSubjectFilterComponent.key)) {
          observables$.push(this.searchService.autoCompleteSubjects$(this.model.text));
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

  onModelChangeDebounced(value: string): void {
    this._modelChanged.next(value);
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
        return;
      }
    }
    this.onSearch(this.model);
  }

  onBackspace(): void {
    if (this.model.text === "") {
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
    this.addFilter(item.type, item.value, this.getFilterComponent(item.type));
  }

  getFilterComponent(key: string): any {
    return Object.values(this.searchService.allFilters).find(componentType => {
      const componentClass = componentType as unknown as typeof SearchBaseFilterComponent;
      return componentClass.key === key;
    });
  }

  instantiateFilterComponent(
    key: string, value: any, componentType: Type<SearchBaseFilterComponent>
  ): ComponentRef<SearchBaseFilterComponent> {
    return this.dynamicSearchFilterLoaderService.loadComponent(
      this.filterContainer,
      componentType,
      this.searchService.getLabelForFilterType(componentType),
      value
    );
  }

  addFilter(key: string, value: any, componentType: Type<SearchBaseFilterComponent>): void {
    const componentRef = this.instantiateFilterComponent(key, value, componentType);

    this._filterComponentRefs.push(componentRef);

    componentRef.instance.valueChanges.subscribe(filterValue => {
      this.model = {
        ...this.model,
        ...{
          [key]: filterValue
        }
      };
      this.onSearch(this.model);
    });

    componentRef.instance.remove.subscribe(() => {
      this.removeFilter(componentRef);
    });

    this.model = {
      ...this.model,
      text: ""
    };
    this.resetAutoCompleteItems();
    this.searchInput.nativeElement.focus();
  }

  removeFilter(componentRef: ComponentRef<SearchBaseFilterComponent>): void {
    const index = this._filterComponentRefs.indexOf(componentRef);
    if (index !== -1) {
      this._filterComponentRefs.splice(index, 1);
    }

    const key = (componentRef.instance.constructor as any).key;
    delete this.model[key];

    componentRef.destroy();
    this.onSearch(this.model);
  }

  onFilterSelectionClicked(event: Event): void {
    event.preventDefault();

    const modalRef = this.modalService.open(SearchFilterSelectionModalComponent);
    modalRef.closed.subscribe((componentType: Type<SearchBaseFilterComponent>) => {
      const componentClass = componentType as unknown as typeof SearchBaseFilterComponent;
      const key = componentClass.key;

      if (
        this._filterComponentRefs.filter(
          componentRef => (componentRef.instance.constructor as any).key === key
        ).length
      ) {
        return;
      }

      const componentRef = this.instantiateFilterComponent(key, null, componentType);
      componentRef.instance.edit();
      componentRef.instance.valueChanges.subscribe(value => {
        if (value) {
          componentRef.destroy();
          this.addFilter(key, value, componentType);
        }
      });
    });
  }
}
