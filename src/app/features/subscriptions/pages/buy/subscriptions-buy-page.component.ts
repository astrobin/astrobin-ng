import { CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { PaymentsApiConfigInterface } from "@features/subscriptions/interfaces/payments-api-config.interface";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { PaymentsApiService } from "@features/subscriptions/services/payments-api.service";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { combineLatest, Observable } from "rxjs";
import { distinctUntilChanged, filter, map, startWith, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import { selectAvailableSubscriptions, selectPricing } from "@features/subscriptions/store/subscriptions.selectors";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import { GetPricing } from "@features/subscriptions/store/subscriptions.actions";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { WindowRefService } from "@shared/services/window-ref.service";

declare var Stripe: any;

@Component({
  selector: "astrobin-subscriptions-buy-page",
  templateUrl: "./subscriptions-buy-page.component.html",
  styleUrls: ["./subscriptions-buy-page.component.scss"]
})
export class SubscriptionsBuyPageComponent extends BaseComponentDirective implements OnInit {
  PayableProductInterface = PayableProductInterface;
  RecurringUnit = RecurringUnit;

  alreadySubscribed$: Observable<boolean>;
  alreadySubscribedHigher$: Observable<boolean>;
  alreadySubscribedLower$: Observable<boolean>;
  numberOfImages$: Observable<number>;
  maxLiteImages$: Observable<number> = this.store$
    .select(selectBackendConfig)
    .pipe(map(config => config.PREMIUM_MAX_IMAGES_LITE_2020));
  availableSubscriptions$: Observable<AvailableSubscriptionsInterface> =
    this.store$.select(selectAvailableSubscriptions);
  product: PayableProductInterface;
  pricing$: Observable<{ [product: string]: { [recurringUnit: string]: PricingInterface } }> = this.store$.pipe(
    select(selectPricing),
    filter(pricing => !!pricing[this.product].monthly && !!pricing[this.product].yearly)
  );
  bankDetailsMessage: string;
  bankLocations = [
    { id: "USA", label: "United States of America" },
    { id: "CA", label: "Canada" },
    { id: "EU", label: "Europe" },
    { id: "GB", label: "Great Britain" },
    { id: "AUS", label: "Australia" },
    { id: "CH", label: "Switzerland" },
    { id: "CN", label: "China" }
  ];
  selectedBankLocation = "USA";
  currencyPipe: CurrencyPipe;
  recurringUnit = RecurringUnit.YEARLY;
  automaticRenewal = true;

  constructor(
    public readonly store$: Store<State>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly paymentsApiService: PaymentsApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly jsonApiService: JsonApiService,
    public readonly imageApiService: ImageApiService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroyed$), startWith({ lang: this.translateService.currentLang }))
      .subscribe(event => {
        this.currencyPipe = new CurrencyPipe(event.lang);
      });
  }

  get moreInfoMessage() {
    const url = "https://welcome.astrobin.com/pricing";

    return this.translateService.instant(
      "For more information about this and other subscription plans, please visit the {{0}}pricing{{1}} page.",
      {
        0: `<a href="${url}" target="_blank">`,
        1: `</a>`
      }
    );
  }

  get bankDetails(): string {
    switch (this.selectedBankLocation) {
      case "CH":
        return (
          "BANK       : PostFinance Switzerland\n" +
          "BENEFICIARY: Salvatore Iovene\n" +
          "IBAN       : CH97 0900 0000 6922 3618 4\n" +
          "SWIFT / BIC: POFICHBEXXX"
        );
      case "AU":
        return "BENEFICIARY: AstroBin\n" + "ACCOUNT #  : 412756021\n" + "BSB CODE   : 802-985";
      case "GB":
        return (
          "BENEFICIARY: AstroBin\n" +
          "ACCOUNT #  : 52990073\n" +
          "SORT CODE  : 23-14-70\n" +
          "IBAN       : GB79 TRWI 2314 7052 9900 73"
        );
      case "CA":
        return (
          "BENEFICIARY       : AstroBin\n" +
          "ACCOUNT NUMBER    : 200110016315\n" +
          "INSTITUTION NUMBER: 621\n" +
          "TRANSIT NUMBER    : 16001"
        );
      case "EU":
        return "BENEFICIARY: AstroBin\n" + "IBAN       : BE76 9671 5599 8695\n" + "SWIFT / BIC: TRWIBEB1XXX ";
      case "USA":
        return (
          "Paying from inside the USA\n" +
          "ACCOUNT #: 9600000000061714\n" +
          "ROUTING #: 084009519\n\n" +
          "Paying from outside the USA\n" +
          "ACCOUNT #: 8310788830\n" +
          "SWIFT/BIC: CMFGUS33"
        );
      default:
        return this.translateService.instant(
          "Sorry, unfortunately AstroBin does not have a bank account in the selected territory."
        );
    }
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.product = params["product"];

      if (
        [PayableProductInterface.LITE, PayableProductInterface.PREMIUM, PayableProductInterface.ULTIMATE].indexOf(
          this.product
        ) === -1
      ) {
        this.router.navigateByUrl("/page-not-found", { skipLocationChange: true });
        return;
      }

      const title = this.subscriptionsService.getName(this.product);
      this.titleService.setTitle(title);
      this.store$.dispatch(
        new SetBreadcrumb({
          breadcrumb: [{ label: "Subscriptions" }, { label: title }]
        })
      );

      this.store$.dispatch(
        new GetPricing({
          product: this.product,
          recurringUnit: RecurringUnit.MONTHLY
        })
      );

      this.store$.dispatch(
        new GetPricing({
          product: this.product,
          recurringUnit: RecurringUnit.YEARLY
        })
      );

      this.alreadySubscribed$ = this.store$
        .select(selectCurrentUserProfile)
        .pipe(
          switchMap(userProfile =>
            this.userSubscriptionService.hasValidSubscription$(
              userProfile,
              this.subscriptionsService.getSameTier(this.product)
            )
          )
        );

      this.alreadySubscribedHigher$ = this.store$
        .select(selectCurrentUserProfile)
        .pipe(
          switchMap(userProfile =>
            this.userSubscriptionService.hasValidSubscription$(
              userProfile,
              this.subscriptionsService.getHigherTier(this.product)
            )
          )
        );

      this.alreadySubscribedLower$ = this.store$
        .select(selectCurrentUserProfile)
        .pipe(
          switchMap(userProfile =>
            this.userSubscriptionService.hasValidSubscription$(
              userProfile,
              this.subscriptionsService.getLowerTier(this.product)
            )
          )
        );

      this.numberOfImages$ = this.store$.select(selectCurrentUser).pipe(
        switchMap(user => this.imageApiService.getPublicImagesCountByUserId(user.id)),
        take(1)
      );

      this.subscriptionsService.currency$
        .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
        .subscribe(currency => {
          this.selectedBankLocation = {
            USD: "USA",
            CAD: "CA",
            EUR: "EU",
            GBP: "GB",
            AUD: "AUS",
            CHF: "CH",
            CNY: "CN"
          }[currency];
        });

      this.pricing$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this._updateBankDetailsMessage();
      });
    });
  }

  getLiteLimitMessage$(numberOfImages): Observable<SafeHtml> {
    return this.maxLiteImages$.pipe(
      map(maxImages => {
        return this.domSanitizer.bypassSecurityTrustHtml(
          this.translateService.instant(
            "The Lite plan is capped at <strong>{{maxImagesForLite}}</strong> total images, and you currently have " +
            "<strong>{{numberOfImages}}</strong> images on AstroBin. For this reason, we recommend that you upgrade to " +
            "Premium or Ultimate instead.",
            {
              maxImagesForLite: maxImages,
              numberOfImages
            }
          )
        );
      })
    );
  }

  cancel(): void {
    this.currentUserProfile$
      .pipe(
        switchMap(userProfile =>
          combineLatest([
            this.subscriptionsService.stripeCustomerPortalUrl$,
            this.userSubscriptionService.hasValidSubscription$(userProfile, [
              SubscriptionName.ASTROBIN_LITE,
              SubscriptionName.ASTROBIN_PREMIUM
            ]),
            this.userSubscriptionService.hasValidSubscription$(userProfile, [
              SubscriptionName.ASTROBIN_LITE_AUTORENEW,
              SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
            ]),
            this.userSubscriptionService.hasValidSubscription$(userProfile, [
              SubscriptionName.ASTROBIN_LITE_2020,
              SubscriptionName.ASTROBIN_PREMIUM_2020,
              SubscriptionName.ASTROBIN_ULTIMATE_2020
            ]),
            this.userSubscriptionService.hasValidSubscription$(userProfile, [
              SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY,
              SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY,
              SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
              SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
              SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
              SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
            ])
          ])
        )
      )
      .subscribe(
        ([
           stripeCustomerPortalUrl,
           hasNonRecurringPayPalSubscription,
           hasRecurringPayPalSubscription,
           hasNonRecurringStripeSubscription,
           hasRecurringStripeSubscription
         ]) => {
          const modal = this.modalService.open(InformationDialogComponent);
          const componentInstance: InformationDialogComponent = modal.componentInstance;
          let message: string = "<ul>";

          if (hasNonRecurringPayPalSubscription) {
            message +=
              "<li>" +
              this.translateService.instant("You have a non-recurring PayPal subscription.") +
              " " +
              this.translateService.instant("You don't need to cancel it, it will expire automatically." + "</li>");
          }

          if (hasRecurringPayPalSubscription) {
            message +=
              "<li>" +
              this.translateService.instant(
                "You have a recurring PayPal subscription. You can cancel it on PayPal's settings:"
              ) +
              " " +
              `<a href="${this.subscriptionsService.payPalCustomerPortalUrl}" target="_blank">` +
              this.translateService.instant("Manage your PayPal subscription") +
              "</a></li>";
          }

          if (hasNonRecurringStripeSubscription) {
            message +=
              "<li>" +
              this.translateService.instant(
                "You have a non-recurring Stripe subscription (paid by credit card, Sepa, AliPay, or other)."
              ) +
              " " +
              this.translateService.instant("You don't need to cancel it, it will expire automatically.") +
              "</li>";
          }

          if (hasRecurringStripeSubscription) {
            message += "<li>" +
              this.translateService.instant(
                "You have a recurring Stripe subscription (paid by credit card, Sepa, AliPay, or other). You can " +
                "cancel it on Stripe's customer portal by logging in with the email address associated to your " +
                "AstroBin account:"
              ) +
              " " +
              `<a href="${stripeCustomerPortalUrl}" target="_blank">` +
              this.translateService.instant("Manage your Stripe subscription") +
              "</a></li>";
          }

          message += "</ul>";

          message +=
            "<p>" +
            this.translateService.instant("If you have any question, please contact us at {{0}}.", {
              0: `<a href="mailto:support@astrobin.com">support@astrobin.com</a>`
            }) +
            "</p>";

          componentInstance.message = message;
        }
      );
  }

  buy(): void {
    let stripe: any;
    let config: PaymentsApiConfigInterface;

    this.loadingService.setLoading(true);

    const startCheckout = () => {
      this.paymentsApiService
        .getConfig()
        .pipe(
          tap(_config => (config = _config)),
          switchMap(() => {
            if (!Stripe) {
              return null;
            }

            stripe = Stripe(config.publicKey);
            return this.currentUser$.pipe(
              switchMap(user =>
                this.paymentsApiService.createCheckoutSession(
                  user.id,
                  this.product,
                  this.subscriptionsService.currency,
                  this.recurringUnit,
                  this.automaticRenewal
                )
              )
            );
          })
        )
        .subscribe(response => {
          if (!response) {
            this.popNotificationsService.error("Unable to load payment processor. Is your browser blocking Stripe?");
            this.loadingService.setLoading(false);
            return;
          }

          if (response.sessionId) {
            stripe.redirectToCheckout({ sessionId: response.sessionId });
          } else {
            this.popNotificationsService.error(response.error || this.translateService.instant("Unknown error"));
            this.loadingService.setLoading(false);
          }
        });
    };

    const startUpgrade = () => {
      this.loadingService.setLoading(true);
      this.currentUser$
        .pipe(
          switchMap(user =>
            this.paymentsApiService.upgradeSubscription(
              user.id,
              this.product,
              this.subscriptionsService.currency,
              this.recurringUnit
            )
          )
        )
        .subscribe(() => {
          this.windowRefService.locationAssign(`/subscriptions/success?product=${this.product}`);
        });
    };

    combineLatest([
      this.userSubscriptionService.upgradeAllowed$(),
      this.alreadySubscribed$,
      this.alreadySubscribedHigher$,
      this.alreadySubscribedLower$
    ]).subscribe(([upgradeAllowed, alreadySubscribed, alreadySubscribedHigher, alreadySubscribedLower]) => {
      if (alreadySubscribed) {
        if (this.automaticRenewal) {
          this.popNotificationsService.error(
            this.translateService.instant("You already have an active subscription of this kind.")
          );
          this.loadingService.setLoading(false);
          return;
        } else {
          const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
          const componentInstance: ConfirmationDialogComponent = modal.componentInstance;

          componentInstance.message = this.translateService.instant(
            "You are already on this plan. If you buy it again, your expiration date will be extended by one year."
          );

          modal.closed.subscribe(item => {
            startCheckout();
          });

          modal.dismissed.subscribe(() => {
            this.loadingService.setLoading(false);
          });
        }
      } else if (alreadySubscribedHigher) {
        const modal: NgbModalRef = this.modalService.open(InformationDialogComponent);
        const componentInstance: InformationDialogComponent = modal.componentInstance;

        componentInstance.message =
          this.translateService.instant("You are already subscribed to a higher plan.") +
          " " +
          this.translateService.instant(
            "For this reason, you cannot purchase this at the moment, as AstroBin does not currently offer a " +
            "downgrade path."
          );

        this.loadingService.setLoading(false);
      } else if (alreadySubscribedLower) {
        if (upgradeAllowed) {
          const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
          const componentInstance: ConfirmationDialogComponent = modal.componentInstance;

          componentInstance.message = "<p>" + this.translateService.instant(
            "Upgrade your subscription now, and only pay the difference at your next billing cycle. Your next " +
            "payment will include the next billing period, minus the unused portion of your current billing period. " +
            "If you switch from a yearly to a monthly plan, any balance in your favor will be automatically applied " +
            "to your future invoices until exhausted."
          ) + "</p>";

          componentInstance.message +=
            "<p>" +
            this.translateService.instant("If you have any question, please contact us at {{0}}.", {
              0: `<a href="mailto:support@astrobin.com">support@astrobin.com</a>`
            }) +
            "</p>";

          this.loadingService.setLoading(false);

          modal.closed.subscribe(() => {
            startUpgrade();
          });
        } else {
          startCheckout();
        }
      } else {
        startCheckout();
      }
    });
  }

  payYearly(): void {
    this.recurringUnit = RecurringUnit.YEARLY;
    this._updateBankDetailsMessage();
  }

  payMonthly(): void {
    this.recurringUnit = RecurringUnit.MONTHLY;
    this.automaticRenewal = true;
    this._updateBankDetailsMessage();
  }

  private _updateBankDetailsMessage() {
    this.pricing$.pipe(take(1)).subscribe(pricing => {
      this.bankDetailsMessage = this.translateService.instant(
        "Please make a deposit of {{ currency }} {{ amount }} to the following bank details and then email " +
        "us at {{ email_prefix }}{{ email }}{{ email_postfix }} with your username so we may upgrade your " +
        "account manually.",
        {
          currency: "",
          amount: `<strong>${this.currencyPipe.transform(
            pricing[this.product][this.recurringUnit].price,
            this.subscriptionsService.currency
          )}</strong>`,
          email_prefix: "<a href='mailto:support@astrobin.com'>",
          email: "support@astrobin.com",
          email_postfix: "</a>"
        }
      );
    });
  }
}
