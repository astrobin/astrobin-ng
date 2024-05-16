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
  MarketplaceFeedbackValue
} from "@features/equipment/types/marketplace-feedback.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { CreateMarketplaceFeedback, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { forkJoin } from "rxjs";

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

  @ViewChild("feedbackOptionTemplate")
  feedbackOptionTemplate: TemplateRef<any>;

  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];

  title: string = this.translateService.instant("Provide feedback");

  rulesText = this.translateService.instant(
    "Please be truthful and honest when providing feedback after a transaction, and make sure you respect the " +
    "{{0}}terms and conditions{{1}} of the AstroBin marketplace.",
    {
      0: "<a href='https://welcome.astrobin.com/features/marketplace-terms-of-service' target='_blank'>",
      1: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngAfterViewInit(): void {
    this._initFields();
  }

  saveFeedback(): void {
    function transformToFeedbackList(input: { [key: string]: string | undefined }): MarketplaceFeedbackInterface[] {
      const feedbackList: MarketplaceFeedbackInterface[] = [];

      // Loop through each key in the input object
      for (const key in input) {
        const [categoryKey, lineItemId] = key.split("-"); // Split key to category and ID
        if (UtilsService.isValidEnumValue(categoryKey.toUpperCase(), MarketplaceFeedbackCategory)) {
          const feedback: MarketplaceFeedbackInterface = {
            lineItem: parseInt(lineItemId),
            value: MarketplaceFeedbackValue[input[key] as keyof typeof MarketplaceFeedbackValue],
            category: MarketplaceFeedbackCategory[categoryKey.toUpperCase() as keyof typeof MarketplaceFeedbackCategory]
          };
          feedbackList.push(feedback);
        }
      }

      return feedbackList;
    }

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

    forkJoin(successObservables$).pipe(
      take(1)
    ).subscribe(() => {
      this.loadingService.setLoading(false);
      this.modal.close();
      this.popNotificationsService.success(this.translateService.instant("Feedback saved successfully. Thank you!"));
    });

    forkJoin(failureObservables$).pipe(
      take(1)
    ).subscribe(() => {
      this.loadingService.setLoading(false);
      this.popNotificationsService.error(this.translateService.instant("An error occurred while saving the feedback."));
    });

    this.loadingService.setLoading(true);

    feedbackList.forEach(feedback => {
      this.store$.dispatch(new CreateMarketplaceFeedback({ feedback }));
    });
  }

  _initFields() {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      this.fields = this.listing.lineItems
        .filter(lineItem => lineItem.soldTo === currentUser.id)
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

          const feedbackField = (key: string, label: string) => ({
            key,
            type: "ng-select",
            wrappers: ["default-wrapper"],
            className: "col-2",
            props: {
              label,
              required: true,
              options,
              hideOptionalMarker: true,
              hideLabel: index > 0,
              clearable: false,
              searchable: false,
              optionTemplate: this.feedbackOptionTemplate
            }
          });

          return {
            key: "",
            fieldGroupClassName: "row feedback-line-item",
            fieldGroup: [
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
                template: lineItem.itemName,
                props: {
                  label: this.translateService.instant("Item"),
                  readonly: true,
                  hideOptionalMarker: true,
                  hideLabel: index > 0
                }
              },
              feedbackField(`communication-${lineItem.id}`, this.translateService.instant("Communication")),
              feedbackField(`speed-${lineItem.id}`, this.translateService.instant("Speed of delivery")),
              feedbackField(`accuracy-${lineItem.id}`, this.translateService.instant("Accuracy of item descriptions")),
              feedbackField(`packaging-${lineItem.id}`, this.translateService.instant("Packaging quality"))
            ]
          };
        });
    });
  }
}
