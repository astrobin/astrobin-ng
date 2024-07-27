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
import { SearchSubjectFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subject-filter.component";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";

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

  @ViewChild("temporaryFilterContainer", { read: ViewContainerRef })
  temporaryFilterContainer: ViewContainerRef;

  @ViewChildren("autoCompleteItem")
  autoCompleteItemsRefs!: QueryList<ElementRef>;

  @Input()
  model: SearchModelInterface = {};

  @Output()
  modelChanged = new EventEmitter<SearchModelInterface>();

  private _modelChanged: Subject<string> = new Subject<string>();
  private _filterComponentRefs: ComponentRef<SearchFilterComponentInterface>[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._modelChanged
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(value => {
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
      const filterComponentType = this.searchService.getFilterComponentTypeByKey(key);
      if (filterComponentType) {
        this.addFilter(filterComponentType, this.model[key]);
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

    this.selectedAutoCompleteItemIndex =
      this.selectedAutoCompleteItemIndex === -1
        ? 0
        : (this.selectedAutoCompleteItemIndex + 1) % this.autoCompleteItems.length;

    this.scrollToSelectedItem();
  }

  selectPreviousAutoCompleteItem(): void {
    if (this.autoCompleteItems.length === 0) {
      return;
    }

    this.selectedAutoCompleteItemIndex =
      this.selectedAutoCompleteItemIndex === -1
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

  onAutoCompleteItemClicked(autoCompleteItem: SearchAutoCompleteItem): void {
    this.addFilter(this.searchService.getFilterComponentTypeByKey(autoCompleteItem.type), autoCompleteItem.value);
  }

  addFilter(filterComponentType: Type<SearchFilterComponentInterface>, value: any): void {
    const componentRef = this.searchService.instantiateFilterComponent(filterComponentType, value, this.filterContainer);
    const key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);

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

  removeFilter(componentRef: ComponentRef<SearchFilterComponentInterface>): void {
    const index = this._filterComponentRefs.indexOf(componentRef);
    if (index !== -1) {
      this._filterComponentRefs.splice(index, 1);
    }

    const key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);
    delete this.model[key];

    componentRef.destroy();
    this.onSearch(this.model);
  }

  onFilterSelectionClicked(event: Event): void {
    event.preventDefault();

    const modalRef = this.modalService.open(SearchFilterSelectionModalComponent);
    modalRef.closed.subscribe((componentType: Type<SearchBaseFilterComponent>) => {
      const key: string = this.searchService.getKeyByFilterComponentType(componentType);
      let componentRef: ComponentRef<any> = this._filterComponentRefs.find(
        componentRef => this.searchService.getKeyByFilterComponentType(componentRef.componentType) === key
      );
      const alreadyPresent: boolean = !!componentRef;

      if (!alreadyPresent) {
        componentRef = this.searchService.instantiateFilterComponent(
          componentType,
          null,
          this.temporaryFilterContainer
        );
      }

      componentRef.instance.edit();
      componentRef.instance.valueChanges.subscribe(value => {
        if (value) {
          if (!alreadyPresent) {
            componentRef.destroy();
            this.addFilter(componentType, value);
          }
        }
      });
    });
  }
}
