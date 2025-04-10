import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import type { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import type { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import type { PaymentsApiCheckoutSessionInterface } from "@features/subscriptions/interfaces/payments-api-checkout-session.interface";
import type { PaymentsApiConfigInterface } from "@features/subscriptions/interfaces/payments-api-config.interface";
import type { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import type { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PaymentsApiService {
  constructor(public readonly http: HttpClient) {}

  public getConfig(): Observable<PaymentsApiConfigInterface> {
    return this.http.get<PaymentsApiConfigInterface>(`${environment.classicBaseUrl}/payments/config/`);
  }

  public createCheckoutSession(
    userId: number,
    product: PayableProductInterface,
    currency: string,
    recurringUnit: RecurringUnit,
    autorenew: boolean
  ): Observable<PaymentsApiCheckoutSessionInterface> {
    return this.http.post<PaymentsApiCheckoutSessionInterface>(
      `${environment.classicBaseUrl}/payments/create-checkout-session/${userId}/${product}/${currency}/${recurringUnit}/${autorenew}/`,
      {}
    );
  }

  public upgradeSubscription(
    userId: number,
    product: PayableProductInterface,
    currency: string,
    recurringUnit: RecurringUnit
  ): Observable<void> {
    return this.http.post<void>(
      `${environment.classicBaseUrl}/payments/upgrade-subscription/${userId}/${product}/${currency}/${recurringUnit}/`,
      {}
    );
  }

  public getPrice(
    product: PayableProductInterface,
    currency: string,
    recurringUnit: RecurringUnit
  ): Observable<PricingInterface> {
    return this.http.get<PricingInterface>(
      `${environment.classicApiUrl}/api/v2/payments/pricing/${product}/${currency}/${recurringUnit}/`
    );
  }

  public getAvailableSubscriptions(): Observable<AvailableSubscriptionsInterface> {
    return this.http.get<AvailableSubscriptionsInterface>(
      `${environment.classicApiUrl}/api/v2/payments/pricing/available-subscriptions/`
    );
  }
}
