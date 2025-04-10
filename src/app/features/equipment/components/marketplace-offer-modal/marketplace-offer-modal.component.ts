import { CurrencyPipe } from "@angular/common";
import { OnInit, Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import {
  MarketplaceLineItemInterface,
  MarketplaceShippingCostType
} from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-offer-modal",
  templateUrl: "./marketplace-offer-modal.component.html",
  styleUrls: ["./marketplace-offer-modal.component.scss"]
})
export class MarketplaceOfferModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  offers: (MarketplaceOfferInterface & { userObj: UserInterface })[] = [];

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
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly currencyPipe: CurrencyPipe,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._initFields();

    if (this.offers.length > 0) {
      this.title = this.translateService.instant("Modify your offer");
    }
  }

  makeOrModifyOfferLabel(): string {
    const sameCurrency = this.listing.lineItems.every(
      (lineItem, index, array) => lineItem.currency === array[0].currency
    );

    if (sameCurrency) {
      const amount = this.currencyPipe.transform(this._getOfferTotalAmount(), this.listing.lineItems[0].currency);

      if (this.listing.deliveryByShipping) {
        return this.translateService.instant("Offer {{0}} incl. shipping", { 0: amount });
      } else {
        return this.translateService.instant("Offer {{0}}", { 0: amount });
      }
    }

    if (this.offers.length > 0) {
      return this.translateService.instant("Modify your offer");
    }

    return this.translateService.instant("Make offer");
  }

  displayLabel(index: number): boolean {
    return this.windowRefService.nativeWindow.innerWidth < 992 || index === 0;
  }

  onMakeOrModifyOfferButtonClick(event: Event) {
    event.preventDefault();

    if (this.form.get("terms") && !this.form.get("terms").value) {
      this.popNotificationsService.error(this.translateService.instant("You must agree to the terms of service."));
      return;
    }

    if (!this._checkOfferFormHasItems()) {
      return;
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      const data = this.form.value;
      const offers: MarketplaceOfferInterface[] = [];
      const lineItemIds = Array.from(new Set(Object.keys(data).map(key => key.substring(key.lastIndexOf("-") + 1))));
      const listingId = this.listing.id;
      const userId = user.id;
      const newMasterOfferUuid = UtilsService.uuid();

      lineItemIds.forEach(lineItemId => {
        const amountKey = `amount-${lineItemId}`;
        const masterOfferUuid = data[`masterOfferUuid-${lineItemId}`] || newMasterOfferUuid;

        if (data.hasOwnProperty(amountKey)) {
          const offer: MarketplaceOfferInterface = {
            id: parseInt(data[`id-${lineItemId}`], 10),
            listing: listingId,
            lineItem: parseInt(lineItemId, 10),
            user: userId,
            amount: data[amountKey],
            status: MarketplaceOfferStatus.PENDING,
            masterOfferUuid
          };

          offers.push(offer);
        }
      });

      if (this.offers.length > 0) {
        this.equipmentMarketplaceService.modifyOffer(this.listing, offers, this.modal);
      } else {
        this.equipmentMarketplaceService.makeOffer(this.listing, offers, this.modal);
      }
    });
  }

  _initFields() {
    this.currentUserProfile$.pipe(take(1)).subscribe(userProfile => {
      this.fields = this.listing.lineItems.map((lineItem, index) => {
        return {
          key: "",
          fieldGroupClassName: `row ${!!lineItem.sold ? "sold" : ""} ${
            !!lineItem.reserved ? "reserved" : ""
          } flex-column flex-lg-row offer-row`,
          wrappers: ["default-wrapper"],
          fieldGroup: [
            {
              key: `id-${lineItem.id}`,
              type: "input",
              className: "hidden",
              hooks: {
                onInit: field => {
                  field.formControl.setValue(this.offers.find(offer => offer.lineItem === lineItem.id)?.id);
                }
              }
            },
            {
              key: `masterOfferUuid-${lineItem.id}`,
              type: "input",
              className: "hidden",
              hooks: {
                onInit: field => {
                  field.formControl.setValue(
                    this.offers.find(offer => offer.lineItem === lineItem.id)?.masterOfferUuid
                  );
                }
              }
            },
            {
              key: `lineItemId-${lineItem.id}`,
              type: "input",
              className: "hidden"
            },
            {
              key: `itemName-${lineItem.id}`,
              type: "formly-template",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg pb-4 pb-lg-0 item-name",
              props: {
                label: this.translateService.instant("Item"),
                readonly: true,
                tabindex: -1,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              expressions: {
                "props.disabled": () => !!lineItem.sold || !!lineItem.reserved,
                template: () => {
                  if (lineItem.sold) {
                    return (
                      (lineItem.itemName || lineItem.itemPlainText) + ` (${this.translateService.instant("sold")})`
                    );
                  }

                  if (lineItem.reserved) {
                    return (
                      (lineItem.itemName || lineItem.itemPlainText) + ` (${this.translateService.instant("reserved")})`
                    );
                  }

                  return lineItem.itemName || lineItem.itemPlainText;
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
                tabindex: -1,
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
              props: {
                label: this.translateService.instant("Shipping cost"),
                readonly: true,
                tabindex: -1,
                hideOptionalMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              hooks: {
                onInit: field => {
                  const defaultValue = () => {
                    switch (lineItem.shippingCostType) {
                      case MarketplaceShippingCostType.NO_SHIPPING:
                        return this.translateService.instant("n/a");
                      case MarketplaceShippingCostType.COVERED_BY_SELLER:
                        return this.translateService.instant("Covered by seller");
                      case MarketplaceShippingCostType.FIXED:
                        if (!!lineItem.shippingCost) {
                          return this.currencyPipe.transform(
                            +lineItem.shippingCost,
                            lineItem.currency,
                            "symbol-narrow"
                          );
                        }
                        return this.translateService.instant("Free");
                      case MarketplaceShippingCostType.TO_BE_AGREED:
                        return this.translateService.instant("To be agreed");
                    }
                  };

                  field.formControl.setValue(defaultValue());
                }
              }
            },
            {
              key: `amount-${lineItem.id}`,
              type: "custom-number",
              wrappers: ["default-wrapper"],
              className: "col-12 col-lg-4 pb-4 pb-lg-0 offer-amount",
              focus: index === 0,
              props: {
                // The field should be disabled if:
                // - the line item is sold
                // - the line item is reserved
                // - we're editing offers and the line item does not have an offer
                disabled:
                  !!lineItem.sold ||
                  !!lineItem.reserved ||
                  (this.offers.length && !this.offers.some(offer => offer.lineItem === lineItem.id)),
                label: this.translateService.instant("Offer amount"),
                required: true,
                step: 1,
                addonLeft: {
                  text: lineItem.currency
                },
                hideRequiredMarker: true,
                hideLabel: !this.displayLabel(index)
              },
              validators: {
                validation: [
                  "number",
                  {
                    name: "min-value",
                    options: {
                      minValue: 0.01
                    }
                  }
                ]
              },
              hooks: {
                onInit: field => {
                  this.currentUser$.pipe(take(1)).subscribe(currentUser => {
                    // The defaultValue should be:
                    // - 0 if the line item is sold to someone else
                    // - 0 if the line item is reserved to someone else
                    // - the offered amount if the line item has offers
                    // - the asking price if the line item does not have offers

                    let defaultValue;

                    if (
                      (!!lineItem.sold && lineItem.soldTo !== currentUser.id) ||
                      (!!lineItem.reserved && lineItem.reservedTo !== currentUser.id)
                    ) {
                      defaultValue = 0;
                    } else if (this.offers.length > 0 && this.offers.some(offer => offer.lineItem === lineItem.id)) {
                      defaultValue = this.offers.find(offer => offer.lineItem === lineItem.id).amount;
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
                tabindex: -1,
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

      this.fields.push({
        key: "terms",
        type: "checkbox",
        wrappers: ["default-wrapper"],
        defaultValue: false,
        className: "mt-5",
        props: {
          label: this.translateService.instant("I agree to the AstroBin Marketplace terms of service"),
          description: this.translateService.instant(
            "By making an offer for a listing on the AstroBin Marketplace, you agree to the {{0}}terms of service{{1}}.",
            {
              0: `<a href="${this.classicRoutesService.MARKETPLACE_TERMS}" target="_blank">`,
              1: "</a>"
            }
          ),
          required: true
        },
        expressions: {
          hide: () => !!userProfile.agreedToMarketplaceTerms
        }
      });
    });
  }

  private _getTotalAmountPerLineItem(lineItem: MarketplaceLineItemInterface): number {
    const lineItemId = lineItem.id;
    const offeredAmount = this.form.get(`amount-${lineItemId}`)?.value;
    const shippingCost = this.form.get(`shippingCost-raw-${lineItemId}`)?.value;

    if (lineItem.sold || lineItem.reserved) {
      return 0;
    }

    return +offeredAmount + +shippingCost;
  }

  private _getOfferTotalAmount(): number {
    return this.listing.lineItems.reduce((total, lineItem) => {
      const id = lineItem.id;
      const amount = this.form.value[`amount-${id}`];
      const shippingCost = this.form.value[`shippingCost-raw-${id}`] || 0;

      if (amount) {
        total += +amount + +shippingCost;
      }

      return total;
    }, 0);
  }

  private _checkOfferFormHasItems(): boolean {
    const total = this._getOfferTotalAmount();

    if (total <= 0) {
      this.popNotificationsService.error(this.translateService.instant("You cannot offer nothing, sorry."));
    }

    return total > 0;
  }
}
