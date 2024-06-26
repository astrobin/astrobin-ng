import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { LoadingService } from "@shared/services/loading.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { filter, take, takeUntil } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  MarketplaceFeedbackCategory,
  MarketplaceFeedbackInterface,
  MarketplaceFeedbackTargetType,
  MarketplaceFeedbackValue
} from "@features/equipment/types/marketplace-feedback.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { CreateMarketplaceFeedback, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { forkJoin } from "rxjs";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";

@Component({
  selector: "astrobin-marketplace-feedback-modal",
  templateUrl: "./marketplace-feedback-modal.component.html",
  styleUrls: ["./marketplace-feedback-modal.component.scss"]
})
export class MarketplaceFeedbackModalComponent extends BaseComponentDirective implements AfterViewInit {
  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  user: UserInterface;

  @Input()
  targetType: MarketplaceFeedbackTargetType;

  @ViewChild("feedbackOptionTemplate")
  feedbackOptionTemplate: TemplateRef<any>;

  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  model: { [key: string]: any } = {};

  title: string = this.translateService.instant("Leave feedback");

  rulesText = this.translateService.instant(
    "Please be truthful and honest when providing feedback after a transaction, and make sure you respect the " +
    "{{0}}terms and conditions{{1}} of the AstroBin marketplace.",
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
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngAfterViewInit(): void {
    this._initFields();
  }

  saveFeedback(): void {
    const transformToFeedbackList = (input: { [key: string]: string | undefined }): MarketplaceFeedbackInterface[] => {
      const feedbackList: MarketplaceFeedbackInterface[] = [];

      // Loop through each key in the input object
      for (const key in input) {
        const [categoryKey, lineItemId] = key.split("-"); // Split key to category and ID
        if (UtilsService.isValidEnumValue(categoryKey.toUpperCase(), MarketplaceFeedbackCategory)) {
          const feedback: MarketplaceFeedbackInterface = {
            recipient: this.user.id,
            lineItem: parseInt(lineItemId),
            value: MarketplaceFeedbackValue[input[key] as keyof typeof MarketplaceFeedbackValue],
            category:
              MarketplaceFeedbackCategory[categoryKey.toUpperCase() as keyof typeof MarketplaceFeedbackCategory]
          };
          feedbackList.push(feedback);
        }
      }

      return feedbackList;
    };

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(this.fields, this.popNotificationsService, this.translateService);
      return;
    }

    const feedbackList = transformToFeedbackList(this.form.value);

    const successObservables$ = feedbackList.map(feedback =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_SUCCESS),
        filter((action: any) => action.payload.feedback.lineItem === feedback.lineItem),
        take(1)
      )
    );

    const failureObservables$ = feedbackList.map(feedback =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_FAILURE),
        filter((action: any) => action.payload.feedback.lineItem === feedback.lineItem),
        take(1)
      )
    );

    forkJoin(successObservables$)
      .pipe(take(1))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
        this.popNotificationsService.success(this.translateService.instant("Feedback saved successfully. Thank you!"));
      });

    forkJoin(failureObservables$)
      .pipe(take(1))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(
          this.translateService.instant("An error occurred while saving the feedback.")
        );
      });

    this.loadingService.setLoading(true);

    feedbackList.forEach(feedback => {
      this.store$.dispatch(new CreateMarketplaceFeedback({ feedback }));
    });
  }

  private _lineItemFilter(lineItem: MarketplaceLineItemInterface): boolean {
    if (this.targetType === MarketplaceFeedbackTargetType.SELLER) {
      // The current user is rating the seller. They can do it for line items for which they have offers in the
      // accepted or rejected status. This implies that they interacted with the seller.
      return lineItem.offers.some(offer =>
        offer.user === this.user.id &&
        (
          offer.status === MarketplaceOfferStatus.ACCEPTED ||
          offer.status === MarketplaceOfferStatus.REJECTED
        ));
    } else {
      // The current user is rating the buyer. They can do it for line items for which they have offers in the
      // accepted or retracted status. This implies that they interacted with the buyer.
      return lineItem.offers.some(offer =>
        offer.user === this.user.id &&
        (
          offer.status === MarketplaceOfferStatus.ACCEPTED ||
          offer.status === MarketplaceOfferStatus.RETRACTED
        ));
    }
  }

  private _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      this.fields = this.listing.lineItems
        .filter(lineItem => this._lineItemFilter(lineItem))
        .map((lineItem, index) => {
          const options = [
            {
              value: MarketplaceFeedbackValue.POSITIVE,
              icon: "smile",
              label: this.translateService.instant("Positive")
            },
            {
              value: MarketplaceFeedbackValue.NEUTRAL,
              icon: "meh",
              label: this.translateService.instant("Neutral")
            },
            {
              value: MarketplaceFeedbackValue.NEGATIVE,
              icon: "frown",
              label: this.translateService.instant("Negative")
            }
          ];

          const feedbackField = (key: string, label: string, className: string): FormlyFieldConfig => ({
            key,
            type: "ng-select",
            wrappers: ["default-wrapper"],
            className,
            props: {
              label,
              required: true,
              options,
              hideOptionalMarker: true,
              hideLabel: index > 0,
              clearable: false,
              searchable: false,
              optionTemplate: this.feedbackOptionTemplate
            },
            expressions: {
              "props.description": () => {
                if (this._feedbackIsTooOld(key)) {
                  return this.translateService.instant(
                    "Feedback older than {{0}} days cannot be changed.", { 0: 60 }
                  );
                }
              },
              "props.disabled": () => this._feedbackIsTooOld(key)
            }
          });

          const fields: FormlyFieldConfig = {
            key: "",
            fieldGroupClassName: "row feedback-line-item",
            fieldGroup: [
              {
                key: `recipient-${lineItem.id}`,
                type: "input",
                className: "hidden"
              },
              {
                key: `lineItemId-${lineItem.id}`,
                type: "input",
                className: "hidden"
              },
              {
                key: `itemName-${lineItem.id}`,
                type: "html",
                wrappers: ["default-wrapper"],
                className: "col-4 item-name",
                template: lineItem.itemName || lineItem.itemPlainText,
                props: {
                  label: this.translateService.instant("Item"),
                  readonly: true,
                  tabindex: -1,
                  hideOptionalMarker: true,
                  hideLabel: index > 0
                }
              },
              {
                key: `communicationCreated-${lineItem.id}`,
                type: "input",
                className: "hidden"
              },
              {
                key: `speedCreated-${lineItem.id}`,
                type: "input",
                className: "hidden"
              },
              {
                key: `accuracyCreated-${lineItem.id}`,
                type: "input",
                className: "hidden"
              },
              {
                key: `packagingCreated-${lineItem.id}`,
                type: "input",
                className: "hidden"
              }

            ]
          };

          const communication = feedbackField(
            `communication-${lineItem.id}`,
            this.translateService.instant("Communication"),
            this.targetType === MarketplaceFeedbackTargetType.SELLER ? "col-2" : "col-4"
          );
          const speedOfDelivery = feedbackField(
            `speed-${lineItem.id}`,
            this.translateService.instant("Speed of delivery"),
            "col-2"
          );
          const speedOfPayment = feedbackField(
            `speed-${lineItem.id}`,
            this.translateService.instant("Speed of payment"),
            "col-4"
          );
          const accuracy = feedbackField(
            `accuracy-${lineItem.id}`,
            this.translateService.instant("Accuracy of item descriptions"),
            "col-2"
          );
          const packaging = feedbackField(
            `packaging-${lineItem.id}`,
            this.translateService.instant("Packaging quality"),
            "col-2"
          );

          if (this.targetType === MarketplaceFeedbackTargetType.SELLER) {
            fields.fieldGroup.push(communication);
            fields.fieldGroup.push(speedOfDelivery);
            fields.fieldGroup.push(accuracy);
            fields.fieldGroup.push(packaging);
          } else {
            fields.fieldGroup.push(communication);
            fields.fieldGroup.push(speedOfPayment);
          }

          return fields;
        });

      this._initializeFormValue(currentUser);
    });
  }

  private _initializeFormValue(currentUser: UserInterface): void {
    const value = {};

    this.listing.lineItems
      .filter(lineItem => this._lineItemFilter(lineItem))
      .forEach(lineItem => {
        value[`recipient-${lineItem.id}`] = this.user.id;
        value[`lineItemId-${lineItem.id}`] = lineItem.id;
        value[`itemName-${lineItem.id}`] = lineItem.itemName || lineItem.itemPlainText;

        lineItem.feedbacks
          .filter(feedback => feedback.user === currentUser.id)
          .forEach(feedback => {
            if (feedback.category === MarketplaceFeedbackCategory.COMMUNICATION) {
              value[`communication-${lineItem.id}`] = feedback.value;
              value[`communicationCreated-${lineItem.id}`] = feedback.created;
            } else if (feedback.category === MarketplaceFeedbackCategory.SPEED) {
              value[`speed-${lineItem.id}`] = feedback.value;
              value[`speedCreated-${lineItem.id}`] = feedback.created;
            } else if (feedback.category === MarketplaceFeedbackCategory.ACCURACY) {
              value[`accuracy-${lineItem.id}`] = feedback.value;
              value[`accuracyCreated-${lineItem.id}`] = feedback.created;
            } else if (feedback.category === MarketplaceFeedbackCategory.PACKAGING) {
              value[`packaging-${lineItem.id}`] = feedback.value;
              value[`packagingCreated-${lineItem.id}`] = feedback.created;
            }
          });
      });

    this.model = value;
  }

  private _feedbackIsTooOld(key: string): boolean {
    const [categoryKey, lineItemId] = key.split("-");
    const created = this.model[`${categoryKey}Created-${lineItemId}`];
    const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));

    return created && new Date(created) < sixtyDaysAgo;
  }
}
