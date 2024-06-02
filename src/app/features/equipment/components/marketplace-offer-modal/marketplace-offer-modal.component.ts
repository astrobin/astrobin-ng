import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CurrencyPipe } from "@angular/common";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import { Actions } from "@ngrx/effects";
import { take, takeUntil } from "rxjs/operators";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { WindowRefService } from "@shared/services/window-ref.service";

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
      0: `<a href='${this.classicRoutesService.MARKETPLACE_TERMS}' target='_blank'>`,
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
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._initFields();

    if (this.equipmentMarketplaceService.listingHasOffers(this.listing)) {
      this.title = this.translateService.instant("Modify your offer");
    }
  }

  makeOfferLabel(): string {
    const sameCurrency = this.listing.lineItems.every(
      (lineItem, index, array) => lineItem.currency === array[0].currency
    );

    if (sameCurrency) {
      const amount = this.currencyPipe.transform(
        this.equipmentMarketplaceService.getOfferTotalAmount(
          this.listing, this.form
        ),
        this.listing.lineItems[0].currency
      );

      if (this.listing.deliveryByShipping) {
        return this.translateService.instant("Offer {{0}} incl. shipping", { 0: amount });
      } else {
        return this.translateService.instant("Offer {{0}}", { 0: amount });
      }
    }

    if (this.equipmentMarketplaceService.listingHasOffers(this.listing)) {
      return this.translateService.instant("Modify offer");
    }

    return this.translateService.instant("Make offer");
  }

  hasAnyOffers(): boolean {
    return this.listing.lineItems.some(lineItem => lineItem.offers.length > 0);
  }

  displayLabel(index: number): boolean {
    return this.windowRefService.nativeWindow.innerWidth < 992 || index === 0;
  }

  _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      const listingHasOffers = this.equipmentMarketplaceService.listingHasOffers(this.listing);
      const listingHasOffersByCurrentUser = this.equipmentMarketplaceService.listingHasOffersByUser(
        this.listing,
        currentUser
      );

      this.fields = this.listing.lineItems.map((lineItem, index) => {
        const lineItemHasOfferFromCurrentUser = lineItem.offers.some(offer => offer.user === currentUser.id);
        const offeredAmount = lineItemHasOfferFromCurrentUser
          ? +lineItem.offers.find(offer => offer.user === currentUser.id).amount
          : null;

        return {
          key: "",
          fieldGroupClassName: `row ${!!lineItem.sold ? "sold" : ""} ${!!lineItem.reserved ? "reserved" : ""} flex-column flex-lg-row offer-row`,
          wrappers: ["default-wrapper"],
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
              expressions: {
                hide: () => this.listing.bundleSaleOnly,
                className: () =>
                  this.equipmentMarketplaceService.listingHasOffers(this.listing) ? "hidden" : "col-12 col-lg-1 pb-4 pb-lg-0 toggle",
                "props.disabled": () => !!lineItem.sold || !!lineItem.reserved
              },
              props: {
                label: "&nbsp;",
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              hooks: {
                onInit: field => {
                  let defaultValue;

                  if (!!field.model.sold || !!field.model.reserved) {
                    defaultValue = false;
                  } else if (lineItemHasOfferFromCurrentUser) {
                    defaultValue = true;
                  } else {
                    defaultValue = !listingHasOffersByCurrentUser;
                  }

                  field.formControl.setValue(defaultValue);

                  field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                    const amountControl = this.form.get(`amount-${lineItem.id}`);

                    if (value) {
                      amountControl.enable();
                      amountControl.setValue(+lineItem.price);
                    } else {
                      amountControl.disable();
                      amountControl.setValue(null);
                    }

                    this.form
                      .get(`total-${lineItem.id}`)
                      .setValue(
                        this.currencyPipe.transform(
                          this._getTotalAmountPerLineItem(lineItem),
                          lineItem.currency,
                          "symbol-narrow"
                        )
                      );
                    this.form.updateValueAndValidity();
                  });
                }
              }
            },
            {
              key: `itemName-${lineItem.id}`,
              type: "html",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg pb-4 pb-lg-0 item-name",
              props: {
                label: this.translateService.instant("Item"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              expressions: {
                "props.disabled": () => !!lineItem.sold || !!lineItem.reserved,
                template: () => {
                  if (lineItem.sold) {
                    return lineItem.itemName + ` (${this.translateService.instant("sold")})`;
                  }

                  if (lineItem.reserved) {
                    return lineItem.itemName + ` (${this.translateService.instant("reserved")})`;
                  }

                  return lineItem.itemName;
                }
              }
            },
            {
              key: `price-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg pb-4 pb-lg-0 price",
              defaultValue: this.currencyPipe.transform(+lineItem.price, lineItem.currency, "symbol-narrow"),
              props: {
                label: this.translateService.instant("Asking price"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              }
            },
            {
              key: `shippingCost-raw-${lineItem.id}`,
              type: "input",
              className: "hidden",
              defaultValue: +lineItem.shippingCost
            },
            {
              key: `shippingCost-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg pb-4 pb-lg-0 shipping-cost",
              defaultValue: lineItem.shippingCost
                ? this.currencyPipe.transform(+lineItem.shippingCost, lineItem.currency, "symbol-narrow")
                : this.translateService.instant("Free"),
              props: {
                label: this.translateService.instant("Shipping cost"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              }
            },
            {
              key: `amount-${lineItem.id}`,
              type: "custom-number",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg-4 pb-4 pb-lg-0 offer-amount",
              focus: index === 0,
              props: {
                disabled:
                  !!lineItem.sold ||
                  !!lineItem.reserved ||
                  (listingHasOffers ? !lineItemHasOfferFromCurrentUser : false),
                label: this.translateService.instant("Offer amount"),
                required: true,
                min: 0.01,
                step: 1,
                addonLeft: {
                  text: lineItem.currency
                },
                hideRequiredMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              hooks: {
                onInit: field => {
                  this.currentUser$.pipe(take(1)).subscribe(currentUser => {
                    let defaultValue;

                    if (
                      (!!lineItem.soldTo && lineItem.soldTo != currentUser.id) ||
                      (!!lineItem.reservedTo && lineItem.reservedTo != currentUser.id)
                    ) {
                      defaultValue = null;
                    } else if (lineItemHasOfferFromCurrentUser) {
                      defaultValue = offeredAmount;
                    } else if (listingHasOffersByCurrentUser) {
                      defaultValue = null;
                    } else {
                      defaultValue = +lineItem.price;
                    }

                    field.formControl.setValue(defaultValue);
                  });

                  this.form
                    .get(`amount-${lineItem.id}`)
                    .valueChanges.pipe(takeUntil(this.destroyed$))
                    .subscribe(value => {
                      this.form
                        .get(`total-${lineItem.id}`)
                        .setValue(
                          this.currencyPipe.transform(
                            this._getTotalAmountPerLineItem(lineItem),
                            lineItem.currency,
                            "symbol-narrow"
                          )
                        );
                      this.form.updateValueAndValidity();
                    });
                }
              }
            },
            {
              key: `total-${lineItem.id}`,
              type: "input",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg total",
              props: {
                label: this.translateService.instant("Total"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              hooks: {
                onInit: field => {
                  field.formControl.setValue(
                    this.currencyPipe.transform(
                      this._getTotalAmountPerLineItem(lineItem),
                      lineItem.currency,
                      "symbol-narrow"
                    )
                  );
                }
              }
            }
          ]
        };
      });
    });
  }

  private _getTotalAmountPerLineItem(lineItem: MarketplaceLineItemInterface): number {
    const lineItemId = lineItem.id;
    const offeredAmount = this.form.get(`amount-${lineItemId}`)?.value;
    const shippingCost = this.form.get(`shippingCost-raw-${lineItemId}`)?.value;

    if (this.form.get(`checkbox-${lineItemId}`)?.value || this.listing.bundleSaleOnly) {
      return +offeredAmount + +shippingCost;
    }

    return 0;
  }
}
