import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export interface State {
  // Weather the app has been initialized.
  initialized: boolean;

  // The user's language.
  language: string;

  // The list of subscription objects (e.g. Lite, Premium, Ultimate.
  subscriptions: SubscriptionInterface[];

  // Constants and configuration items from the backend.
  backendConfig: BackendConfigInterface | null;

  // All seen images.
  images: ImageInterface[];

  // All seen telescopes.
  telescopes: TelescopeInterface[];

  // All seen cameras.
  cameras: CameraInterface[];
}

export const initialState: State = {
  initialized: false,
  language: "en",
  subscriptions: [],
  backendConfig: null,
  images: [],
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

    case AppActionTypes.LOAD_IMAGE_SUCCESS: {
      return {
        ...state,
        images: new UtilsService().arrayUniqueProperty([...state.images, action.payload], "pk")
      };
    }

    case AppActionTypes.LOAD_TELESCOPE_SUCCESS: {
      return {
        ...state,
        telescopes: new UtilsService().arrayUniqueProperty([...state.telescopes, action.payload], "pk")
      };
    }

    case AppActionTypes.LOAD_CAMERA_SUCCESS: {
      return {
        ...state,
        cameras: new UtilsService().arrayUniqueProperty([...state.cameras, action.payload], "pk")
      };
    }

    default: {
      return state;
    }
  }
}
