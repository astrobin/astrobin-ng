import { OnInit, Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { GetAvailableSubscriptions, GetPricing } from "@features/subscriptions/store/subscriptions.actions";
import { selectAvailableSubscriptions, selectPricing } from "@features/subscriptions/store/subscriptions.selectors";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-subscriptions-options-page",
  templateUrl: "./subscriptions-options-page.component.html",
  styleUrls: ["./subscriptions-options-page.component.scss"]
})
export class SubscriptionsOptionsPageComponent extends BaseComponentDirective implements OnInit {
  litePricing$: Observable<{ [recurringUnit: string]: PricingInterface }> = this.store$
    .select(selectPricing)
    .pipe(map(pricing => pricing[PayableProductInterface.LITE]));
  premiumPricing$: Observable<{ [recurringUnit: string]: PricingInterface }> = this.store$
    .select(selectPricing)
    .pipe(map(pricing => pricing[PayableProductInterface.PREMIUM]));
  ultimatePricing$: Observable<{ [recurringUnit: string]: PricingInterface }> = this.store$
    .select(selectPricing)
    .pipe(map(pricing => pricing[PayableProductInterface.ULTIMATE]));
  availableSubscriptions$: Observable<AvailableSubscriptionsInterface> =
    this.store$.select(selectAvailableSubscriptions);

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translate.instant("Subscription plans");
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [{ label: "Subscriptions" }, { label: title }] }));

    this.store$.dispatch(new GetAvailableSubscriptions());

    this.subscriptionsService.currency$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.LITE,
          recurringUnit: RecurringUnit.MONTHLY
        })
      );
      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.LITE,
          recurringUnit: RecurringUnit.YEARLY
        })
      );

      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.PREMIUM,
          recurringUnit: RecurringUnit.MONTHLY
        })
      );
      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.PREMIUM,
          recurringUnit: RecurringUnit.YEARLY
        })
      );

      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.ULTIMATE,
          recurringUnit: RecurringUnit.MONTHLY
        })
      );
      this.store$.dispatch(
        new GetPricing({
          product: PayableProductInterface.ULTIMATE,
          recurringUnit: RecurringUnit.YEARLY
        })
      );
    });
  }
}
