import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { LoadingService } from "@shared/services/loading.service";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import {
  EquipmentActionTypes,
  MarkMarketplaceLineItemAsSold,
  MarkMarketplaceLineItemAsSoldSuccess
} from "@features/equipment/store/equipment.actions";
import { filter, take } from "rxjs/operators";
import { forkJoin } from "rxjs";

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

  title: string = this.translateService.instant("Mark line items as sold");

  helpText: string = this.translateService.instant(
    "Select the items that you have sold. AstroBin considers an item as sold when you have received payment and " +
    "shipped it to the buyer."
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

    const selectedLineItemIds = Object.keys(this.form.value).filter(
      key => this.form.value[key]
    ).map(
      key => key.replace("checkbox-", "")
    ).map(
      id => parseInt(id, 10)
    );

    const selectedLineItems = this.listing.lineItems.filter(
      lineItem => selectedLineItemIds.includes(lineItem.id)
    );

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

    forkJoin(successObservables$).pipe(
      take(1)
    ).subscribe(() => {
      this.modal.close();
      this.loadingService.setLoading(false);
      this.popNotificationsService.success("Line items marked as sold.");
    });

    forkJoin(failureObservables$).pipe(
      take(1)
    ).subscribe(() => {
      this.modal.close();
      this.loadingService.setLoading(false);
      this.popNotificationsService.error("Error while marking line items as sold.");
    });

    this.loadingService.setLoading(true);

    selectedLineItems.forEach(lineItem => {
      this.store$.dispatch(new MarkMarketplaceLineItemAsSold({ lineItem }));
    });
  }

  _initFields() {
    this.fields = this.listing.lineItems.map((lineItem, index) => ({
      key: "",
      fieldGroup: [
        {
          key: `checkbox-${lineItem.id}`,
          type: "toggle",
          wrappers: ["default-wrapper"],
          defaultValue: false,
          expressions: {
            className: () => !!lineItem.sold ? "hidden" : "toggle"
          },
          props: {
            toggleLabel: lineItem.itemName,
            hideOptionalMarker: true
          }
        }
      ]
    }));
  }
}
