import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { filter, map, take } from "rxjs/operators";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthActionTypes, LoadUser, LoadUserFailure, LoadUserSuccess } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { Location } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import { CountryService } from "@shared/services/country.service";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { LocalStorageService } from "@shared/services/localstorage.service";
import { NgbModal, NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-marketplace-user-listings-base-page",
  template: ""
})
export abstract class MarketplaceUserListingsBasePageComponent
  extends MarketplaceListingsBasePageComponent
  implements OnInit {
  username: string;
  user: UserInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly countryService: CountryService,
    public readonly router: Router,
    public readonly utilsService: UtilsService,
    public readonly location: Location,
    public readonly windowRefService: WindowRefService,
    public readonly localStorageService: LocalStorageService,
    public readonly modalService: NgbModal,
    public readonly paginationConfig: NgbPaginationConfig
  ) {
    super(
      store$,
      actions$,
      translateService,
      titleService,
      loadingService,
      activatedRoute,
      countryService,
      router,
      utilsService,
      localStorageService,
      modalService,
      windowRefService,
      paginationConfig
    );
  }

  ngOnInit(): void {
    this.username = this.activatedRoute.snapshot.paramMap.get("username");
    super.ngOnInit();
  }

  public refresh(filterModel?: MarketplaceFilterModel) {
    this.actions$
      .pipe(
        ofType(AuthActionTypes.LOAD_USER_SUCCESS),
        map((action: LoadUserSuccess) => action.payload.user),
        filter(user => user.username === this.username),
        take(1)
      )
      .subscribe(user => {
        this.user = user;

        if (!user) {
          this.windowRefService.routeTo404();
          return;
        }

        this._setTitle(user);
        this._setBreadcrumbs(user);

        // Call the base class refresh method with additional filter for user
        const userFilterModel = { ...filterModel, user: user.id };
        super.refresh(userFilterModel);
      });

    this.actions$
      .pipe(
        ofType(AuthActionTypes.LOAD_USER_FAILURE),
        map((action: LoadUserFailure) => action.payload.username),
        filter(username => username === this.username),
        take(1)
      )
      .subscribe(() => {
        this.windowRefService.routeTo404();
        this.loadingService.setLoading(false);
      });

    this.store$.dispatch(new LoadUser({ username: this.username }));
  }

  protected _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.lineItems.length > 0 && listing.user === this.user?.id;
  }

  protected _setTitle(user: UserInterface) {
    if (!user) {
      return;
    }

    this.title = this.translateService.instant("{{0}}'s marketplace listings", { 0: user.displayName });
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumbs(user: UserInterface) {
    if (!user) {
      return;
    }

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment"),
            link: "/equipment/explorer"
          },
          {
            label: this.translateService.instant("Marketplace")
          },
          {
            label: this.translateService.instant("User listings")
          },
          {
            label: user.displayName
          }
        ]
      })
    );
  }
}
