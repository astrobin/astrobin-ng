import type { MainState } from "@app/store/state";
import type { SubscriptionsState } from "@features/subscriptions/store/subscriptions.reducers";
import { createSelector } from "@ngrx/store";

export const selectSubscriptions = (state: MainState): SubscriptionsState => state.subscriptions;
export const selectAvailableSubscriptions = createSelector(selectSubscriptions, state => state.availableSubscriptions);
export const selectPricing = createSelector(selectSubscriptions, state => state.pricing);
