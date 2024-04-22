import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CurrencyPipe } from "@angular/common";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import {
  MarketplaceOfferInterface,
  MarketplaceOfferStatus
} from "@features/equipment/types/marketplace-offer.interface";
import { Actions, ofType } from "@ngrx/effects";
import {
  CreateMarketplaceOffer,
  CreateMarketplaceOfferFailure,
  CreateMarketplaceOfferSuccess,
  DeleteMarketplaceOffer,
  DeleteMarketplaceOfferFailure,
  DeleteMarketplaceOfferSuccess,
  EquipmentActionTypes,
  UpdateMarketplaceOffer,
  UpdateMarketplaceOfferFailure,
  UpdateMarketplaceOfferSuccess
} from "@features/equipment/store/equipment.actions";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { forkJoin } from "rxjs";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

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
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
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
      this._performOfferAction(
        UpdateMarketplaceOffer,
        EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS,
        EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE);
    } else {
      this._performOfferAction(
        CreateMarketplaceOffer,
        EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS,
        EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
      );
    }
  }

  retractOffer() {
    if (this.hasAnyOffers()) {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      modalRef.closed.subscribe(() => {
        this._performOfferAction(
          DeleteMarketplaceOffer,
          EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS,
          EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE
        );
      });
    } else {
      this.popNotificationsService.error(this.translateService.instant("No offers to retract."));
    }
  }

  makeOfferLabel(): string {
    const sameCurrency = this.listing.lineItems.every(
      (lineItem, index, array) => lineItem.currency === array[0].currency
    );

    if (sameCurrency) {
      const amount = this.currencyPipe.transform(this._getTotalAmount(), this.listing.lineItems[0].currency);

      if (this.listing.deliveryByShipping) {
        return this.translateService.instant(
          "Offer {{0}} incl. shipping",
          { 0: amount }
        );
      } else {
        return this.translateService.instant(
          "Offer {{0}}",
          { 0: amount }
        );
      }
    }

    if (this.hasAnyOffers()) {
      return this.translateService.instant("Modify offer");
    }

    return this.translateService.instant("Make offer");
  }

  hasAnyOffers(): boolean {
    return this.listing.lineItems.some(lineItem => lineItem.offers.length > 0);
  }

  hasAnyPendingOffers(): boolean {
    return this.listing.lineItems.some(
      lineItem => lineItem.offers.filter(offer => offer.status === MarketplaceOfferStatus.PENDING).length > 0
    );
  }

  _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      const hasAnyOffers = this.hasAnyOffers();

      this.fields = this.listing.lineItems.map((lineItem, index) => {
        const hasLineItemOffer = lineItem.offers.some(offer => offer.user === currentUser.id);
        const offeredAmount = hasLineItemOffer
          ? +lineItem.offers.find(offer => offer.user === currentUser.id).amount
          : 0;

        return {
          key: "",
          fieldGroupClassName: `row ${!!lineItem.sold ? "sold" : ""}`,
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
              defaultValue: hasAnyOffers ? hasLineItemOffer : true,
              expressions: {
                "hide": () => this.listing.bundleSaleOnly,
                className: () => this.hasAnyOffers() ? "hidden" : "col-1 toggle"
              },
              props: {
                label: "&nbsp;",
                hideOptionalMarker: true,
                hideLabel: index > 0
              },
              hooks: {
                onInit: field => {
                  field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                    const amountControl = this.form.get(`amount-${lineItem.id}`);

                    if (value) {
                      amountControl.enable();
                      amountControl.setValue(+lineItem.price);
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
              template: lineItem.itemName + (!!lineItem.sold ? ` (${this.translateService.instant("sold")})` : ""),
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
              defaultValue: this.currencyPipe.transform(+lineItem.price, lineItem.currency, "symbol-narrow"),
              props: {
                label: this.translateService.instant("Ask price"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: index > 0
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
              className: "col shipping-cost",
              defaultValue: lineItem.shippingCost
                ? this.currencyPipe.transform(+lineItem.shippingCost, lineItem.currency, "symbol-narrow")
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
              focus: index === 0,
              defaultValue: hasAnyOffers ? offeredAmount : +lineItem.price,
              props: {
                disabled: !!lineItem.sold || (hasAnyOffers ? !hasLineItemOffer : false),
                label: this.translateService.instant("Offer amount"),
                required: true,
                type: "number",
                min: 0.01,
                step: 1,
                addonLeft: {
                  text: lineItem.currency
                },
                hideRequiredMarker: true,
                hideLabel: index > 0
              },
              hooks: {
                onInit: field => {
                  this.form.get(`amount-${lineItem.id}`).valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                    this.form.get(`total-${lineItem.id}`).setValue(
                      this.currencyPipe.transform(
                        this._getTotalAmountPerLineItem(lineItem, value), lineItem.currency,
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
              className: "col total",
              defaultValue: this.currencyPipe.transform(
                this._getTotalAmountPerLineItem(lineItem, offeredAmount), lineItem.currency,
                "symbol-narrow"
              ),
              props: {
                label: this.translateService.instant("Total"),
                readonly: true,
                hideOptionalMarker: true,
                hideLabel: index > 0
              }
            }
          ]
        };
      });
    });
  }

  private _performOfferAction(
    action: typeof CreateMarketplaceOffer | typeof UpdateMarketplaceOffer | typeof DeleteMarketplaceOffer,
    successActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS,
    failureActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE
  ) {
    const lineItems = this.listing.lineItems.filter(lineItem => {
      const amount = this.form.value[`amount-${lineItem.id}`];
      return !!amount;
    });

    const successObservables$ = lineItems.map(lineItem =>
      this.actions$.pipe(
        ofType(successActionType),
        filter(
          (action: CreateMarketplaceOfferSuccess | UpdateMarketplaceOfferSuccess | DeleteMarketplaceOfferSuccess) =>
            action.payload.offer.lineItem === lineItem.id
        ),
        switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
        take(1)
      )
    );

    const failureObservables$ = lineItems.map(lineItem =>
      this.actions$.pipe(
        ofType(failureActionType),
        filter(
          (action: CreateMarketplaceOfferFailure | UpdateMarketplaceOfferFailure | DeleteMarketplaceOfferFailure) =>
            action.payload.offer.lineItem === lineItem.id
        ),
        take(1)
      )
    );

    forkJoin(successObservables$).pipe(
      // It's only one listing so we can take the first result.
      map(result => result[0])
    ).subscribe(listing => {
      this.modal.close(listing);
      this.loadingService.setLoading(false);

      let message: string;

      if (action === CreateMarketplaceOffer) {
        message = this.translateService.instant("Your offer has been successfully submitted.");
      } else if (action === UpdateMarketplaceOffer) {
        message = this.translateService.instant("Your offer has been successfully updated.");
      } else {
        message = this.translateService.instant("Your offer has been successfully retracted.");
      }

      this.popNotificationsService.success(message);
    });

    forkJoin(failureObservables$).subscribe(() => {
      this.loadingService.setLoading(false);
      this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForBuyer());
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
    const total = this._getTotalAmount();

    if (total === 0) {
      this.popNotificationsService.error(
        this.translateService.instant("You cannot offer nothing, sorry.")
      );
    }
    return total > 0;
  }

  private _getTotalAmountIncludingShipping(): number {
    return this.listing.lineItems.reduce((total, lineItem) => {
      const id = lineItem.id;

      if (this.form.value[`checkbox-${id}`]) {
        total += +this.form.value[`amount-${id}`] + +this.form.value[`shippingCost-raw-${id}`];
      }

      return total;
    }, 0);
  }

  private _getTotalAmount(): number {
    return this.listing.lineItems.reduce((total, lineItem) => {
      const id = lineItem.id;

      if (this.form.value[`checkbox-${id}`]) {
        total += +this.form.value[`amount-${id}`];
      }

      return total;
    }, 0);
  }

  private _getTotalAmountPerLineItem(lineItem: MarketplaceLineItemInterface, offeredAmount: number): number {
    return (offeredAmount || +lineItem.price) + (+lineItem.shippingCost || 0);
  }
}

