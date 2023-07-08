import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { PaymentsApiService } from "@features/subscriptions/services/payments-api.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "@shared/constants";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import * as countryJs from "country-js";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, switchMap, take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import { selectBackendConfig, selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";

@Injectable({
  providedIn: "root"
})
export class SubscriptionsService {
  readonly DEFAULT_CURRENCY = "USD";

  currency: string;
  stripeCustomerPortalUrl$: Observable<string> = this.store$.select(selectBackendConfig).pipe(
    switchMap(config => this.store$.select(selectCurrentUserProfile).pipe(filter(profile => !!profile), map(profile => ({
      config,
      profile
    })))),
    map(
      ({ config, profile }) =>
        `https://billing.stripe.com/p/login/${config.STRIPE_CUSTOMER_PORTAL_KEY}?prefilled_email=${profile.email}`
    )
  );
  payPalCustomerPortalUrl = "https://www.paypal.com/myaccount/autopay/";
  private _currencySubject = new BehaviorSubject<string>(this.DEFAULT_CURRENCY);
  currency$: Observable<string> = this._currencySubject.asObservable();

  constructor(
    public readonly store$: Store<State>,
    public readonly translate: TranslateService,
    public readonly paymentsApiService: PaymentsApiService,
    public readonly utilsService: UtilsService
  ) {
    this.store$
      .select(selectRequestCountry)
      .pipe(
        filter(requestCountry => !!requestCountry),
        take(1)
      )
      .subscribe(requestCountry => {
        const results = countryJs.search(requestCountry);

        if (results.length !== 0) {
          this.currency = results[0].currency.currencyCode;
        }

        if (Constants.SUPPORTED_CURRENCIES.indexOf(this.currency) === -1) {
          this.currency = this.DEFAULT_CURRENCY;
        }

        this._currencySubject.next(this.currency);
      });
  }

  get supportsCardPaymentType(): boolean {
    return true;
  }

  get supportsSepaDebitPaymentType(): boolean {
    return this.currency === "EUR";
  }

  get supportsAliPayPaymentType(): boolean {
    return this.currency === "CNY";
  }

  getName(product: PayableProductInterface): string {
    const resultMap = {
      [PayableProductInterface.LITE]: "Lite",
      [PayableProductInterface.PREMIUM]: "Premium",
      [PayableProductInterface.ULTIMATE]: "Ultimate"
    };

    return resultMap[product];
  }

  getPrice(product: PayableProductInterface, recurringUnit: RecurringUnit): Observable<PricingInterface> {
    if (!this.currency) {
      return new Observable<PricingInterface>(observer => {
        this.utilsService.delay(100).subscribe(() => {
          this.getPrice(product, recurringUnit).subscribe(price => {
            observer.next(price);
            observer.complete();
          });
        });
      });
    }

    const observables = {
      [PayableProductInterface.LITE]: this.paymentsApiService.getPrice(
        PayableProductInterface.LITE,
        this.currency,
        recurringUnit
      ),
      [PayableProductInterface.PREMIUM]: this.paymentsApiService.getPrice(
        PayableProductInterface.PREMIUM,
        this.currency,
        recurringUnit
      ),
      [PayableProductInterface.ULTIMATE]: this.paymentsApiService.getPrice(
        PayableProductInterface.ULTIMATE,
        this.currency,
        recurringUnit
      )
    };

    return observables[product];
  }

  getSameTier(product: PayableProductInterface): SubscriptionName[] {
    const resultMap = {
      [PayableProductInterface.LITE]: [
        SubscriptionName.ASTROBIN_LITE,
        SubscriptionName.ASTROBIN_LITE_AUTORENEW,
        SubscriptionName.ASTROBIN_LITE_2020,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
      ],
      [PayableProductInterface.PREMIUM]: [
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
      ],
      [PayableProductInterface.ULTIMATE]: [
        SubscriptionName.ASTROBIN_ULTIMATE_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
      ]
    };

    return resultMap[product];
  }

  getHigherTier(product: PayableProductInterface): SubscriptionName[] {
    const resultMap = {
      [PayableProductInterface.LITE]: [
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
        SubscriptionName.ASTROBIN_ULTIMATE_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
      ],
      [PayableProductInterface.PREMIUM]: [
        SubscriptionName.ASTROBIN_ULTIMATE_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
      ],
      [PayableProductInterface.ULTIMATE]: []
    };

    return resultMap[product];
  }

  getLowerTier(product: PayableProductInterface): SubscriptionName[] {
    const resultMap = {
      [PayableProductInterface.LITE]: [],
      [PayableProductInterface.PREMIUM]: [
        SubscriptionName.ASTROBIN_LITE,
        SubscriptionName.ASTROBIN_LITE_AUTORENEW,
        SubscriptionName.ASTROBIN_LITE_2020,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
      ],
      [PayableProductInterface.ULTIMATE]: [
        SubscriptionName.ASTROBIN_LITE,
        SubscriptionName.ASTROBIN_LITE_AUTORENEW,
        SubscriptionName.ASTROBIN_LITE_2020,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
        SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
      ]
    };

    return resultMap[product];
  }

  hasPayPalAutorenewingSubscription$(): Observable<boolean> {
    return this.store$.pipe(
      take(1),
      map(state => {
        for (const subscriptionName of [
          SubscriptionName.ASTROBIN_LITE_AUTORENEW,
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
        ]) {
          const subscription: SubscriptionInterface = state.app.subscriptions.filter(
            s => s.name === subscriptionName
          )[0];

          if (
            subscription &&
            state.auth.userSubscriptions.filter(userSubscription => {
              return userSubscription.subscription === subscription.id;
            }).length > 0
          ) {
            return true;
          }
        }

        return false;
      })
    );
  }

  hasStripeAutorenewingSubscription$(): Observable<boolean> {
    return this.store$.pipe(
      take(1),
      map(state => {
        for (const subscriptionName of [
          SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
        ]) {
          const subscription: SubscriptionInterface = state.app.subscriptions.filter(
            s => s.name === subscriptionName
          )[0];

          if (
            subscription &&
            state.auth.userSubscriptions.filter(userSubscription => {
              return userSubscription.subscription === subscription.id;
            }).length > 0
          ) {
            return true;
          }
        }

        return false;
      })
    );
  }

  getConversionId(product: PayableProductInterface): string {
    const resultMap = {
      [PayableProductInterface.LITE]: "LddRCIuvv-EBEJS5qawC",
      [PayableProductInterface.PREMIUM]: "-0o-CKetv-EBEJS5qawC",
      [PayableProductInterface.ULTIMATE]: "pDXJCMvpo-EBEJS5qawC"
    };

    return resultMap[product];
  }

  maxUploadsMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} uploads", { max });
  }

  maxImagesMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} total images", { max });
  }

  maxSizeMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} MB / image", { max });
  }

  maxRevisionsMessage(max: number): string {
    return this.translate.instant("{{ max }} revisions / image", { max });
  }
}
