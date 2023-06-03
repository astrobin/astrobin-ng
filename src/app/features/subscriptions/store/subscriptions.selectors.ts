import { State } from "@app/store/state";
import { SubscriptionsState } from "@features/subscriptions/store/subscriptions.reducers";
import { createSelector } from "@ngrx/store";

export const selectSubscriptions = (state: State): SubscriptionsState => state.subscriptions;
export const selectAvailableSubscriptions = createSelector(selectSubscriptions, state => state.availableSubscriptions);
export const selectPricing = createSelector(selectSubscriptions, state => state.pricing);
