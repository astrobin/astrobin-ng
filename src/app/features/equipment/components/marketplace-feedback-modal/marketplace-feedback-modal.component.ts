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
  MarketplaceFeedbackTargetType,
  MarketplaceFeedbackValue
} from "@features/equipment/types/marketplace-feedback.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { CreateMarketplaceFeedback, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";

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
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngAfterViewInit(): void {
    this._initFields();
  }

  saveFeedback(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(this.fields, this.popNotificationsService, this.translateService);
      return;
    }

    const feedback = this.form.value;

    const successObservable$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_SUCCESS),
      filter((action: any) => action.payload.feedback.lineItem === feedback.lineItem),
      take(1)
    );

    const failureObservable$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_FAILURE),
      filter((action: any) => action.payload.feedback.lineItem === feedback.lineItem),
      take(1)
    );

    successObservable$
      .pipe(take(1))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
        this.popNotificationsService.success(this.translateService.instant("Feedback saved successfully. Thank you!"));
      });

    failureObservable$
      .pipe(take(1))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(
          this.translateService.instant("An error occurred while saving the feedback.")
        );
      });

    this.loadingService.setLoading(true);

    this.store$.dispatch(new CreateMarketplaceFeedback({ feedback }));
  }

  private _lineItemFilter(lineItem: MarketplaceLineItemInterface, currentUser: UserInterface): boolean {
    return this.equipmentMarketplaceService.allowLeavingFeedbackToLineItem(lineItem, currentUser.id, this.user.id);
  }

  private _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      this.fields = this.listing.lineItems
        .filter(lineItem => this._lineItemFilter(lineItem, currentUser))
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
              clearable: false,
              searchable: false,
              optionTemplate: this.feedbackOptionTemplate
            },
            expressions: {
              "props.description": () => {
                if (this._feedbackIsTooOld(key)) {
                  return this.translateService.instant("Feedback older than {{0}} days cannot be changed.", { 0: 60 });
                }
              },
              "props.disabled": () => this._feedbackIsTooOld(key)
            }
          });

          const messageField = (lineItemId: MarketplaceLineItemInterface["id"]): FormlyFieldConfig => ({
            key: `message`,
            type: "textarea",
            className: "col-12",
            props: {
              label: this.translateService.instant("Feedback message"),
              rows: 3
            }
          });

          const fields: FormlyFieldConfig = {
            key: "",
            fieldGroupClassName: "row feedback-line-item",
            fieldGroup: [
              {
                key: "created",
                type: "input",
                className: "hidden"
              },
              {
                key: `recipient`,
                type: "input",
                className: "hidden"
              },
              {
                key: `lineItem`,
                type: "input",
                className: "hidden"
              },
              {
                key: `itemName`,
                type: "html",
                wrappers: ["default-wrapper"],
                className: "col-4 item-name",
                template: lineItem.itemName || lineItem.itemPlainText,
                props: {
                  label: this.translateService.instant("Item"),
                  readonly: true,
                  tabindex: -1,
                  hideOptionalMarker: true
                }
              }
            ]
          };

          const communication = feedbackField(
            `communicationValue`,
            this.translateService.instant("Communication"),
            this.targetType === MarketplaceFeedbackTargetType.SELLER ? "col-2" : "col-4"
          );
          const speedOfDelivery = feedbackField(
            `speedValue`,
            this.translateService.instant("Speed of delivery"),
            "col-2"
          );
          const speedOfPayment = feedbackField(
            `speedValue`,
            this.translateService.instant("Speed of payment"),
            "col-4"
          );
          const accuracy = feedbackField(
            `accuracyValue`,
            this.translateService.instant("Accuracy of item descriptions"),
            "col-2"
          );
          const packaging = feedbackField(
            `packagingValue`,
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

          fields.fieldGroup.push(messageField(lineItem.id));

          return fields;
        });

      this._initializeFormValue(currentUser);
    });
  }

  private _initializeFormValue(currentUser: UserInterface): void {
    const value = {};

    this.listing.lineItems
      .filter(lineItem => this._lineItemFilter(lineItem, currentUser))
      .forEach(lineItem => {
        value[`recipient`] = this.user.id;
        value[`lineItem`] = lineItem.id;
        value[`itemName`] = lineItem.itemName || lineItem.itemPlainText;

        lineItem.feedbacks
          .filter(feedback => feedback.user === currentUser.id)
          .forEach(feedback => {
            value[`communicationValue`] = feedback.communicationValue;
            value[`speedValue`] = feedback.speedValue;
            value[`accuracyValue`] = feedback.accuracyValue;
            value[`packagingValue`] = feedback.packagingValue;
            value[`message`] = feedback.message;
            value[`createdValue`] = feedback.created;
          });
      });

    this.model = value;
  }

  private _feedbackIsTooOld(key: string): boolean {
    const created = this.model["created"];
    const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));

    return created && new Date(created) < sixtyDaysAgo;
  }
}
