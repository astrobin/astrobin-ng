import type { OnInit } from "@angular/core";
import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import type { DeviceService } from "@core/services/device.service";
import type { SearchService } from "@core/services/search.service";
import type { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { SearchFilterService } from "@features/search/services/search-filter.service";
import type { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import type { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";
import { merge, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

interface FilterType {
  category: SearchFilterCategory;
  label: string;
  key: string;
  minimumSubscription: PayableProductInterface;
  allow$?: Observable<boolean>;
}

@Component({
  selector: "astrobin-search-filter-selection-modal",
  templateUrl: "./search-filter-selection-modal.component.html",
  styleUrls: ["./search-filter-selection-modal.component.scss"]
})
export class SearchFilterSelectionModalComponent extends BaseComponentDirective implements OnInit {
  public model: string;
  public categories: string[] = UtilsService.getEnumKeys(SearchFilterCategory);
  public filters: FilterType[];
  public focus$ = new Subject<string>();
  public click$ = new Subject<string>();

  @ViewChild("filterContainer", { read: ViewContainerRef })
  filterContainer: ViewContainerRef;

  public search: (text$: Observable<string>) => Observable<FilterType[]>;

  protected readonly SearchFilterCategory = SearchFilterCategory;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly searchService: SearchService,
    public readonly searchFilterService: SearchFilterService,
    public readonly utilsService: UtilsService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.utilsService.delay(1).subscribe(() => {
      this.initializeSearch();
    });
  }

  categoryFilters(category: SearchFilterCategory): FilterType[] {
    if (!this.filters) {
      return [];
    }

    return this.filters.filter(filterType => filterType.category === category);
  }

  initializeSearch(): void {
    this.search = (text$: Observable<string>): Observable<FilterType[]> => {
      if (!this.filterContainer) {
        return of([]);
      }

      const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());

      // We only search for the filters that are possible to be selected here.
      const possibleFilters = this.searchService.allFiltersTypes.filter(
        filterType => !this.searchService.autoCompleteOnlyFiltersTypes.includes(filterType)
      );

      // In order to get the labels of filters that can be used, we need to instantiate them.
      const componentRefs = possibleFilters
        .map(filterType => {
          return this.searchService.instantiateFilterComponent(filterType, null, this.filterContainer);
        })
        .sort((a, b) => {
          return a.instance.label.localeCompare(b.instance.label);
        });

      this.filters = componentRefs.map(componentRef => ({
        category: componentRef.instance.category,
        label: componentRef.instance.label,
        minimumSubscription: (componentRef.componentType as any).minimumSubscription as PayableProductInterface,
        key: this.searchService.getKeyByFilterComponentType(componentRef.componentType),
        allow$: this.searchFilterService.allowFilter$(
          (componentRef.componentType as any).minimumSubscription as PayableProductInterface
        )
      }));

      // Now that we have the labels, we don't need these anymore.
      componentRefs.forEach(componentRefs => componentRefs.destroy());

      return merge(debouncedText$, this.focus$, this.click$).pipe(
        map(term => {
          return !term || term.length < 2
            ? []
            : this.filters.filter(filterType => filterType.label.toLowerCase().indexOf(term.toLowerCase()) > -1);
        })
      );
    };
  }

  onSelect(filter: FilterType) {
    if (!filter) {
      return;
    }

    filter.allow$.subscribe(allow => {
      if (!allow) {
        this.modal.close();
        this.searchFilterService.openSubscriptionRequiredModal(filter.minimumSubscription);
        return;
      }

      if (filter.key) {
        const componentType = this.searchService.getFilterComponentTypeByKey(filter.key);
        this.modal.close(componentType);
      }
    });
  }
}
