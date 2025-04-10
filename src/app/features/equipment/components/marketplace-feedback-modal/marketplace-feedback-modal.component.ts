import type { AfterViewInit } from "@angular/core";
import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { CreateMarketplaceFeedback, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import {
  MarketplaceFeedbackTargetType,
  MarketplaceFeedbackValue
} from "@features/equipment/types/marketplace-feedback.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-feedback-modal",
  templateUrl: "./marketplace-feedback-modal.component.html",
  styleUrls: ["./marketplace-feedback-modal.component.scss"]
})
export class MarketplaceFeedbackModalComponent extends BaseComponentDirective implements AfterViewInit {
  readonly sellerCols = "col-12 col-lg-6";
  readonly buyerCols = "col-12 col-lg-6";

  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  user: UserInterface;

  @Input()
  targetType: MarketplaceFeedbackTargetType;

  @ViewChild("feedbackOptionTemplate")
  feedbackOptionTemplate: TemplateRef<any>;

  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[];
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
    public readonly store$: Store<MainState>,
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
      filter((action: any) => action.payload.feedback.listing === feedback.listing),
      take(1)
    );

    const failureObservable$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_FAILURE),
      filter((action: any) => action.payload.feedback.listing === feedback.listing),
      take(1)
    );

    successObservable$.pipe(take(1)).subscribe(() => {
      this.loadingService.setLoading(false);
      this.modal.close();
      this.popNotificationsService.success(this.translateService.instant("Feedback saved successfully. Thank you!"));
    });

    failureObservable$.pipe(take(1)).subscribe(() => {
      this.loadingService.setLoading(false);
      this.popNotificationsService.error(this.translateService.instant("An error occurred while saving the feedback."));
    });

    this.loadingService.setLoading(true);

    this.store$.dispatch(new CreateMarketplaceFeedback({ feedback }));
  }

  private _initFields() {
    const options = [
      {
        value: MarketplaceFeedbackValue.POSITIVE,
        icon: "smile",
        label: this.equipmentMarketplaceService.humanizeFeedbackValue(MarketplaceFeedbackValue.POSITIVE)
      },
      {
        value: MarketplaceFeedbackValue.NEUTRAL,
        icon: "meh",
        label: this.equipmentMarketplaceService.humanizeFeedbackValue(MarketplaceFeedbackValue.NEUTRAL)
      },
      {
        value: MarketplaceFeedbackValue.NEGATIVE,
        icon: "frown",
        label: this.equipmentMarketplaceService.humanizeFeedbackValue(MarketplaceFeedbackValue.NEGATIVE)
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
          if (this._feedbackIsTooOld()) {
            return this.translateService.instant("Feedback older than {{0}} days cannot be changed.", { "0": 60 });
          }
        },
        "props.disabled": () => this._feedbackIsTooOld()
      }
    });

    const messageField = (): FormlyFieldConfig => ({
      key: `message`,
      type: "textarea",
      wrappers: ["default-wrapper"],
      className: "col-12",
      props: {
        label: this.translateService.instant("Feedback message"),
        rows: 3
      }
    });

    const communication = feedbackField(
      `communicationValue`,
      this.translateService.instant("Communication"),
      this.targetType === MarketplaceFeedbackTargetType.SELLER ? this.sellerCols : this.buyerCols
    );

    const speedOfDelivery = feedbackField(
      `speedValue`,
      this.translateService.instant("Speed of delivery"),
      this.sellerCols
    );

    const speedOfPayment = feedbackField(
      `speedValue`,
      this.translateService.instant("Speed of payment"),
      this.buyerCols
    );

    const accuracy = feedbackField(
      `accuracyValue`,
      this.translateService.instant("Accuracy of item descriptions"),
      this.sellerCols
    );

    const packaging = feedbackField(
      `packagingValue`,
      this.translateService.instant("Packaging quality"),
      this.sellerCols
    );

    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      this.fields = [
        {
          key: "",
          fieldGroupClassName: "row",
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
              key: `listing`,
              type: "input",
              className: "hidden"
            }
          ]
        }
      ];

      if (this.targetType === MarketplaceFeedbackTargetType.SELLER) {
        this.fields[0].fieldGroup.push(communication);
        this.fields[0].fieldGroup.push(speedOfDelivery);
        this.fields[0].fieldGroup.push(accuracy);
        this.fields[0].fieldGroup.push(packaging);
      } else {
        this.fields[0].fieldGroup.push(communication);
        this.fields[0].fieldGroup.push(speedOfPayment);
      }

      this.fields[0].fieldGroup.push(messageField());

      this._initializeFormValue(currentUser);
    });
  }

  private _initializeFormValue(currentUser: UserInterface): void {
    const value = {};

    value[`recipient`] = this.user.id;
    value[`listing`] = this.listing.id;

    this.listing.feedbacks
      .filter(feedback => feedback.user === currentUser.id)
      .forEach(feedback => {
        value[`communicationValue`] = feedback.communicationValue;
        value[`speedValue`] = feedback.speedValue;
        value[`accuracyValue`] = feedback.accuracyValue;
        value[`packagingValue`] = feedback.packagingValue;
        value[`message`] = feedback.message;
        value[`createdValue`] = feedback.created;
      });

    this.model = value;
  }

  private _feedbackIsTooOld(): boolean {
    const created = this.model.created;
    const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));

    return created && new Date(created) < sixtyDaysAgo;
  }
}
