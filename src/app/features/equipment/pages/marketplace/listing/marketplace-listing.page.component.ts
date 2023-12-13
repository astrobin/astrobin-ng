import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute, Router } from "@angular/router";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { Observable } from "rxjs";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Actions, ofType } from "@ngrx/effects";
import {
  DeleteMarketplaceListing,
  DeleteMarketplaceListingSuccess,
  EquipmentActionTypes
} from "@features/equipment/store/equipment.actions";

@Component({
  selector: "astrobin-marketplace-listing-page",
  templateUrl: "./marketplace-listing.page.component.html",
  styleUrls: ["./marketplace-listing.page.component.scss"]
})
export class MarketplaceListingPageComponent extends BaseComponentDirective implements OnInit {
  readonly breadcrumb = new SetBreadcrumb({
    breadcrumb: [
      {
        label: this.translateService.instant("Equipment"),
        link: "/equipment/explorer"
      },
      {
        label: this.translateService.instant("Marketplace"),
        link: "/equipment/marketplace"
      },
      {
        label: this.translateService.instant("Listing")
      }
    ]
  });

  title = this.translateService.instant("Equipment marketplace listing");
  listing: MarketplaceListingInterface;
  listingContentType$: Observable<ContentTypeInterface>;
  listingUser$: Observable<UserInterface>;

  private _contentTypePayload = { appLabel: "astrobin_apps_equipment", model: "equipmentitemmarketplacelisting" };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);
    this.store$.dispatch(new LoadContentType(this._contentTypePayload));

    this.listing = this.activatedRoute.snapshot.data.listing;

    this.listingContentType$ = this.store$.select(selectContentType, this._contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1)
    );

    this.listingUser$ = this.equipmentMarketplaceService.getListingUser$(this.listing).pipe(
      filter(user => !!user),
      take(1)
    );
  }

  delete() {
    const confirmationModal = this.modalService.open(ConfirmationDialogComponent);
    confirmationModal.closed.pipe(
      tap(() => this.loadingService.setLoading(true)),
      tap(() => this.store$.dispatch(new DeleteMarketplaceListing({ listing: this.listing }))),
      switchMap(() => this.actions$.pipe(ofType(EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_SUCCESS))),
      filter((action: DeleteMarketplaceListingSuccess) => action.payload.id === this.listing.id),
      take(1)
    ).subscribe(() => {
      this.router.navigateByUrl("/equipment/marketplace").then(() => {
        this.loadingService.setLoading(false);
      });
    });
  }
}
