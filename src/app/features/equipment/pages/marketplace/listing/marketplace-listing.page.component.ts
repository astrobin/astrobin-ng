import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { Observable } from "rxjs";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

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

  private _contentTypePayload = { appLabel: "astrobin_apps_equipment", model: "equipmentitemmarketplacelisting" };

  constructor(
    public readonly store$: Store<State>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);

    this.listingContentType$ = this.store$.select(selectContentType, this._contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1)
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);
    this.store$.dispatch(new LoadContentType(this._contentTypePayload));

    this.listing = this.activatedRoute.snapshot.data.listing;
  }
}
