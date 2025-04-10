import { Injectable } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { PaymentsApiService } from "@features/subscriptions/services/payments-api.service";
import type { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import type { GetPricing } from "@features/subscriptions/store/subscriptions.actions";
import {
  GetAvailableSubscriptionsSuccess,
  GetPricingSuccess,
  SubscriptionsActionTypes
} from "@features/subscriptions/store/subscriptions.actions";
import { selectAvailableSubscriptions } from "@features/subscriptions/store/subscriptions.selectors";
import type { Actions } from "@ngrx/effects";
import { createEffect, ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

@Injectable()
export class SubscriptionsEffects {
  GetAvailableSubscriptions: Observable<GetAvailableSubscriptionsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActionTypes.GET_AVAILABLE_SUBSCRIPTIONS),
      mergeMap(action =>
        this.store$.select(selectAvailableSubscriptions).pipe(
          mergeMap(availableSubscriptions =>
            availableSubscriptions !== null
              ? of(availableSubscriptions).pipe(
                  map(availableSubscriptions => new GetAvailableSubscriptionsSuccess({ availableSubscriptions }))
                )
              : this.paymentsApiService.getAvailableSubscriptions().pipe(
                  map(availableSubscriptions => new GetAvailableSubscriptionsSuccess({ availableSubscriptions })),
                  catchError(() => EMPTY)
                )
          )
        )
      )
    )
  );

  GetPricing: Observable<GetPricingSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActionTypes.GET_PRICING),
      mergeMap((action: GetPricing) =>
        this.subscriptionsService.getPrice(action.payload.product, action.payload.recurringUnit).pipe(
          map(
            pricing =>
              new GetPricingSuccess({
                product: action.payload.product,
                recurringUnit: action.payload.recurringUnit,
                pricing
              })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly paymentsApiService: PaymentsApiService,
    public readonly subscriptionsService: SubscriptionsService
  ) {}
}
