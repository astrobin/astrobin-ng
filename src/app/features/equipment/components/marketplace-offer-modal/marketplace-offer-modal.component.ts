import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CurrencyPipe } from "@angular/common";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { forkJoin } from "rxjs";
import { LoadingService } from "@shared/services/loading.service";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { Actions, ofType } from "@ngrx/effects";
import {
  CreateMarketplaceOffer,
  CreateMarketplaceOfferSuccess,
  EquipmentActionTypes,
  UpdateMarketplaceOffer,
  UpdateMarketplaceOfferSuccess
} from "@features/equipment/store/equipment.actions";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";

@Component({
  selector: "astrobin-marketplace-offer-modal",
  templateUrl: "./marketplace-offer-modal.component.html",
  styleUrls: ["./marketplace-offer-modal.component.scss"]
})
export class MarketplaceOfferModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listing: MarketplaceListingInterface;

  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];

  title: string = this.translateService.instant("Make an offer");
  rulesText = this.translateService.instant(
    "Before making an offer, please make sure you reviewed all the details of this listing. By making an offer, " +
    "you agree to the {{0}}terms and conditions{{1}} of the AstroBin marketplace.",
    {
      0: "<a href='https://welcome.astrobin.com/features/marketplace#terms-and-conditions' target='_blank'>",
      1: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly currencyPipe: CurrencyPipe,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._initFields();

    if (this.hasAnyOffers()) {
      this.title = this.translateService.instant("Modify your offer");
    }
  }

  makeOffer() {
    if (!this._checkFormHasItems()) {
      return;
    }

    if (this.hasAnyOffers()) {
      this._performOfferAction(UpdateMarketplaceOffer, EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS);
    } else {
      this._performOfferAction(CreateMarketplaceOffer, EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS);
    }
  }

  makeOfferLabel(): string {
    const sameCurrency = this.listing.lineItems.every(
      (lineItem, index, array) => lineItem.currency === array[0].currency
    );

    if (sameCurrency) {
      let total = 0;

      for (const key of Object.keys(this.form.value)) {
        if (key.indexOf("amount-") === 0) {
          total += +this.form.value[key];
        }
      }

      const totalLabel = this.currencyPipe.transform(total, this.listing.lineItems[0].currency);

      if (this.hasAnyOffers()) {
        return this.translateService.instant("Modify offer to") + " " + totalLabel;
      }

      return this.translateService.instant("Make offer for") + " " + totalLabel;
    }

    if (this.hasAnyOffers()) {
      return this.translateService.instant("Modify offer");
    }

    return this.translateService.instant("Make offer");
  }

  defaultOfferAmount(lineItem: MarketplaceLineItemInterface): number {
    if (!!lineItem.shippingCost) {
      return +lineItem.price + +lineItem.shippingCost;
    }

    return +lineItem.price;
  }

  hasAnyOffers(): boolean {
    return this.listing.lineItems.some(lineItem => lineItem.offers.length > 0);
  }

  _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      const hasAnyOffers = this.hasAnyOffers();

      this.fields = this.listing.lineItems.map((lineItem, index) => {
        const hasLineItemOffer = lineItem.offers.some(offer => offer.user === currentUser.id);
        const offeredAmount = hasLineItemOffer
          ? lineItem.offers.find(offer => offer.user === currentUser.id).amount
          : 0;

        return {
          key: "",
          fieldGroupClassName: "row",
          fieldGroup: [
            {
              key: `lineItemId-${lineItem.id}`,
              type: "input",
              className: "hidden"
            },
            {
              key: `checkbox-${lineItem.id}`,
              type: "toggle",
              wrappers: ["default-wrapper"],
              className: "col-1 toggle",
              defaultValue: hasAnyOffers ? hasLineItemOffer : true,
              props: {
                label: "&nbsp;",
                hideOptionalMarker: true,
                hideLabel: index > 0
              },
              hooks: {
                onInit: field => {
                  field.formControl.valueChanges.subscribe(value => {
                    const amountControl = this.form.get(`amount-${lineItem.id}`);
                    if (value) {
                      amountControl.enable();
                      amountControl.setValue(this.defaultOfferAmount(lineItem));
                    } else {
                      amountControl.disable();
                      amountControl.setValue(0);
                    }
                  });
                }
              }
            },
            {
              key: `itemName-${lineItem.id}`,
              type: "html",
              wrappers: ["default-wrapper"],
              className: "col item-name",
              template: lineItem.itemName,
              props: {
                label: this.translateService.instant("Item"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: index > 0
              }
            },
            {
              key: `price-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col price",
              defaultValue: this.currencyPipe.transform(lineItem.price, lineItem.currency, "symbol-narrow"),
              props: {
                label: this.translateService.instant("Ask price"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: index > 0
              }
            },
            {
              key: `shippingCost-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col shipping-cost",
              defaultValue: lineItem.shippingCost
                ? this.currencyPipe.transform(lineItem.shippingCost, lineItem.currency, "symbol-narrow")
                : this.translateService.instant("Free"),
              props: {
                label: this.translateService.instant("Shipping cost"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: index > 0
              }
            },
            {
              key: `amount-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col-4 offer-amount",
              defaultValue: hasAnyOffers ? offeredAmount : this.defaultOfferAmount(lineItem),
              props: {
                disabled: hasAnyOffers ? !hasLineItemOffer : false,
                label: this.translateService.instant("Offer amount"),
                required: true,
                type: "number",
                min: 0,
                step: 1,
                addonLeft: {
                  text: lineItem.currency
                },
                hideRequiredMarker: true,
                hideLabel: index > 0
              }
            }
          ]
        };
      });
    });
  }

  private _performOfferAction(
    action: typeof CreateMarketplaceOffer | typeof UpdateMarketplaceOffer,
    successActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS
  ) {
    forkJoin(
      this.listing.lineItems
        .filter(lineItem => {
          const amount = this.form.value[`amount-${lineItem.id}`];
          return !!amount;
        })
        .map(lineItem => {
          return this.actions$.pipe(
            ofType(successActionType),
            filter(
              (action: CreateMarketplaceOfferSuccess | UpdateMarketplaceOfferSuccess) =>
                action.payload.offer.lineItem === lineItem.id
            ),
            switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
            take(1)
          );
        })
    ).pipe(
      // It's only one listing so we can take the first result.
      map(result => result[0])
    ).subscribe(listing => {
      this.modal.close(listing);
      this.loadingService.setLoading(false);
    });

    this.loadingService.setLoading(true);

    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      this.listing.lineItems.forEach(lineItem => {
        const amount = this.form.value[`amount-${lineItem.id}`];
        const offer: MarketplaceOfferInterface = {
          listing: this.listing.id,
          lineItem: lineItem.id,
          id: lineItem.offers.find(offer => offer.user === currentUser.id)?.id,
          amount
        };

        if (!!amount) {
          this.store$.dispatch(new action({ offer }));
        }
      });
    });
  }

  private _checkFormHasItems() {
    let hasItems = false;

    for (const key of Object.keys(this.form.value)) {
      if (key.indexOf("checkbox-")) {
        hasItems = true;
        break;
      }
    }

    if (!hasItems) {
      this.popNotificationsService.error(
        this.translateService.instant("You cannot make an offer without selecting at least one item.")
      );
    }

    return hasItems;
  }
}
