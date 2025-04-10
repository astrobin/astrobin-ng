import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { UserSubscriptionServiceInterface } from "@core/services/user-subscription/user-subscription.service-interface";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { selectAuth, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, forkJoin, zip, Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UserSubscriptionService extends BaseService implements UserSubscriptionServiceInterface {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  getUpgradeMessage$(product: PayableProductInterface): Observable<string> {
    return this.store$.select(selectCurrentUserProfile).pipe(
      switchMap(userProfile =>
        combineLatest([
          this.hasValidSubscription$(userProfile, [SubscriptionName.ASTROBIN_LITE, SubscriptionName.ASTROBIN_PREMIUM]),
          this.hasValidSubscription$(userProfile, [
            SubscriptionName.ASTROBIN_LITE_AUTORENEW,
            SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
          ]),
          this.hasValidSubscription$(userProfile, [
            SubscriptionName.ASTROBIN_LITE_2020,
            SubscriptionName.ASTROBIN_PREMIUM_2020,
            SubscriptionName.ASTROBIN_ULTIMATE_2020
          ]),
          this.hasValidSubscription$(userProfile, [
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
          ])
        ])
      ),
      map(
        ([
          hasNonRecurringPayPalSubscription,
          hasRecurringPayPalSubscription,
          hasNonRecurringStripeSubscription,
          hasRecurringStripeSubscription
        ]) => {
          if (
            (hasNonRecurringStripeSubscription ||
              hasRecurringPayPalSubscription ||
              hasNonRecurringPayPalSubscription) &&
            !hasRecurringStripeSubscription
          ) {
            return this.translateService.instant(
              "AstroBin doesn't support pro-rated subscription upgrades for customers with a non-recurring " +
                "subscription or a subscription purchased via PayPal, but we're happy to make it happen manually. If " +
                "you're on a lower subscription tier and would like to upgrade to <strong>{{0}}</strong>, please just " +
                "subscribe using the button below, and then contact us at {{1}} to get a credit for the unused time on " +
                "your old subscription. Thanks!",
              {
                0: this.subscriptionsService.getName(product),
                1: `<a href="mailto:support@astrobin.com">support@astrobin.com</a>`
              }
            );
          } else {
            return this.translateService.instant(
              "AstroBin couldn't recognize your subscription and this shouldn't happen. Please contact us at " +
                "{{0}} so we can investigate, thanks!",
              {
                0: `<a href="mailto:support@astrobin.com">support@astrobin.com</a>`
              }
            );
          }
        }
      )
    );
  }

  upgradeAllowed$(): Observable<boolean> {
    return this.store$
      .select(selectCurrentUserProfile)
      .pipe(
        switchMap(userProfile =>
          this.hasValidSubscription$(userProfile, [
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
          ])
        )
      );
  }

  hasValidSubscription$(_userProfile: UserProfileInterface, subscriptionNames: SubscriptionName[]): Observable<boolean> {
    return this.store$.pipe(
      take(1),
      map(state => {
        for (const subscriptionName of subscriptionNames) {
          const subscription: SubscriptionInterface = state.app.subscriptions.filter(
            s => s.name === subscriptionName
          )[0];

          if (
            subscription &&
            state.auth.userSubscriptions.filter(userSubscription => {
              const expiration = new Date(userSubscription.expires);
              expiration.setUTCHours(23, 59, 59, 999);
              return (
                userSubscription.subscription === subscription.id && userSubscription.active && expiration >= new Date()
              );
            }).length > 0
          ) {
            return true;
          }
        }

        return false;
      })
    );
  }

  getActiveUserSubscription$(
    _userProfile: UserProfileInterface,
    subscriptionName: SubscriptionName
  ): Observable<UserSubscriptionInterface | null> {
    return this.store$.pipe(
      take(1),
      map(state => {
        const subscription: SubscriptionInterface = state.app.subscriptions.filter(s => s.name === subscriptionName)[0];

        if (!subscription) {
          return null;
        }

        const userSubscriptions = state.auth.userSubscriptions.filter(userSubscription => {
          return userSubscription.subscription === subscription.id && userSubscription.active;
        });

        if (userSubscriptions.length > 0) {
          return userSubscriptions[0];
        }

        return null;
      })
    );
  }

  uploadAllowed$(): Observable<boolean> {
    return this.store$.pipe(
      take(1),
      switchMap(state =>
        zip(
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_ULTIMATE_2020,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_PREMIUM,
            SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
            SubscriptionName.ASTROBIN_PREMIUM_2020,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
          ]),
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_LITE_2020,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
          ]),
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_LITE,
            SubscriptionName.ASTROBIN_LITE_AUTORENEW
          ])
        ).pipe(
          map(([isUltimateOrPremium, isLite2020, isLite]) => ({
            premiumCounter: state.auth.userProfile.premiumCounter,
            backendConfig: state.app.backendConfig,
            isUltimateOrPremium,
            isLite2020,
            isLite
          }))
        )
      ),
      map(({ premiumCounter, backendConfig, isUltimateOrPremium, isLite2020, isLite }) => {
        if (isUltimateOrPremium) {
          return true;
        }

        if (isLite2020) {
          return premiumCounter < backendConfig.PREMIUM_MAX_IMAGES_LITE_2020;
        }

        if (isLite) {
          return premiumCounter < backendConfig.PREMIUM_MAX_IMAGES_LITE;
        }

        // If we got here, the user is on Free.
        return premiumCounter < backendConfig.PREMIUM_MAX_IMAGES_FREE_2020;
      })
    );
  }

  fullSearchAllowed$(): Observable<boolean> {
    return this.store$.select(selectAuth).pipe(
      take(1),
      map(auth => auth.userProfile),
      switchMap(userProfile =>
        this.hasValidSubscription$(userProfile, [
          SubscriptionName.ASTROBIN_ULTIMATE_2020,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
        ])
      )
    );
  }

  isDonor$(): Observable<boolean> {
    return this.store$.select(selectCurrentUserProfile).pipe(
      take(1),
      switchMap(userProfile =>
        this.hasValidSubscription$(userProfile, [
          SubscriptionName.ASTROBIN_DONOR_COFFEE_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_SNACK_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_PIZZA_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_MOVIE_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_DINNER_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_BRONZE_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_SILVER_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_GOLD_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_PLATINUM_MONTHLY,
          SubscriptionName.ASTROBIN_DONOR_COFFEE_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_SNACK_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_PIZZA_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_MOVIE_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_DINNER_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_BRONZE_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_SILVER_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_GOLD_YEARLY,
          SubscriptionName.ASTROBIN_DONOR_PLATINUM_YEARLY
        ])
      )
    );
  }

  displayAds$(): Observable<boolean> {
    const isDonor$ = this.isDonor$();
    const isClassicLite$ = this.isClassicLite$();
    const isClassicPremium$ = this.isClassicPremium$();
    const isPremium$ = this.isPremium$();
    const isUltimate$ = this.isUltimate$();
    const allowAstronomyAds$ = this.store$
      .select(selectCurrentUserProfile)
      .pipe(map(userProfile => userProfile && userProfile.allowAstronomyAds));

    return combineLatest([
      isDonor$,
      isClassicLite$,
      isClassicPremium$,
      isPremium$,
      isUltimate$,
      allowAstronomyAds$
    ]).pipe(
      map(([isDonor, isClassicLite, isClassicPremium, isPremium, isUltimate, allowAstronomyAds]) => {
        if (isDonor || isClassicLite || isClassicPremium) {
          // Donors, Classic Lite, and Classic Premium users never see ads
          return false;
        }

        if ((isPremium || isUltimate) && allowAstronomyAds) {
          // Premium and Ultimate users only see ads if allowAstronomyAds is true
          return true;
        }

        if (isPremium || isUltimate) {
          // Premium and Ultimate users, without astronomy ads permission, do not see ads
          return false;
        }

        // All other users see ads
        return true;
      })
    );
  }

  canRemoveAds$(): Observable<boolean> {
    return this.store$.select(selectCurrentUserProfile).pipe(
      take(1),
      switchMap(userProfile =>
        this.hasValidSubscription$(userProfile, [
          SubscriptionName.ASTROBIN_LITE,
          SubscriptionName.ASTROBIN_PREMIUM,
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
          SubscriptionName.ASTROBIN_PREMIUM_2020,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
        ])
      )
    );
  }

  canCreateMarketplaceListing$(): Observable<boolean> {
    return this.store$.select(selectCurrentUserProfile).pipe(
      take(1),
      switchMap(userProfile =>
        this.hasValidSubscription$(userProfile, [
          SubscriptionName.ASTROBIN_LITE,
          SubscriptionName.ASTROBIN_LITE_AUTORENEW,
          SubscriptionName.ASTROBIN_LITE_2020,
          SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_PREMIUM,
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
          SubscriptionName.ASTROBIN_PREMIUM_2020,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
          SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
        ])
      )
    );
  }

  canPlateSolve$(): Observable<boolean> {
    return this.isFree$().pipe(map(isFree => !isFree));
  }

  canPlateSolveAdvanced$(): Observable<boolean> {
    return this.isUltimate$();
  }

  fileSizeAllowed(size: number): Observable<{ allowed: boolean; max: number }> {
    return this.store$.pipe(
      take(1),
      switchMap(state =>
        zip(
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_ULTIMATE_2020,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
            SubscriptionName.ASTROBIN_PREMIUM,
            SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
            SubscriptionName.ASTROBIN_LITE,
            SubscriptionName.ASTROBIN_LITE_AUTORENEW
          ]),
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_PREMIUM_2020,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
          ]),
          this.hasValidSubscription$(state.auth.userProfile, [
            SubscriptionName.ASTROBIN_LITE_2020,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
            SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
          ])
        ).pipe(
          map(([isUltimateOrEquivalent, isPremium, isLite]) => ({
            backendConfig: state.app.backendConfig,
            isUltimateOrEquivalent,
            isPremium,
            isLite
          }))
        )
      ),
      map(({ backendConfig, isUltimateOrEquivalent, isPremium, isLite }) => {
        if (isUltimateOrEquivalent) {
          return { allowed: true, max: Number.MAX_SAFE_INTEGER };
        }

        if (isPremium) {
          return {
            allowed: size < backendConfig.PREMIUM_MAX_IMAGE_SIZE_PREMIUM_2020,
            max: backendConfig.PREMIUM_MAX_IMAGE_SIZE_PREMIUM_2020
          };
        }

        if (isLite) {
          return {
            allowed: size < backendConfig.PREMIUM_MAX_IMAGE_SIZE_LITE_2020,
            max: backendConfig.PREMIUM_MAX_IMAGE_SIZE_LITE_2020
          };
        }

        // If we got here, the user is on Free.
        return {
          allowed: size < backendConfig.PREMIUM_MAX_IMAGE_SIZE_FREE_2020,
          max: backendConfig.PREMIUM_MAX_IMAGE_SIZE_FREE_2020
        };
      })
    );
  }

  getSubscription(userSubscription: UserSubscriptionInterface): Observable<SubscriptionInterface | null> {
    return this.store$.pipe(
      take(1),
      map(state => {
        let ret: SubscriptionInterface = null;

        state.app.subscriptions.forEach(subscription => {
          if (subscription.id === userSubscription.subscription) {
            ret = subscription;
          }
        });

        return ret;
      })
    );
  }

  // Old Lite via PayPal.
  isClassicLite$(): Observable<boolean> {
    return this.hasValidSubscription$(null, [SubscriptionName.ASTROBIN_LITE, SubscriptionName.ASTROBIN_LITE_AUTORENEW]);
  }

  // Any Lite.
  isLite$(): Observable<boolean> {
    return this.hasValidSubscription$(null, [
      SubscriptionName.ASTROBIN_LITE,
      SubscriptionName.ASTROBIN_LITE_AUTORENEW,
      SubscriptionName.ASTROBIN_LITE_2020,
      SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
      SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
    ]);
  }

  // Old Premium via PayPal.
  isClassicPremium$(): Observable<boolean> {
    return this.hasValidSubscription$(null, [
      SubscriptionName.ASTROBIN_PREMIUM,
      SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
    ]);
  }

  // Any Premium.
  isPremium$(): Observable<boolean> {
    return this.hasValidSubscription$(null, [
      SubscriptionName.ASTROBIN_PREMIUM,
      SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
      SubscriptionName.ASTROBIN_PREMIUM_2020,
      SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
      SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
    ]);
  }

  isUltimate$(): Observable<boolean> {
    return this.hasValidSubscription$(null, [
      SubscriptionName.ASTROBIN_ULTIMATE_2020,
      SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
      SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY
    ]);
  }

  isFree$(): Observable<boolean> {
    return forkJoin([this.isLite$(), this.isPremium$(), this.isUltimate$()]).pipe(
      map(([isLite, isPremium, isUltimate]) => !isLite && !isPremium && !isUltimate)
    );
  }
}
