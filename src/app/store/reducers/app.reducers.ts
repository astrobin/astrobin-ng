import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export interface AppState {
  // Weather the app has been initialized.
  initialized: boolean;

  breadcrumb: BreadcrumbInterface[];

  currentFullscreenImage: number | null;

  // The user's language.
  language: string;

  // The list of subscription objects (e.g. Lite, Premium, Ultimate.
  subscriptions: SubscriptionInterface[];

  // Constants and configuration items from the backend.
  backendConfig: BackendConfigInterface | null;

  // All seen content types.
  contentTypes: ContentTypeInterface[];

  // All seen images.
  images: ImageInterface[];

  // All seen thumbnails.
  thumbnails: ImageThumbnailInterface[];

  // Thumbnails currently being loaded.
  loadingThumbnails: Omit<ImageThumbnailInterface, "url">[];

  // All seen solutions.
  solutions: SolutionInterface[];

  // All seen telescopes.
  telescopes: TelescopeInterface[];

  // All seen cameras.
  cameras: CameraInterface[];

  // This is what's been typed to create a new location.
  createLocationAddTag: string;
}

export const initialAppState: AppState = {
  initialized: false,
  breadcrumb: [],
  currentFullscreenImage: null,
  language: "en",
  subscriptions: [],
  backendConfig: null,
  contentTypes: [],
  images: [],
  thumbnails: [],
  loadingThumbnails: [],
  solutions: [],
  telescopes: [],
  cameras: [],
  createLocationAddTag: null
};

export function reducer(state = initialAppState, action: All): AppState {
  switch (action.type) {
    case AppActionTypes.INITIALIZE_SUCCESS: {
      return {
        ...state,
        initialized: true,
        subscriptions: action.payload.subscriptions,
        backendConfig: action.payload.backendConfig
      };
    }

    case AppActionTypes.SET_BREADCRUMB: {
      return {
        ...state,
        breadcrumb: action.payload.breadcrumb
      };
    }

    case AppActionTypes.SHOW_FULLSCREEN_IMAGE: {
      return {
        ...state,
        currentFullscreenImage: action.payload
      };
    }

    case AppActionTypes.HIDE_FULLSCREEN_IMAGE: {
      return {
        ...state,
        currentFullscreenImage: null
      };
    }

    case AppActionTypes.LOAD_CONTENT_TYPE_SUCCESS: {
      return {
        ...state,
        contentTypes: UtilsService.arrayUniqueObjects([...state.contentTypes, action.payload])
      };
    }

    case AppActionTypes.SET_IMAGE:
    case AppActionTypes.LOAD_IMAGE_SUCCESS:
    case AppActionTypes.SAVE_IMAGE_SUCCESS: {
      return {
        ...state,
        images: UtilsService.arrayUniqueObjects([...state.images, action.payload])
      };
    }

    case AppActionTypes.LOAD_IMAGES_SUCCESS: {
      return {
        ...state,
        images: UtilsService.arrayUniqueObjects([...state.images, ...action.payload.results])
      };
    }

    case AppActionTypes.LOAD_THUMBNAIL: {
      return {
        ...state,
        loadingThumbnails: UtilsService.arrayUniqueObjects([...state.loadingThumbnails, action.payload])
      };
    }

    case AppActionTypes.LOAD_THUMBNAIL_CANCEL: {
      return {
        ...state,
        loadingThumbnails: state.loadingThumbnails.filter(
          thumbnail =>
            thumbnail.id !== action.payload.id ||
            thumbnail.revision !== action.payload.revision ||
            thumbnail.alias !== action.payload.alias
        )
      };
    }

    case AppActionTypes.LOAD_THUMBNAIL_SUCCESS: {
      return {
        ...state,
        thumbnails: UtilsService.arrayUniqueObjects([...state.thumbnails, action.payload]),
        loadingThumbnails: state.loadingThumbnails.filter(
          thumbnail =>
            thumbnail.id !== action.payload.id ||
            thumbnail.revision !== action.payload.revision ||
            thumbnail.alias !== action.payload.alias
        )
      };
    }

    case AppActionTypes.LOAD_SOLUTION_SUCCESS: {
      return {
        ...state,
        solutions: UtilsService.arrayUniqueObjects([...state.solutions, action.payload])
      };
    }

    case AppActionTypes.LOAD_SOLUTIONS_SUCCESS: {
      return {
        ...state,
        solutions: UtilsService.arrayUniqueObjects([...state.solutions, ...action.payload])
      };
    }

    case AppActionTypes.LOAD_TELESCOPE_SUCCESS: {
      return {
        ...state,
        telescopes: UtilsService.arrayUniqueObjects([...state.telescopes, action.payload])
      };
    }

    case AppActionTypes.LOAD_CAMERA_SUCCESS: {
      return {
        ...state,
        cameras: UtilsService.arrayUniqueObjects([...state.cameras, action.payload])
      };
    }

    case AppActionTypes.CREATE_LOCATION_ADD_TAG: {
      return {
        ...state,
        createLocationAddTag: action.payload
      };
    }

    default: {
      return state;
    }
  }
}
