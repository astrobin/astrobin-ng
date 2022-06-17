import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE,
  ExplorerBaseComponent,
  ExplorerPageSortOrder
} from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Actions, ofType } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import {
  selectBrand,
  selectBrands,
  selectImagesUsingEquipmentBrand,
  selectUsersUsingEquipmentBrand
} from "@features/equipment/store/equipment.selectors";
import {
  EquipmentActionTypes,
  GetAllBrands,
  GetAllBrandsSuccess,
  GetImagesUsingBrand,
  GetUsersUsingBrand
} from "@features/equipment/store/equipment.actions";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CookieService } from "ngx-cookie-service";
import { LoadingService } from "@shared/services/loading.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { Observable } from "rxjs";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-brand-explorer-page",
  templateUrl: "./brand-explorer-page.component.html",
  styleUrls: ["./brand-explorer-page.component.scss"]
})
export class BrandExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly ExplorerPageSortOrder = ExplorerPageSortOrder;
  readonly UtilsService = UtilsService;

  title = this.translateService.instant("Equipment explorer");
  activeId: BrandInterface["id"];
  activeBrand: BrandInterface;

  usersUsing$: Observable<UserInterface[]>;
  imagesUsing$: Observable<ImageInterface[]>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService, cookieService);
    this.activeType = "BRAND";
  }

  get logo(): string {
    return (this.activeBrand.logo as string) || "/assets/images/brand-placeholder.png";
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.GET_ALL_BRANDS_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: GetAllBrandsSuccess) => action.payload.response)
      )
      .subscribe(response => {
        if (!response.next) {
          this.loadingService.setLoading(false);
          return;
        }

        const nextUrl = response.next;
        const nextPage = parseInt(UtilsService.getUrlParam(nextUrl, "page"), 10);
        this.store$.dispatch(new GetAllBrands({ page: nextPage, sort: this.sortOrder }));
      });

    this._setParams();

    this.store$.dispatch(new GetUsersUsingBrand({ brandId: this.activeId }));
    this.store$.dispatch(new GetImagesUsingBrand({ brandId: this.activeId }));

    this.usersUsing$ = this.store$.select(selectUsersUsingEquipmentBrand, {
      brandId: this.activeId
    });

    this.imagesUsing$ = this.store$.select(selectImagesUsingEquipmentBrand, {
      brandId: this.activeId
    });

    this.router.events
      .pipe(
        takeUntil(this.destroyed$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._setParams();
      });
  }

  getItems() {
    this.loadingService.setLoading(true);

    this.sortOrder =
      (this.cookieService.get(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE) as ExplorerPageSortOrder) ||
      ExplorerPageSortOrder.AZ;

    this.items$ = this.store$.select(selectBrands);
    this.store$.dispatch(new GetAllBrands({ page: 1, sort: this.sortOrder }));
  }

  viewBrand(brand: BrandInterface) {
    this.router.navigateByUrl(`/equipment/explorer/brand/${brand.id}/${UtilsService.slugify(brand.name)}`);
  }

  closeBrand(brand: BrandInterface) {
    this.router.navigateByUrl("/equipment/explorer/brand/");
  }

  private _setParams() {
    this.activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("brandId"), 10);
    if (!!this.activeId) {
      this.store$
        .select(selectBrand, this.activeId)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          this.activeBrand = brand;
        });
    }
  }
}
