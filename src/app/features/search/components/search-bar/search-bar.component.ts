import { AfterViewInit, Component, ComponentRef, ElementRef, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface, SearchType } from "@features/search/interfaces/search-model.interface";
import { SearchAutoCompleteItem, SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { concatMap, debounceTime, filter, map, takeUntil, tap } from "rxjs/operators";
import { forkJoin, from, Observable, Subject } from "rxjs";
import { SearchSubjectsFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subjects-filter.component";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchTelescopeTypesFilterComponent } from "@features/search/components/filters/search-telescope-types-filter/search-telescope-types-filter.component";
import { SearchCameraTypesFilterComponent } from "@features/search/components/filters/search-camera-types-filter/search-camera-types-filter.component";
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
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { SearchPersonalFiltersFilterComponent } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.component";
import { LoadSaveSearchModalComponent } from "@features/search/components/filters/load-save-search-modal/load-save-search-modal.component";
import { SearchTextFilterComponent } from "@features/search/components/filters/search-text-filter/search-text-filter.component";
import { MatchType } from "@features/search/enums/match-type.enum";
import { SearchMountFilterComponent } from "@features/search/components/filters/search-mount-filter/search-mount-filter.component";
import { SearchFilterFilterComponent } from "@features/search/components/filters/search-filter-filter/search-filter-filter.component";
import { SearchAccessoryFilterComponent } from "@features/search/components/filters/search-accessory-filter/search-accessory-filter.component";
import { SearchSoftwareFilterComponent } from "@features/search/components/filters/search-software-filter/search-software-filter.component";
import { SearchUsersFilterComponent } from "@features/search/components/filters/search-users-filter/search-users-filter.component";
import { NgModel } from "@angular/forms";

type SearchAutoCompleteGroups = {
  [key in SearchAutoCompleteType]?: SearchAutoCompleteItem[];
};

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild("searchInput", { static: false, read: ElementRef }) searchInputEl: ElementRef;
  @ViewChild("searchInput", { static: false, read: NgModel }) searchInputNgModel: NgModel;
  @ViewChild("filterContainer", { read: ViewContainerRef }) filterContainer: ViewContainerRef;
  @ViewChild("temporaryFilterContainer", { read: ViewContainerRef }) temporaryFilterContainer: ViewContainerRef;
  @ViewChild("tabOrEnterInformationOffcanvasTemplate") tabOrEnterInformationOffcanvasTemplate: TemplateRef<any>;
  @ViewChildren("autoCompleteItem") autoCompleteItemsRefs!: QueryList<ElementRef>;

  @Input() model: SearchModelInterface = {};

  @Output() modelChanged = new EventEmitter<SearchModelInterface>();

  protected readonly SearchType = SearchType;
  protected readonly SearchTextFilterComponent = SearchTextFilterComponent;
  protected readonly placeholder = this.translateService.instant("Type here to search");
  protected isTouchDevice = false;
  protected showAutoCompleteGroups = false;
  protected autoCompleteGroups: SearchAutoCompleteGroups = {};
  protected selectedAutoCompleteGroup: SearchAutoCompleteType = null;
  protected loadingAutoCompleteItems = false;
  protected selectedAutoCompleteItemIndex = -1;
  protected filterComponentRefs: ComponentRef<SearchFilterComponentInterface>[] = [];
  private _modelChanged: Subject<string> = new Subject<string>();
  private _abortAutoComplete = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly modalService: NgbModal,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly elementRef: ElementRef,
    public readonly offcanvasService: NgbOffcanvas
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.isTouchDevice = this.deviceService.isTouchEnabled();

    if (isPlatformBrowser(this.platformId) && this.windowRefService.nativeWindow.document?.addEventListener) {
      this.windowRefService.nativeWindow.document.addEventListener("click", this.onDocumentClick.bind(this));
    }

    this._modelChanged.pipe(
      debounceTime(200),
      filter(value => value && value.length > 2),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      if (this.model.searchType !== SearchType.IMAGE && this.model.searchType !== undefined) {
        return;
      }

      this.selectedAutoCompleteGroup = null;
      this.selectedAutoCompleteItemIndex = -1;
      this._abortAutoComplete = false;

      if (value && value.length > 0) {
        const query = this.model.text;
        this.loadingAutoCompleteItems = true;

        from(this._autoCompleteMethods(query?.value)).pipe(
          concatMap(filter =>
            filter.method.pipe(
              map(result => ({ key: filter.key, result }))
            )
          ),
          takeUntil(this.destroyed$)
        ).subscribe({
          next: ({ key, result }) => {
            if (this._abortAutoComplete) {
              this.loadingAutoCompleteItems = false;
              return;
            }

            if (result === null || result.length) {
              this.autoCompleteGroups[key] = result;
            } else {
              if (this.autoCompleteGroups[key] !== undefined) {
                delete this.autoCompleteGroups[key];
              }
            }

            this.autoCompleteGroups = { ...this.autoCompleteGroups };
          },
          error: error => {
            console.error("Error loading autocomplete items:", error);
            this.loadingAutoCompleteItems = false;
          },
          complete: () => {
            this.loadingAutoCompleteItems = false;
          }
        });
      }
    });

    if (this.searchService.searchComplete$) {
      this.searchService.searchComplete$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.resetAutoCompleteItems();
      });
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.model &&
      changes.model.currentValue &&
      JSON.stringify(changes.model.currentValue) !== JSON.stringify(changes.model.previousValue)
    ) {
      if (isPlatformBrowser(this.platformId)) {
        // No point of doing this on the server because the container ref will not be defined.
        this.clearFilters();
        this.initializeFilters();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.deviceService.isTouchEnabled()) {
      this.searchInputEl.nativeElement.blur();
    } else {
      this.searchInputEl.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.windowRefService.nativeWindow.document?.removeEventListener) {
      this.windowRefService.nativeWindow.document.removeEventListener("click", this.onDocumentClick.bind(this));
    }

    super.ngOnDestroy();
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.hasAutoCompleteGroups() && !this.elementRef.nativeElement.contains(event.target)) {
      this.resetAutoCompleteItems();
    }
  }

  getGroupOrder(): SearchAutoCompleteType[] {
    return Object.keys(this.autoCompleteGroups) as SearchAutoCompleteType[];
  }

  getItemCountInGroup(group: SearchAutoCompleteType): number {
    return this.autoCompleteGroups[group]?.length || 0;
  }

  hasAutoCompleteGroups(): boolean {
    return Object
      .keys(this.autoCompleteGroups)
      .filter(key =>
        key !== SearchAutoCompleteType.TEXT &&
        this.autoCompleteGroups[key] &&
        this.autoCompleteGroups[key].length > 0
      )
      .length > 0;
  }

  showTabOrEnterInformation() {
    this.offcanvasService.open(this.tabOrEnterInformationOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
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

  _updateModel(value: SearchAutoCompleteItem): void {
    this.model = {
      ...this.model,
      [value.type]: value.value
    };

    this.modelChanged.emit(this.model);
  }

  onFormSubmit(): void {
    if (this.selectedAutoCompleteGroup && this.selectedAutoCompleteItemIndex > -1) {
      const selectedItem = this.autoCompleteGroups[this.selectedAutoCompleteGroup][this.selectedAutoCompleteItemIndex];
      if (selectedItem) {
        this.onAutoCompleteItemClicked(selectedItem).subscribe();
        this.resetAutoCompleteItems();
        return;
      }
    }

    this.searchInputNgModel.control.markAsPristine();

    this.resetAutoCompleteItems();
    this._updateModelWithMagicAutoComplete(this.model.text.value).subscribe();
  }

  onAutoCompleteItemClicked(autoCompleteItem: SearchAutoCompleteItem): Observable<SearchModelInterface> {
    this.resetAutoCompleteItems();

    return this.searchService.allowFilter$(autoCompleteItem.minimumSubscription).pipe(
      tap(allow => {
        if (!allow) {
          this.searchService.openSubscriptionRequiredModal(autoCompleteItem.minimumSubscription);
          return;
        }

        let filterComponentType: Type<SearchFilterComponentInterface>;

        if (autoCompleteItem.type === SearchAutoCompleteType.SEARCH_FILTER) {
          filterComponentType = this.searchService.getFilterComponentTypeByKey(autoCompleteItem.value);
          this.createAndEditFilter(filterComponentType);
          this.model = {
            ...this.model,
            text: {
              value: "",
              matchType: undefined
            }
          };
          this._updateModel(autoCompleteItem);
        } else if (autoCompleteItem.type === SearchAutoCompleteType.TEXT) {
          this._updateModel({
            type: autoCompleteItem.type,
            label: autoCompleteItem.label,
            value: autoCompleteItem.value
          });
        } else {
          this.model = {
            ...this.model,
            text: {
              value: "",
              matchType: undefined
            }
          };
          filterComponentType = this.searchService.getFilterComponentTypeByKey(autoCompleteItem.type);
          this.addFilter(filterComponentType, autoCompleteItem.value);
        }
      }),
      map(() => this.model)
    );
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

  openAutoCompleteSuggestions(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.hasAutoCompleteGroups()) {
      this.showAutoCompleteGroups = true;
    }
  }

  closeAutoCompleteSuggestions(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.showAutoCompleteGroups = false;
    this.selectedAutoCompleteGroup = null;
    this.selectedAutoCompleteItemIndex = -1;
  }

  resetAutoCompleteItems(event?: KeyboardEvent): void {
    if (event) {
      event.preventDefault();
    }

    this.showAutoCompleteGroups = false;
    this.autoCompleteGroups = {};
    this.selectedAutoCompleteGroup = null;
    this.selectedAutoCompleteItemIndex = -1;
    this._abortAutoComplete = true;
  }

  onSearch(model: SearchModelInterface, findExactMatchFilter: boolean): void {
    const normalizedQuery = model.text?.value
      ? model.text.value.toLowerCase().replace(/\s/g, "")
      : null;

    this.resetAutoCompleteItems();
    this.searchInputNgModel.control.markAsPristine();

    if (
      findExactMatchFilter &&
      normalizedQuery &&
      (model.searchType === SearchType.IMAGE || model.searchType === undefined)
    ) {
      forkJoin(
        this._autoCompleteMethods(model.text?.value)
          .filter(filter => filter.key !== SearchAutoCompleteType.TEXT)
          .map(filter => filter.method)
      ).subscribe((results: SearchAutoCompleteItem[][]) => {
        results.forEach(group => {
          group.forEach(item => {
            const normalizedLabel = item.label.toLowerCase().replace(/\s/g, "");
            if (normalizedLabel === normalizedQuery) {
              this.onAutoCompleteItemClicked(item).subscribe();
              return;
            }
          });
        });
        this.modelChanged.emit(model);
      });
    } else {
      this.modelChanged.emit(model);
    }
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

  updateFilter(
    filterComponentType: Type<SearchFilterComponentInterface>,
    value: any,
    triggerSearch: boolean = true
  ): void {
    const componentRef = this._findFilterComponentRef(filterComponentType);
    let currentValue: any = componentRef.instance.value;

    if (componentRef) {
      if (UtilsService.isArray(currentValue)) {
        if (!currentValue.includes(value[0])) {
          currentValue = [...currentValue, ...value];
        }
      } else if (UtilsService.isObject(currentValue) && currentValue.hasOwnProperty("value")) {
        if (!currentValue.value.includes(value.value[0])) {
          currentValue.value = [...currentValue.value, ...value.value];
          if (currentValue.hasOwnProperty("matchType")) {
            currentValue.matchType = currentValue.matchType || MatchType.ANY;
          }
        }
      } else {
        currentValue = value;
      }

      componentRef.instance.value = currentValue;
      this.model = {
        ...this.model,
        [this.searchService.getKeyByFilterComponentType(filterComponentType)]: currentValue,
        text: {
          value: "",
          matchType: undefined
        }
      };

      if (triggerSearch) {
        this.onSearch(this.model, false);
      }
    }
  }

  addFilter(
    filterComponentType: Type<SearchFilterComponentInterface>,
    value: any,
    triggerSearch: boolean = true
  ): void {
    if (filterComponentType === SearchTextFilterComponent) {
      // The Text filter is handled separately and hardcoded in the template.
      return;
    }

    this.utilsService.delay(1).subscribe(() => {
      let key: string;
      let created = false;
      let componentRef: ComponentRef<SearchFilterComponentInterface> = this._findFilterComponentRef(filterComponentType);

      if (componentRef) {
        this.updateFilter(filterComponentType, value, triggerSearch);
      } else {
        componentRef = this.searchService.instantiateFilterComponent(
          filterComponentType,
          value,
          this.filterContainer
        );
        created = true;
      }

      key = this.searchService.getKeyByFilterComponentType(componentRef.componentType);

      if (created) {
        this.filterComponentRefs.push(componentRef);

        componentRef.instance.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(filterValue => {
          if (componentRef.instance.hasValue()) {
            this.onFilterValueChanges(key as SearchAutoCompleteType, filterValue);
          } else {
            this.removeFilter(componentRef);
            this.onSearch(this.model, false);
          }
        });

        componentRef.instance.remove.subscribe(() => {
          this.removeFilter(componentRef);
        });
      }

      this.resetAutoCompleteItems();
      this.searchInputEl.nativeElement.focus();
    });
  }

  onFilterValueChanges(key: SearchAutoCompleteType, value: any): void {
    if (key === SearchAutoCompleteType.TEXT && value.value?.length < 2) {
      return;
    }

    this._updateModel({
      type: key,
      label: this.searchService.humanizeSearchAutoCompleteType(key),
      value
    });
  }

  reset(): void {
    this.model = {
      text: {
        value: "",
        matchType: undefined
      },
      page: 1,
      pageSize: SearchService.DEFAULT_PAGE_SIZE
    };

    this.clearFilters();
    this.onSearch(this.model, false);
  }

  clearFilters(): void {
    this.filterComponentRefs.forEach(componentRef => componentRef.destroy());
    this.filterComponentRefs = [];

    if (this.searchInputEl) {
      this.searchInputEl.nativeElement.focus();
    }
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
      this.searchInputEl.nativeElement.focus();
      this.onSearch(this.model, false);
    });
  }

  createAndEditFilter(filterComponentType: Type<SearchFilterComponentInterface>): void {
    this.utilsService.delay(1).subscribe(() => {
      let componentRef: ComponentRef<any> = this._findFilterComponentRef(filterComponentType);
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
        const decodedParams = decodeURIComponent(params);
        this.model = this.searchService.paramsToModel(decodedParams);
        this.clearFilters();
        this.initializeFilters();
        this.onSearch(this.model, false);
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

        this.onSearch(this.model, false);
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
      text: { ...this.model.text },
      searchType,
      ordering: null,
      page: 1
    };

    this.resetAutoCompleteItems();
    this.filterComponentRefs.forEach(componentRef => componentRef.destroy());
    this.onSearch(this.model, false);
  }

  private _updateModelWithMagicAutoComplete(value: string): Observable<SearchAutoCompleteItem[][]> {
    // Checks if any autocomplete items are a perfect match. If they are, updates the model with that item type and
    // empties the text. Otherwise, it sets the text.

    const normalizedQuery = value.toLowerCase().replace(/\s/g, "");
    const observables$ = this._autoCompleteMethods(value)
      .filter(filter => filter.key !== SearchAutoCompleteType.USERS)
      .map(filter => filter.method);
    let found = false;

    return forkJoin(observables$).pipe(
      tap((results: SearchAutoCompleteItem[][]) => {
        results.forEach(group => {
          group.forEach(item => {
            if (item.type !== SearchAutoCompleteType.TEXT) {
              const normalizedLabel = item.label.toLowerCase().replace(/\s/g, "");
              if (normalizedLabel === normalizedQuery) {
                found = true;
                this.onAutoCompleteItemClicked(item).subscribe();
                return;
              }
            }
          });
        });

        if (!found) {
          this.model = {
            ...this.model,
            text: {
              value,
              matchType: this.model.text.matchType !== undefined
                ? this.model.text.matchType
                : value.includes(" ") ? MatchType.ALL : undefined
            }
          };

          this.modelChanged.emit(this.model);
        }
      })
    );
  }

  private _findFilterComponentRef(filterComponentType: Type<SearchFilterComponentInterface>): ComponentRef<SearchFilterComponentInterface> {
    return this.filterComponentRefs.find(
      componentRef => this.searchService.getKeyByFilterComponentType(componentRef.componentType) === this.searchService.getKeyByFilterComponentType(filterComponentType)
    );
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
        key: SearchMountFilterComponent.key,
        method: this.searchService.autoCompleteMounts$(query)
      },
      {
        key: SearchFilterFilterComponent.key,
        method: this.searchService.autoCompleteFilters$(query)
      },
      {
        key: SearchAccessoryFilterComponent.key,
        method: this.searchService.autoCompleteAccessories$(query)
      },
      {
        key: SearchSoftwareFilterComponent.key,
        method: this.searchService.autoCompleteSoftware$(query)
      },
      {
        key: SearchSubjectsFilterComponent.key,
        method: this.searchService.autoCompleteSubjects$(query)
      },
      {
        key: SearchTelescopeTypesFilterComponent.key,
        method: this.searchService.autoCompleteTelescopeTypes$(query)
      },
      {
        key: SearchCameraTypesFilterComponent.key,
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
      },
      {
        key: SearchUsersFilterComponent.key,
        method: this.searchService.autoCompleteUsers$(query)
      },
      {
        key: SearchAutoCompleteType.TEXT,
        method: this.searchService.autoCompleteFreeText$(query)
      }
    ];
  };
}
