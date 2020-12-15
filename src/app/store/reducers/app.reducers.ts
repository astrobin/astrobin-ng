import { AppActionTypes } from "@app/store/actions/app.actions";
import { All } from "@app/store/actions/app.actions";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";

export interface State {
  initialized: boolean;
  language: string;
  subscriptions: SubscriptionInterface[];
  backendConfig: BackendConfigInterface | null;
}

export const initialState: State = {
  initialized: false,
  language: "en",
  subscriptions: [],
  backendConfig: null
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case AppActionTypes.INITIALIZE_SUCCESS: {
      return {
        ...state,
        initialized: true,
        subscriptions: action.payload.subscriptions,
        backendConfig: action.payload.backendConfig
      };
    }
    default: {
      return state;
    }
  }
}
