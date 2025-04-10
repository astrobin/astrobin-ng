import type { PayloadActionInterface } from "@app/store/actions/payload-action.interface";

export const searchFeatureKey = "search";

export type SearchState = Record<string, never>;

export const initialSearchState: SearchState = {};

export function searchReducer(state = initialSearchState, action: PayloadActionInterface): SearchState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
