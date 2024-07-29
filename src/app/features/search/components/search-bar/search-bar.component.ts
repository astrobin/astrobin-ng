import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
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
import {
  SearchAutoCompleteItem,
  SearchAutoCompleteType,
  SearchService
} from "@features/search/services/search.service";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { forkJoin, Subject } from "rxjs";
import { SearchSubjectFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subject-filter.component";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchTelescopeTypeFilterComponent } from "@features/search/components/filters/search-telescope-type-filter/search-telescope-type-filter.component";
import { SearchCameraTypeFilterComponent } from "@features/search/components/filters/search-camera-type-filter/search-camera-type-filter.component";
import { SearchAcquisitionMonthsFilterComponent } from "@features/search/components/filters/search-acquisition-months-filter/search-acquisition-months-filter.component";
import { SearchRemoteSourceFilterComponent } from "@features/search/components/filters/search-remote-source-filter/search-remote-source-filter.component";
import { SearchSubjectTypeFilterComponent } from "@features/search/components/filters/search-subject-type-filter/search-subject-type-filter.component";

type SearchAutoCompleteGroups = {
  [key in SearchAutoCompleteType]?: SearchAutoCompleteItem[];
};

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  autoCompleteGroups: SearchAutoCompleteGroups = {};
  selectedAutoCompleteGroup: SearchAutoCompleteType = null;
  selectedAutoCompleteItemIndex = -1;
  filterComponentRefs: ComponentRef<SearchFilterComponentInterface>[] = [];

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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly modalService: NgbModal,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._modelChanged
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(value => {
        this.selectedAutoCompleteGroup = null;
        this.selectedAutoCompleteItemIndex = -1;

        if (value && value.length >= 2) {
          const query = this.model.text;

          forkJoin(
            [
              {
                key: SearchTelescopeFilterComponent.key,
                method: this.searchService.autoCompleteTelescopes$(query)
              },
              {
                key: SearchCameraFilterComponent.key,
                method: this.searchService.autoCompleteCameras$(query)
              },
              {
                key: SearchSubjectFilterComponent.key,
                method: this.searchService.autoCompleteSubjects$(query)
              },
              {
                key: SearchTelescopeTypeFilterComponent.key,
                method: this.searchService.autoCompleteTelescopeTypes$(query)
              },
              {
                key: SearchCameraTypeFilterComponent.key,
                method: this.searchService.autoCompleteCameraTypes$(query)
              },
              {
                key: SearchAcquisitionMonthsFilterComponent.key,
                method: this.searchService.autoCompleteMonths$(query)
              },
              {
                key: SearchRemoteSourceFilterComponent.key,
                method: this.searchService.autoCompleteRemoteSources$(query)
              },
              {
                key: SearchSubjectTypeFilterComponent.key,
                method: this.searchService.autoCompleteSubjectTypes$(query)
              }
            ]
              .filter(filter => !this.model.hasOwnProperty(filter.key))
              .map(filter => filter.method)
          ).subscribe((results: SearchAutoCompleteItem[][]) => {
            const newAutoCompleteGroups: SearchAutoCompleteGroups = {};

            // Populate newAutoCompleteGroups with non-empty groups
            results.forEach(group => {
              if (group.length) {
                const type = group[0].type;
                newAutoCompleteGroups[type] = group;
              }
            });

            // Remove keys that are no longer present
            for (const key in this.autoCompleteGroups) {
              if (!(key in newAutoCompleteGroups)) {
                delete this.autoCompleteGroups[key];
              }
            }

            // Update autoCompleteGroups with new groups
            Object.assign(this.autoCompleteGroups, newAutoCompleteGroups);

            // Trigger change detection
            this.autoCompleteGroups = { ...this.autoCompleteGroups };
          });
        }
      });
  }

  ngAfterViewInit(): void {
    this.initializeFilters();
  }

  getGroupOrder(): SearchAutoCompleteType[] {
    return Object.keys(this.autoCompleteGroups) as SearchAutoCompleteType[];
  }

  getItemCountInGroup(group: SearchAutoCompleteType): number {
    return this.autoCompleteGroups[group]?.length || 0;
  }

  isMobileDevice(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth < 768;
    }

    return false;
  }

  hasAutoCompleteItems(): boolean {
    return Object.keys(this.autoCompleteGroups).length > 0;
  }

  @HostListener("window:keyup.arrowDown", ["$event"])
  selectNextAutoCompleteItem(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event) {
      event.preventDefault();
      const groupOrder = this.getGroupOrder();
      const currentGroupIndex = groupOrder.indexOf(this.selectedAutoCompleteGroup);
      const currentGroup = this.selectedAutoCompleteGroup || groupOrder[0];
      const currentItemCount = this.getItemCountInGroup(currentGroup);

      if (this.selectedAutoCompleteGroup === null) {
        this.selectedAutoCompleteGroup = groupOrder[0];
        this.selectedAutoCompleteItemIndex = 0;
      } else if (this.selectedAutoCompleteItemIndex < currentItemCount - 1) {
        this.selectedAutoCompleteItemIndex++;
      } else if (currentGroupIndex < groupOrder.length - 1) {
        const nextGroupIndex = (currentGroupIndex + 1) % groupOrder.length;
        this.selectedAutoCompleteGroup = groupOrder[nextGroupIndex];
        this.selectedAutoCompleteItemIndex = 0;
      }
      this.scrollToSelectedItem();
    }
  }

  @HostListener("window:keyup.arrowUp", ["$event"])
  selectPreviousAutoCompleteItem(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event) {
      event.preventDefault();
      const groupOrder = this.getGroupOrder();
      const currentGroupIndex = groupOrder.indexOf(this.selectedAutoCompleteGroup);

      if (this.selectedAutoCompleteGroup === null) {
        this.selectedAutoCompleteGroup = groupOrder[0];
        this.selectedAutoCompleteItemIndex = this.getItemCountInGroup(groupOrder[0]) - 1;
      } else if (this.selectedAutoCompleteItemIndex > 0) {
        this.selectedAutoCompleteItemIndex--;
      } else if (currentGroupIndex > 0) {
        const previousGroupIndex = (currentGroupIndex - 1 + groupOrder.length) % groupOrder.length;
        const previousGroup = groupOrder[previousGroupIndex];
        this.selectedAutoCompleteGroup = previousGroup;
        this.selectedAutoCompleteItemIndex = this.getItemCountInGroup(previousGroup) - 1;
      }
      this.scrollToSelectedItem();
    }
  }

  @HostListener("window:keyup.arrowLeft", ["$event"])
  selectPreviousAutoCompleteGroup(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event && !this.isMobileDevice()) {
      event.preventDefault();
      const groupOrder = this.getGroupOrder();
      const currentGroupIndex = groupOrder.indexOf(this.selectedAutoCompleteGroup);

      if (currentGroupIndex > 0) {
        const previousGroupIndex = (currentGroupIndex - 1 + groupOrder.length) % groupOrder.length;
        this.selectedAutoCompleteGroup = groupOrder[previousGroupIndex];
        this.selectedAutoCompleteItemIndex = 0;
        this.scrollToSelectedItem();
      }
    }
  }

  @HostListener("window:keyup.arrowRight", ["$event"])
  selectNextAutoCompleteGroup(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event && !this.isMobileDevice()) {
      event.preventDefault();
      const groupOrder = this.getGroupOrder();
      const currentGroupIndex = groupOrder.indexOf(this.selectedAutoCompleteGroup);

      if (currentGroupIndex < groupOrder.length - 1) {
        const nextGroupIndex = (currentGroupIndex + 1) % groupOrder.length;
        this.selectedAutoCompleteGroup = groupOrder[nextGroupIndex];
        this.selectedAutoCompleteItemIndex = 0;
        this.scrollToSelectedItem();
      }
    }
  }

  @HostListener("window:keyup.enter", ["$event"])
  onEnter(): void {
    if (this.selectedAutoCompleteGroup && this.selectedAutoCompleteItemIndex > -1) {
      const selectedItem = this.autoCompleteGroups[this.selectedAutoCompleteGroup][this.selectedAutoCompleteItemIndex];
      if (selectedItem) {
        this.onAutoCompleteItemClicked(selectedItem);
        return;
      }
    }
    this.onSearch(this.model);
  }

  onBackspace(): void {
    if (this.model.text === "") {
      const lastFilterRef = this.filterComponentRefs.pop();
      if (lastFilterRef) {
        this.removeFilter(lastFilterRef);
      }
    }
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
    this.autoCompleteGroups = {};
    this.selectedAutoCompleteGroup = null;
    this.selectedAutoCompleteItemIndex = -1;
  }

  onSearch(model: SearchModelInterface): void {
    this.resetAutoCompleteItems();
    this.modelChanged.emit(model);
  }

  findSelectedAutoCompleteItem(): ElementRef | undefined {
    if (this.autoCompleteItemsRefs) {
      const autoCompleteItemsArray = this.autoCompleteItemsRefs.toArray();
      return autoCompleteItemsArray.find((elementRef, index) => {
        const item = this.autoCompleteGroups[this.selectedAutoCompleteGroup][index];
        return (
          this.selectedAutoCompleteGroup !== null &&
          item.type === this.selectedAutoCompleteGroup &&
          index === this.selectedAutoCompleteItemIndex
        );
      });
    }
    return undefined;
  }

  scrollToSelectedItem(): void {
    const selectedElementRef = this.findSelectedAutoCompleteItem();
    if (selectedElementRef) {
      selectedElementRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  onAutoCompleteItemClicked(autoCompleteItem: SearchAutoCompleteItem): void {
    this.addFilter(this.searchService.getFilterComponentTypeByKey(autoCompleteItem.type), autoCompleteItem.value);
  }

  addFilter(filterComponentType: Type<SearchFilterComponentInterface>, value: any): void {
    const componentRef = this.searchService.instantiateFilterComponent(
      filterComponentType,
      value,
      this.filterContainer
    );
    const key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);

    this.filterComponentRefs.push(componentRef);

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
    const index = this.filterComponentRefs.indexOf(componentRef);
    if (index !== -1) {
      this.filterComponentRefs.splice(index, 1);
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
      let componentRef: ComponentRef<any> = this.filterComponentRefs.find(
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
