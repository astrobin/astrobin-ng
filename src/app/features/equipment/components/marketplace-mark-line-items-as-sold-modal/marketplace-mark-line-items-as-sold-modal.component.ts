import { OnInit, Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import {
  MarkMarketplaceLineItemAsSoldSuccess,
  EquipmentActionTypes,
  MarkMarketplaceLineItemAsSold
} from "@features/equipment/store/equipment.actions";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { forkJoin } from "rxjs";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-feedback-modal",
  templateUrl: "./marketplace-mark-line-items-as-sold-modal.component.html",
  styleUrls: ["./marketplace-mark-line-items-as-sold-modal.component.scss"]
})
export class MarketplaceMarkLineItemsAsSoldModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listing: MarketplaceListingInterface;

  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];

  title: string = this.translateService.instant("Mark as sold");

  helpText: string = this.translateService.instant(
    "Select the items that you have sold. AstroBin considers an item as sold when you have received payment and " +
      "shipped it to the buyer."
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this._initFields();
  }

  markSelectedAsSold(): void {
    const keys = Object.keys(this.form.value);
    const atLeastOneSelected = keys.some(key => this.form.value[key]);

    if (!atLeastOneSelected) {
      this.popNotificationsService.error("Please select at least one line item to mark as sold.");
      return;
    }

    if (!this.form.valid) {
      this.popNotificationsService.error("Please fill in all required fields.");
      this.form.markAllAsTouched();
      return;
    }

    const confirmationModalRef = this.modalService.open(ConfirmationDialogComponent);
    const confirmationModalInstance: ConfirmationDialogComponent = confirmationModalRef.componentInstance;
    confirmationModalInstance.title = this.translateService.instant("Did you receive payment and deliver the item(s)?");
    confirmationModalInstance.message = this.translateService.instant(
      "AstroBin considers an item as sold when you have received payment and delivered it to the buyer. If you " +
        "have not completed these steps, please hold off on marking the item as sold. Are you sure you want to " +
        "proceed?"
    );

    confirmationModalRef.dismissed.subscribe(() => {
      this.modal.close();
    });

    confirmationModalRef.closed.subscribe(() => {
      const selectedLineItemIds = Object.keys(this.form.value)
        .filter(key => this.form.value[key])
        .map(key => key.replace("checkbox-", ""))
        .map(id => parseInt(id, 10));

      const selectedLineItems = this.listing.lineItems.filter(lineItem => selectedLineItemIds.includes(lineItem.id));

      const successObservables$ = selectedLineItems.map(lineItem => {
        return this.actions$.pipe(
          ofType(EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_SUCCESS),
          filter((action: MarkMarketplaceLineItemAsSoldSuccess) => action.payload.lineItem.id === lineItem.id),
          take(1)
        );
      });

      const failureObservables$ = selectedLineItems.map(lineItem => {
        return this.actions$.pipe(
          ofType(EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_FAILURE),
          filter((action: MarkMarketplaceLineItemAsSoldSuccess) => action.payload.lineItem.id === lineItem.id),
          take(1)
        );
      });

      forkJoin(successObservables$)
        .pipe(take(1))
        .subscribe(() => {
          this.modal.close();
          this.loadingService.setLoading(false);
          this.popNotificationsService.success("Line items marked as sold.");
        });

      forkJoin(failureObservables$)
        .pipe(take(1))
        .subscribe(() => {
          this.modal.close();
          this.loadingService.setLoading(false);
          this.popNotificationsService.error("Error while marking line items as sold.");
        });

      this.loadingService.setLoading(true);

      selectedLineItems.forEach(lineItem => {
        this.store$.dispatch(
          new MarkMarketplaceLineItemAsSold({
            lineItem,
            soldTo: this.form.get(`soldTo-${lineItem.id}`).value
          })
        );
      });
    });
  }

  _initFields() {
    function sortOffers(a: MarketplaceOfferInterface, b: MarketplaceOfferInterface) {
      const statusOrder = { [MarketplaceOfferStatus.ACCEPTED]: 1, [MarketplaceOfferStatus.PENDING]: 2 };

      if (statusOrder[a.status] < statusOrder[b.status]) {
        return -1;
      }

      if (statusOrder[a.status] > statusOrder[b.status]) {
        return 1;
      }

      // If statuses are the same, sort by the created date, most recent first.
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }

    this.fields = this.listing.lineItems
      .filter(lineItem => !lineItem.sold)
      .map((lineItem, index) => {
        const usersWithAcceptedOffers: { value: UserInterface["id"]; label: string }[] = lineItem.offers
          .filter(offer => offer.status === MarketplaceOfferStatus.ACCEPTED)
          .sort(sortOffers)
          .map(offer => ({
            value: offer.user,
            label: offer.userDisplayName + this.translateService.instant(" (accepted offer)")
          }));

        const usersWithPendingOffers: { value: UserInterface["id"]; label: string }[] = lineItem.offers
          .filter(offer => offer.status === MarketplaceOfferStatus.PENDING)
          .filter(offer => !usersWithAcceptedOffers.find(acceptedOffer => acceptedOffer.value === offer.user))
          .sort(sortOffers)
          .map(offer => ({
            value: offer.user,
            label: offer.userDisplayName + this.translateService.instant(" (pending offer)")
          }));

        return {
          key: "",
          fieldGroupClassName: "d-flex align-items-end w-100",
          fieldGroup: [
            {
              key: `checkbox-${lineItem.id}`,
              type: "toggle",
              wrappers: ["default-wrapper"],
              defaultValue: false,
              expressions: {
                className: () =>
                  this.listing.lineItems.filter(lineItem => !lineItem.sold).length > 1 ? "w-50 mb-2 toggle" : "hidden",
                disabled: () => lineItem.sold
              },
              props: {
                label: "",
                toggleLabel: lineItem.itemName || lineItem.itemPlainText,
                hideOptionalMarker: true
              }
            },
            {
              key: `itemName-${lineItem.id}`,
              type: "formly-template",
              wrappers: ["default-wrapper"],
              template: lineItem.itemName || lineItem.itemPlainText,
              expressions: {
                className: () =>
                  this.listing.lineItems.filter(lineItem => !lineItem.sold).length === 1 ? "w-50 mb-0" : "hidden"
              },
              props: {
                label: this.translateService.instant("Item"),
                hideOptionalMarker: true,
                hideLabel: index > 0
              }
            },
            {
              key: `soldTo-${lineItem.id}`,
              type: "ng-select",
              wrappers: ["default-wrapper"],
              expressions: {
                className: () => "w-50 " + (!!lineItem.sold ? "hidden" : ""),
                "props.required": config => {
                  return (
                    this.listing.lineItems.filter(lineItem => !lineItem.sold).length === 1 ||
                    !!config.model[`checkbox-${lineItem.id}`]
                  );
                }
              },
              props: {
                label: this.translateService.instant("Buyer"),
                options: [
                  ...usersWithAcceptedOffers,
                  ...usersWithPendingOffers,
                  ...[
                    {
                      value: -1,
                      label:
                        usersWithAcceptedOffers.length > 0 || usersWithAcceptedOffers.length > 0
                          ? this.translateService.instant("Someone else")
                          : this.translateService.instant("Someone who didn't make an offer on AstroBin")
                    }
                  ]
                ],
                hideLabel: index > 0
              },
              hooks: {
                onInit: (field: FormlyFieldConfig) => {
                  field.formControl.valueChanges.subscribe(() => {
                    this.form.get(`checkbox-${lineItem.id}`).setValue(true);
                  });
                }
              }
            }
          ]
        };
      });
  }
}
