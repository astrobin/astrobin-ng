import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { SearchService } from "@features/search/services/search.service";
import { merge, Observable, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, startWith } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";

type FilterType = {
  label: string;
  key: string;
  minimumSubscription: PayableProductInterface;
  allow$?: Observable<boolean>;
};

@Component({
  selector: "astrobin-search-filter-selection-modal",
  templateUrl: "./search-filter-selection-modal.component.html",
  styleUrls: ["./search-filter-selection-modal.component.scss"]
})
export class SearchFilterSelectionModalComponent extends BaseComponentDirective implements OnInit {
  public model: string;
  public filters: FilterType[];
  public focus$ = new Subject<string>();
  public click$ = new Subject<string>();

  @ViewChild("filterContainer", { read: ViewContainerRef })
  filterContainer: ViewContainerRef;

  public search: (text$: Observable<string>) => Observable<FilterType[]>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly searchService: SearchService,
    public readonly utilsService: UtilsService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal
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
      const componentRefs = possibleFilters.map(filterType => {
        return this.searchService.instantiateFilterComponent(
          filterType,
          null,
          this.filterContainer
        );
      }).sort((a, b) => {
        return a.instance.label.localeCompare(b.instance.label);
      });

      this.filters = componentRefs.map(componentRef => ({
        label: componentRef.instance.label,
        minimumSubscription: (componentRef.componentType as any).minimumSubscription as PayableProductInterface,
        key: this.searchService.getKeyByFilterComponentType(componentRef.componentType)
      }));

      // Now that we have the labels, we don't need these anymore.
      componentRefs.forEach(componentRefs => componentRefs.destroy());

      return merge(debouncedText$, this.focus$, this.click$).pipe(
        startWith(""),
        map(term => {
          return (
            term === ""
              ? this.filters
              : this.filters.filter(filterType => filterType.label.toLowerCase().indexOf(term.toLowerCase()) > -1)
          ).map(filterType => (
            {
              ...filterType,
              allow$: this.searchService.allowFilter$(filterType.minimumSubscription)
            }
          ));
        })
      );
    };
  }

  onSelect(filter: FilterType) {
    filter.allow$.subscribe(allow => {
      if (!allow) {
        this.modal.close();

        const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        let requiredSubscription: SimplifiedSubscriptionName;

        switch (filter.minimumSubscription) {
          case PayableProductInterface.LITE:
            requiredSubscription = SimplifiedSubscriptionName.ASTROBIN_LITE;
            break;
          case PayableProductInterface.PREMIUM:
            requiredSubscription = SimplifiedSubscriptionName.ASTROBIN_PREMIUM;
            break;
          case PayableProductInterface.ULTIMATE:
            requiredSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
            break;
        }

        modalRef.componentInstance.requiredSubscription = requiredSubscription;

        return;
      }

      if (filter.key) {
        const componentType = this.searchService.getFilterComponentTypeByKey(filter.key);
        this.modal.close(componentType);
      }
    });
  }
}
