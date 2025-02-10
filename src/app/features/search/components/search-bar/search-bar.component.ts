import { AfterViewInit, Component, ComponentRef, ElementRef, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface, SearchType } from "@features/search/interfaces/search-model.interface";
import { SearchService } from "@core/services/search.service";
import { concatMap, debounceTime, filter, map, takeUntil, tap } from "rxjs/operators";
import { forkJoin, from, Observable, of, Subject } from "rxjs";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { DeviceService } from "@core/services/device.service";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { LoadSaveSearchModalComponent } from "@features/search/components/filters/load-save-search-modal/load-save-search-modal.component";
import { SearchTextFilterComponent } from "@features/search/components/filters/search-text-filter/search-text-filter.component";
import { MatchType } from "@features/search/enums/match-type.enum";
import { FormGroup, NgModel } from "@angular/forms";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchAutoCompleteItem } from "@features/search/interfaces/search-auto-complete-item.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CookieService } from "ngx-cookie";
import { fadeInOut } from "@shared/animations";

type SearchAutoCompleteGroups = {
  [key in SearchAutoCompleteType]?: SearchAutoCompleteItem[];
};


@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"],
  animations: [fadeInOut]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild("searchInput", { static: false, read: ElementRef }) searchInputEl: ElementRef;
  @ViewChild("searchInput", { static: false, read: NgModel }) searchInputNgModel: NgModel;
  @ViewChild("filterContainer", { read: ViewContainerRef }) filterContainer: ViewContainerRef;
  @ViewChild("temporaryFilterContainer", { read: ViewContainerRef }) temporaryFilterContainer: ViewContainerRef;
  @ViewChild("tabOrEnterInformationOffcanvasTemplate") tabOrEnterInformationOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("searchSettingsOffcanvasTemplate") searchSettingsOffcanvasTemplate: TemplateRef<any>;
  @ViewChildren("autoCompleteItem") autoCompleteItemsRefs!: QueryList<ElementRef>;

  @Input() model: SearchModelInterface = {};

  @Output() modelChanged = new EventEmitter<SearchModelInterface>();

  protected readonly SearchType = SearchType;
  protected readonly SearchTextFilterComponent = SearchTextFilterComponent;
  protected readonly placeholder = this.translateService.instant("Type here to search");
  protected readonly isBrowser: boolean;

  protected isTouchDevice = false;
  protected showAutoCompleteGroups = false;
  protected autoCompleteGroups: SearchAutoCompleteGroups = {};
  protected selectedAutoCompleteGroup: SearchAutoCompleteType = null;
  protected loadingAutoCompleteItems = false;
  protected selectedAutoCompleteItemIndex = -1;
  protected filterComponentRefs: ComponentRef<SearchFilterComponentInterface>[] = [];
  // Used to track when a search has been performed, in order to display an alert message regarding free text search.
  protected firstSearchDone = false;

  protected readonly searchSettingsForm: FormGroup = new FormGroup({});
  protected searchSettingsFields: FormlyFieldConfig[] = [];
  protected searchSettingsModel: {
    simpleMode: boolean;
  } = {
    simpleMode: this.searchService.isSimpleMode()
  };

  private _modelChanged: Subject<string> = new Subject<string>();
  private _abortAutoComplete = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly searchFilterService: SearchFilterService,
    public readonly modalService: NgbModal,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly elementRef: ElementRef,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly cookieService: CookieService
  ) {
    super(store$);

    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.isTouchDevice = this.deviceService.isTouchEnabled();

    if (isPlatformBrowser(this.platformId) && this.windowRefService.nativeWindow.document?.addEventListener) {
      this.windowRefService.nativeWindow.document.addEventListener("click", this.onDocumentClick.bind(this));
    }

    this.searchService.simpleModeChanges$.pipe(takeUntil(this.destroyed$)).subscribe(simpleMode => {
      this.model = {
        ...this.model,
        text: {
          value: this.model.text?.value,
          matchType: this.model.text?.matchType,
          onlySearchInTitlesAndDescriptions: simpleMode
        }
      }
    });

    this._modelChanged.pipe(
      debounceTime(200),
      filter(value => value && value.length > 2),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      if (this.model.searchType !== SearchType.IMAGE && this.model.searchType !== undefined) {
        return;
      }

      if (this.searchSettingsModel.simpleMode) {
        return;
      }

      this.selectedAutoCompleteGroup = null;
      this.selectedAutoCompleteItemIndex = -1;
      this._abortAutoComplete = false;

      if (value && value.length > 0) {
        const query = this.model.text;
        this.loadingAutoCompleteItems = true;

        from(this.searchService.autoCompleteMethods(query?.value)).pipe(
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

    this._initSearchSettingsFields();
  };

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.model &&
      changes.model.currentValue &&
      JSON.stringify(changes.model.currentValue) !== JSON.stringify(changes.model.previousValue)
    ) {
      if (this.isBrowser) {
        // No point of doing this on the server because the container ref will not be defined.
        this.clearFilters();
        this.initializeFilters();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && !this.isTouchDevice) {
      this.searchInputEl?.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.windowRefService.nativeWindow.document?.removeEventListener) {
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
    if (this.isBrowser && event) {
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
    if (this.isBrowser && event) {
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
    if (this.isBrowser && event && !this.deviceService.smMax()) {
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
    if (this.isBrowser && event && !this.deviceService.smMax()) {
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

    if (this.isTouchDevice) {
      this.searchInputEl?.nativeElement.blur();
    }

    if (!this.searchSettingsModel.simpleMode) {
      this._updateModelWithMagicAutoComplete(this.model.text.value).subscribe(() => {
        this.resetAutoCompleteItems();
      });
    } else {
      this.modelChanged.emit(this.model);
    }
  }

  onAutoCompleteItemClicked(autoCompleteItem: SearchAutoCompleteItem): Observable<SearchModelInterface> {
    this.resetAutoCompleteItems();

    return this.searchFilterService.allowFilter$(autoCompleteItem.minimumSubscription).pipe(
      tap(allow => {
        if (!allow) {
          this.searchFilterService.openSubscriptionRequiredModal(autoCompleteItem.minimumSubscription);
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
              matchType: MatchType.ALL,
              onlySearchInTitlesAndDescriptions: this.searchSettingsModel.simpleMode
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
              matchType: MatchType.ALL,
              onlySearchInTitlesAndDescriptions: this.searchSettingsModel.simpleMode
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

    this.firstSearchDone = true;
    this.resetAutoCompleteItems();
    this.searchInputNgModel.control.markAsPristine();

    if (
      findExactMatchFilter &&
      normalizedQuery &&
      (model.searchType === SearchType.IMAGE || model.searchType === undefined)
    ) {
      forkJoin(
        this.searchService.autoCompleteMethods(model.text?.value)
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
          matchType: MatchType.ALL,
          onlySearchInTitlesAndDescriptions: this.searchSettingsModel.simpleMode
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

      if (!this.isTouchDevice) {
        this.searchInputEl.nativeElement.focus();
      }
    });
  }

  onFilterValueChanges(key: SearchAutoCompleteType, value: any): void {
    if (key === SearchAutoCompleteType.TEXT && value.value?.length < 2) {
      return;
    }

    this._updateModel({
      type: key,
      label: this.searchFilterService.humanizeSearchAutoCompleteType(key),
      value
    });
  }

  reset(): void {
    this.model = {
      text: {
        value: "",
        matchType: MatchType.ALL,
        onlySearchInTitlesAndDescriptions: this.searchSettingsModel.simpleMode
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

    if (!this.isTouchDevice) {
      this.searchInputEl?.nativeElement.focus();
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

      if (!this.isTouchDevice) {
        this.searchInputEl?.nativeElement.focus();
      }

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
      if (componentType) {
        this.createAndEditFilter(componentType);
      }
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

  onSearchSettingsClicked(event: Event): void {
    event.preventDefault();

    this.offcanvasService.open(this.searchSettingsOffcanvasTemplate, {
      panelClass: "search-settings-offcanvas",
      position: this.deviceService.offcanvasPosition()
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
      case SearchType.USERS:
        return "user";
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

  private _updateModelWithMagicAutoComplete(value: string): Observable<SearchAutoCompleteItem> {
    // Checks if any autocomplete items are a perfect match. If they are, updates the model with that item type and
    // empties the text. Otherwise, it sets the text.

    if (this.model.searchType !== SearchType.IMAGE && this.model.searchType !== undefined) {
      this.modelChanged.emit(this.model);
      return of(null);
    }

    this.loadingAutoCompleteItems = true;

    return this.searchService.magicAutocomplete$(value).pipe(
      tap((item: SearchAutoCompleteItem) => {
        this.loadingAutoCompleteItems = false;

        if (item) {
          this.onAutoCompleteItemClicked(item).subscribe();
        } else {
          this.model = {
            ...this.model,
            text: {
              value,
              matchType: this.model.text.matchType !== undefined
                ? this.model.text.matchType
                : value.includes(" ") ? MatchType.ALL : undefined,
              onlySearchInTitlesAndDescriptions: this.searchSettingsModel.simpleMode
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

  private _initSearchSettingsFields(): void {
    this.searchSettingsFields = [
      {
        key: "simpleMode",
        type: "toggle",
        wrappers: ["default-wrapper"],
        props: {
          hideOptionalMarker: true,
          toggleLabel: this.translateService.instant("Simple mode"),
          description: this.translateService.instant(
            "AstroBin will search only in titles and descriptions, and search filters will be disabled. " +
            "We recommend filters to perform more advanced and exact searches."
          )
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: boolean) => {
              this.searchService.setSimpleMode(value);
            });
          }
        }
      }
    ];
  }
}
