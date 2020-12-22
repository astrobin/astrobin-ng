import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";

export interface State {
  initialized: boolean;
  language: string;
  subscriptions: SubscriptionInterface[];
  backendConfig: BackendConfigInterface | null;
  telescopes: TelescopeInterface[];
  cameras: CameraInterface[];
}

export const initialState: State = {
  initialized: false,
  language: "en",
  subscriptions: [],
  backendConfig: null,
  telescopes: [],
  cameras: []
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
    case AppActionTypes.LOAD_TELESCOPE_SUCCESS: {
      return {
        ...state,
        telescopes: [...state.telescopes, action.payload]
      };
    }
    case AppActionTypes.LOAD_CAMERA_SUCCESS: {
      return {
        ...state,
        cameras: [...state.cameras, action.payload]
      };
    }
    default: {
      return state;
    }
  }
}
