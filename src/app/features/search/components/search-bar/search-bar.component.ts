import { AfterViewInit, Component, ComponentRef, ElementRef, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, QueryList, SimpleChanges, Type, ViewChild, ViewChildren, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface, SearchType } from "@features/search/interfaces/search-model.interface";
import { SearchAutoCompleteItem, SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
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
import { SearchAcquisitionTypeFilterComponent } from "@features/search/components/filters/search-acquisition-type-filter/search-acquisition-type-filter.component";
import { SearchColorOrMonoFilterComponent } from "@features/search/components/filters/search-color-or-mono-filter/search-color-or-mono-filter.component";
import { SearchModifiedCameraFilterComponent } from "@features/search/components/filters/search-modified-camera-filter/search-modified-camera-filter.component";
import { SearchAnimatedFilterComponent } from "@features/search/components/filters/search-animated-filter/search-animated-filter.component";
import { SearchVideoFilterComponent } from "@features/search/components/filters/search-video-filter/search-video-filter.component";
import { SearchAwardFilterComponent } from "@features/search/components/filters/search-award-filter/search-award-filter.component";
import { SearchCountryFilterComponent } from "@features/search/components/filters/search-country-filter/search-country-filter.component";
import { UtilsService } from "@shared/services/utils/utils.service";
import { SearchDataSourceFilterComponent } from "@features/search/components/filters/search-data-source-filter/search-data-source-filter.component";
import { SearchMinimumDataFilterComponent } from "@features/search/components/filters/search-minimum-data-filter/search-minimum-data-filter.component";
import { SearchConstellationFilterComponent } from "@features/search/components/filters/search-constellation-filter/search-constellation-filter.component";
import { SearchBortleScaleFilterComponent } from "@features/search/components/filters/search-bortle-scale-filter/search-bortle-scale-filter.component";
import { SearchLicenseFilterComponent } from "@features/search/components/filters/search-license-filter/search-license-filter.component";
import { SearchFilterTypesFilterComponent } from "@features/search/components/filters/search-filter-types-filter/search-filter-types-filter.component";
import { DeviceService } from "@shared/services/device.service";
import { TranslateService } from "@ngx-translate/core";
import { SearchSubjectTypeFilterComponent } from "@features/search/components/filters/search-subject-type-filter/search-subject-type-filter.component";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { SearchPersonalFiltersFilterComponent } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.component";
import { LoadSaveSearchModalComponent } from "@features/search/components/filters/load-save-search-modal/load-save-search-modal.component";

type SearchAutoCompleteGroups = {
  [key in SearchAutoCompleteType]?: SearchAutoCompleteItem[];
};

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, OnChanges, AfterViewInit {
  readonly SearchType = SearchType;
  readonly placeholder = this.translateService.instant("Type here to search");
  autoCompleteGroups: SearchAutoCompleteGroups = {};
  selectedAutoCompleteGroup: SearchAutoCompleteType = null;
  abortAutoComplete = false;
  loadingAutoCompleteItems = false;
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
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._modelChanged.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(value => {
      if (this.model.searchType !== SearchType.IMAGE && this.model.searchType !== undefined) {
        return;
      }

      this.selectedAutoCompleteGroup = null;
      this.selectedAutoCompleteItemIndex = -1;
      this.abortAutoComplete = false;

      if (value && value.length >= 2) {
        const query = this.model.text;
        this.loadingAutoCompleteItems = true;

        forkJoin(
          this._autoCompleteMethods(query)
            .filter(filter => !this.model.hasOwnProperty(filter.key))
            .map(filter => filter.method)
        ).subscribe((results: SearchAutoCompleteItem[][]) => {
          if (this.abortAutoComplete) {
            this.loadingAutoCompleteItems = false;
            return;
          }

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

          this.loadingAutoCompleteItems = false;
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.model &&
      changes.model.currentValue &&
      JSON.stringify(changes.model.currentValue) !== JSON.stringify(changes.model.previousValue)
    ) {
      this.clearFilters();
      this.initializeFilters();
    }
  }

  ngAfterViewInit(): void {
    if (this.deviceService.isTouchEnabled()) {
      this.searchInput.nativeElement.blur();
    } else {
      this.searchInput.nativeElement.focus();
    }
  }

  getGroupOrder(): SearchAutoCompleteType[] {
    return Object.keys(this.autoCompleteGroups) as SearchAutoCompleteType[];
  }

  getItemCountInGroup(group: SearchAutoCompleteType): number {
    return this.autoCompleteGroups[group]?.length || 0;
  }

  hasAutoCompleteItems(): boolean {
    return Object.keys(this.autoCompleteGroups).length > 0;
  }

  @HostListener("window:keyup.arrowRight", ["$event"])
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

  @HostListener("window:keyup.arrowLeft", ["$event"])
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

  @HostListener("window:keyup.arrowUp", ["$event"])
  selectPreviousAutoCompleteGroup(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event && !this.deviceService.smMax()) {
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

  @HostListener("window:keyup.arrowDown", ["$event"])
  selectNextAutoCompleteGroup(event: KeyboardEvent) {
    if (isPlatformBrowser(this.platformId) && event && !this.deviceService.smMax()) {
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
  onEnter(event: KeyboardEvent): void {
    if (event.target !== this.searchInput.nativeElement) {
      return;
    }

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
    this.abortAutoComplete = true;
  }

  onSearch(model: SearchModelInterface): void {
    const normalizedQuery = model.text
      ? model.text.toLowerCase().replace(/\s/g, "")
      : null;

    if (model.text === "" && this.filterComponentRefs.length === 0) {
      model.ordering = null;
    }

    this.resetAutoCompleteItems();

    if (normalizedQuery && (model.searchType === SearchType.IMAGE || model.searchType === undefined)) {
      forkJoin(
        this._autoCompleteMethods(model.text)
          .filter(filter => !this.model.hasOwnProperty(filter.key))
          .map(filter => filter.method)
      ).subscribe((results: SearchAutoCompleteItem[][]) => {
        results.forEach(group => {
          group.forEach(item => {
            const normalizedLabel = item.label.toLowerCase().replace(/\s/g, "");
            if (normalizedLabel === normalizedQuery) {
              this.onAutoCompleteItemClicked(item);
              return;
            }
          });
        });
      });
    }

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
    this.searchService.allowFilter$(autoCompleteItem.minimumSubscription).subscribe(allow => {
      if (!allow) {
        const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        let minimumSubscription: SimplifiedSubscriptionName;

        switch (autoCompleteItem.minimumSubscription) {
          case PayableProductInterface.LITE:
            minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_LITE;
            break;
          case PayableProductInterface.PREMIUM:
            minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_PREMIUM;
            break;
          case PayableProductInterface.ULTIMATE:
            minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
            break;
        }

        modalRef.componentInstance.minimumSubscription = minimumSubscription;

        return;
      }

      let filterComponentType: Type<SearchFilterComponentInterface>;

      if (autoCompleteItem.type === SearchAutoCompleteType.SEARCH_FILTER) {
        filterComponentType = this.searchService.getFilterComponentTypeByKey(autoCompleteItem.value);
        this.createAndEditFilter(filterComponentType);
      } else {
        filterComponentType = this.searchService.getFilterComponentTypeByKey(autoCompleteItem.type);
        this.addFilter(filterComponentType, autoCompleteItem.value);
      }
    });
  }

  addFilter(filterComponentType: Type<SearchFilterComponentInterface>, value: any): void {
    this.utilsService.delay(1).subscribe(() => {
      const componentRef = this.searchService.instantiateFilterComponent(
        filterComponentType,
        value,
        this.filterContainer
      );
      const key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);

      this.filterComponentRefs.push(componentRef);

      componentRef.instance.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(filterValue => {
        if (componentRef.instance.hasValue()) {
          this.model = {
            ...this.model,
            ...{
              [key]: filterValue
            }
          };
        } else {
          this.removeFilter(componentRef);
        }

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
    });
  }

  clearFilters(): void {
    this.filterComponentRefs.forEach(componentRef => componentRef.destroy());
    this.filterComponentRefs = [];
  }

  removeFilter(componentRef: ComponentRef<SearchFilterComponentInterface>): void {
    this.utilsService.delay(1).subscribe(() => {
      const index = this.filterComponentRefs.indexOf(componentRef);
      if (index !== -1) {
        this.filterComponentRefs.splice(index, 1);
      }

      const key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);
      delete this.model[key];

      componentRef.destroy();
      this.searchInput.nativeElement.focus();
      this.onSearch(this.model);
    });
  }

  createAndEditFilter(filterComponentType: Type<SearchFilterComponentInterface>): void {
    this.utilsService.delay(1).subscribe(() => {
      const key: string = this.searchService.getKeyByFilterComponentType(filterComponentType);
      let componentRef: ComponentRef<any> = this.filterComponentRefs.find(
        componentRef => this.searchService.getKeyByFilterComponentType(componentRef.componentType) === key
      );
      const alreadyPresent: boolean = !!componentRef;

      if (!alreadyPresent) {
        componentRef = this.searchService.instantiateFilterComponent(
          filterComponentType,
          null,
          this.temporaryFilterContainer
        );
      }

      componentRef.instance.edit();
      componentRef.instance.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: any) => {
        const hasValue = componentRef.instance.hasValue();

        if (hasValue && !alreadyPresent) {
          componentRef.destroy();
          this.addFilter(filterComponentType, value);
        } else if (!hasValue && alreadyPresent) {
          this.removeFilter(componentRef);
        }
      });
    });
  }

  onFilterSelectionClicked(event: Event): void {
    event.preventDefault();

    const modalRef = this.modalService.open(SearchFilterSelectionModalComponent);
    modalRef.closed.subscribe((componentType: Type<SearchBaseFilterComponent>) => {
      this.createAndEditFilter(componentType);
    });
  }

  onLoadSaveClicked(event: Event): void {
    event.preventDefault();

    const modalRef = this.modalService.open(LoadSaveSearchModalComponent);
    const instance: LoadSaveSearchModalComponent = modalRef.componentInstance;
    instance.saveModel = {
      name: null,
      params: this.searchService.modelToParams(this.model)
    };
    modalRef.closed.subscribe((params: string) => {
      if (params) {
        this.model = this.searchService.paramsToModel(params);
        this.clearFilters();
        this.initializeFilters();
        this.onSearch(this.model);
      }
    });
  }

  onOrderingChanged(ordering: string): void {
    this.userSubscriptionService.isFree$().subscribe(isFree => {
      if (isFree) {
        const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        const instance: SubscriptionRequiredModalComponent = modalRef.componentInstance;
        instance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_LITE;
      } else {
        this.model = {
          ...this.model,
          ordering
        };

        this.onSearch(this.model);
      }
    });
  }

  getSearchTypeIcon(searchType: SearchType): IconProp {
    switch (searchType) {
      case SearchType.IMAGE:
        return "image";
      case SearchType.FORUM:
        return "comments";
      case SearchType.COMMENTS:
        return "comment-alt";
      default:
        return "image";
    }
  }

  onSearchTypeChanged(searchType: SearchType): void {
    this.model = {
      text: this.model.text,
      searchType,
      ordering: null,
      page: 1
    };

    this.resetAutoCompleteItems();
    this.filterComponentRefs.forEach(componentRef => componentRef.destroy());
    this.onSearch(this.model);
  }

  private _autoCompleteMethods = (query: string) => {
    return [
      {
        key: SearchAutoCompleteType.SEARCH_FILTER,
        method: this.searchService.autoCompleteSearchFilters$(query)
      },
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
      },
      {
        key: SearchColorOrMonoFilterComponent.key,
        method: this.searchService.autoCompleteColorOrMono$(query)
      },
      {
        key: SearchModifiedCameraFilterComponent.key,
        method: this.searchService.autoCompleteModifiedCamera$(query)
      },
      {
        key: SearchAnimatedFilterComponent.key,
        method: this.searchService.autoCompleteAnimated$(query)
      },
      {
        key: SearchVideoFilterComponent.key,
        method: this.searchService.autoCompleteVideos$(query)
      },
      {
        key: SearchAwardFilterComponent.key,
        method: this.searchService.autoCompleteAward$(query)
      },
      {
        key: SearchCountryFilterComponent.key,
        method: this.searchService.autoCompleteCountries$(query)
      },
      {
        key: SearchDataSourceFilterComponent.key,
        method: this.searchService.autoCompleteDataSources$(query)
      },
      {
        key: SearchMinimumDataFilterComponent.key,
        method: this.searchService.autoCompleteMinimumData$(query)
      },
      {
        key: SearchConstellationFilterComponent.key,
        method: this.searchService.autoCompleteConstellations$(query)
      },
      {
        key: SearchBortleScaleFilterComponent.key,
        method: this.searchService.autoCompleteBortleScale$(query)
      },
      {
        key: SearchLicenseFilterComponent.key,
        method: this.searchService.autoCompleteLicenseOptions$(query)
      },
      {
        key: SearchFilterTypesFilterComponent.key,
        method: this.searchService.autoCompleteFilterTypes$(query)
      },
      {
        key: SearchAcquisitionTypeFilterComponent.key,
        method: this.searchService.autoCompleteAcquisitionTypes$(query)
      },
      {
        key: SearchPersonalFiltersFilterComponent.key,
        method: this.searchService.autoCompletePersonalFilters$(query)
      }
    ];
  };
}
