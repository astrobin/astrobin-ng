import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { ImageInterface, ORIGINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";

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

  // The country code of the user's location.
  requestCountry: string;

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

  // All seen nested comments.
  nestedComments: NestedCommentInterface[] | null;

  // All seen toggle properties.
  toggleProperties: TogglePropertyInterface[];
}

export const initialAppState: AppState = {
  initialized: false,
  breadcrumb: [],
  currentFullscreenImage: null,
  language: "en",
  subscriptions: [],
  backendConfig: null,
  requestCountry: null,
  contentTypes: [],
  images: [],
  thumbnails: [],
  loadingThumbnails: [],
  solutions: [],
  telescopes: [],
  cameras: [],
  createLocationAddTag: null,
  nestedComments: null,
  toggleProperties: []
};

function handleCreateTogglePropertySuccess(
  state: AppState,
  action: any
): AppState {
  let image: ImageInterface = null;

  const imageContentType = findImageContentType(state);

  if (imageContentType && action.payload.toggleProperty.contentType === imageContentType.id) {
    image = findImage(state, action.payload.toggleProperty.objectId);

    if (image) {
      updateImageCounts(image, action.payload.toggleProperty.propertyType, true);
    }
  }

  return {
    ...state,
    toggleProperties: UtilsService.arrayUniqueObjects(
      [...state.toggleProperties, action.payload.toggleProperty],
      "id"
    ),
    images: image ? updateImages(state.images, image) : state.images
  };
}

function handleDeleteTogglePropertySuccess(
  state: AppState,
  action: any
): AppState {
  let image: ImageInterface = null;

  const imageContentType = findImageContentType(state);

  if (imageContentType && action.payload.toggleProperty.contentType === imageContentType.id) {
    image = findImage(state, action.payload.toggleProperty.objectId);

    if (image) {
      updateImageCounts(image, action.payload.toggleProperty.propertyType, false);
    }
  }

  return {
    ...state,
    toggleProperties: state.toggleProperties.filter(
      property => property.id !== action.payload.toggleProperty.id
    ),
    images: image ? updateImages(state.images, image) : state.images
  };
}

// Helper functions
function findImageContentType(state: AppState): ContentTypeInterface | undefined {
  return state.contentTypes.find(
    contentType => contentType.appLabel === "astrobin" && contentType.model === "image"
  );
}

function findImage(state: AppState, objectId: number): ImageInterface | undefined {
  return state.images.find(image => image.pk === objectId);
}

function updateImageCounts(image: ImageInterface, propertyType: string, increment: boolean): void {
  const countChange = increment ? 1 : -1;
  if (propertyType === "like") {
    image.likeCount += countChange;
  } else if (propertyType === "bookmark") {
    image.bookmarkCount += countChange;
  }
}

function updateImages(images: ImageInterface[], updatedImage: ImageInterface): ImageInterface[] {
  return [...images.filter(i => i.pk !== updatedImage.pk), updatedImage];
}

export function appReducer(state = initialAppState, action: All): AppState {
  switch (action.type) {
    case AppActionTypes.INITIALIZE_SUCCESS: {
      return {
        ...state,
        initialized: true,
        subscriptions: action.payload.subscriptions,
        backendConfig: action.payload.backendConfig,
        requestCountry: action.payload.requestCountry
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
        contentTypes: [...state.contentTypes.filter(i => i.id !== action.payload.id), ...[action.payload]]
      };
    }

    case AppActionTypes.SET_IMAGE:
    case AppActionTypes.LOAD_IMAGE_SUCCESS: {
      if (action.payload === null || action.payload === undefined) {
        return state;
      }

      let loadingThumbnails = [...state.loadingThumbnails];
      const thumbnails = !!action.payload.thumbnails ? [...action.payload.thumbnails] : [];

      if (action.payload.thumbnails) {
        action.payload.thumbnails.forEach(thumbnail => {
          loadingThumbnails = loadingThumbnails.filter(
            loadingThumbnail =>
              loadingThumbnail.id !== thumbnail.id ||
              loadingThumbnail.revision !== thumbnail.revision ||
              loadingThumbnail.alias !== thumbnail.alias
          );
        });
      }

      return {
        ...state,
        images: [...state.images.filter(i => i.pk !== action.payload.pk), action.payload],
        thumbnails: UtilsService.arrayUniqueObjects([...state.thumbnails, ...thumbnails], null, false),
        loadingThumbnails,
        telescopes: action.payload.imagingTelescopes
          ? UtilsService.arrayUniqueObjects([...state.telescopes, ...action.payload.imagingTelescopes], "pk")
          : [],
        cameras: action.payload.imagingCameras
          ? UtilsService.arrayUniqueObjects([...state.cameras, ...action.payload.imagingCameras], "pk")
          : []
      };
    }

    // case AppActionTypes.SAVE_IMAGE_SUCCESS: {
    //   return {
    //     ...state,
    //     images: [
    //       ...state.images.filter((i) => i.pk !== action.payload.image.pk),
    //       action.payload.image as ImageEditModelInterface,
    //     ],
    //   };
    // }

    case AppActionTypes.LOAD_IMAGES_SUCCESS: {
      const flatImages = action.payload.results.map(image => ({
        ...image,
        imagingTelescopes: [],
        imagingCameras: [],
        thumbnails: []
      }));
      const images = UtilsService.arrayUniqueObjects([...state.images, ...flatImages], "pk");

      let loadingThumbnails = [...state.loadingThumbnails];
      let thumbnails = [...state.thumbnails];

      action.payload.results.forEach(image => {
        if (!!image.thumbnails) {
          image.thumbnails.forEach(thumbnail => {
            loadingThumbnails = loadingThumbnails.filter(
              loadingThumbnail =>
                loadingThumbnail.id !== thumbnail.id ||
                loadingThumbnail.revision !== thumbnail.revision ||
                loadingThumbnail.alias !== thumbnail.alias
            );

            thumbnails = UtilsService.arrayUniqueObjects([...thumbnails, ...image.thumbnails], null, false);
          });
        }
      });

      const telescopes = UtilsService.arrayUniqueObjects(
        [].concat.apply(
          state.telescopes,
          action.payload.results.filter(image => !!image.imagingTelescopes).map(image => image.imagingTelescopes)
        ),
        "pk"
      );

      const cameras = UtilsService.arrayUniqueObjects(
        [].concat.apply(
          state.cameras,
          action.payload.results.filter(image => !!image.imagingCameras).map(image => image.imagingCameras)
        ),
        "pk"
      );

      return {
        ...state,
        images,
        thumbnails,
        loadingThumbnails,
        telescopes,
        cameras
      };
    }

    case AppActionTypes.SAVE_IMAGE_REVISION_SUCCESS: {
      const updatedImage: ImageInterface = {
        ...state.images.find(image => image.pk === action.payload.revision.image),
      };

      const updatedRevision = updatedImage.revisions.find(revision => revision.pk === action.payload.revision.pk);

      updatedImage.revisions = [
        ...updatedImage.revisions.filter(revision => revision.pk !== action.payload.revision.pk),
        action.payload.revision
      ].sort((a, b) => a.uploaded > b.uploaded ? -1 : 1);

      return {
        ...state,
        images: [
          ...state.images.filter(image => image.pk !== action.payload.revision.image),
          updatedImage
        ]
      };
    }

    case AppActionTypes.PUBLISH_IMAGE_SUCCESS: {
      const updatedImage: ImageInterface = {
        ...state.images.find(image => image.pk === action.payload.pk),
        isWip: false
      };

      return {
        ...state,
        images: [
          ...state.images.filter(image => image.pk !== action.payload.pk),
          updatedImage
        ]
      };
    }

    case AppActionTypes.UNPUBLISH_IMAGE_SUCCESS: {
      const updatedImage: ImageInterface = {
        ...state.images.find(image => image.pk === action.payload.pk),
        isWip: true
      };

      return {
        ...state,
        images: [
          ...state.images.filter(image => image.pk !== action.payload.pk),
          updatedImage
        ]
      };
    }

    case AppActionTypes.MARK_AS_FINAL_SUCCESS: {
      const imagePk = action.payload.pk;
      const revisionLabel = action.payload.revisionLabel;
      const image = state.images.find(i => i.pk === imagePk);

      if (revisionLabel === ORIGINAL_REVISION_LABEL) {
        image.isFinal = true;
        image.revisions.forEach(revision => {
          revision.isFinal = false;
        });
      } else {
        image.isFinal = false;
        image.revisions.forEach(revision => {
          revision.isFinal = revision.label === revisionLabel;
        });
      }

      return {
        ...state,
        images: [
          ...state.images.filter(i => i.pk !== imagePk),
          image
        ]
      };
    }

    case AppActionTypes.LOAD_THUMBNAIL: {
      return {
        ...state,
        loadingThumbnails: UtilsService.arrayUniqueObjects(
          [...state.loadingThumbnails, action.payload.data],
          null,
          false
        )
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
        thumbnails: UtilsService.arrayUniqueObjects([...state.thumbnails, action.payload], null, false),
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
        solutions: UtilsService.arrayUniqueObjects([...state.solutions, action.payload], "id")
      };
    }

    case AppActionTypes.LOAD_SOLUTIONS_SUCCESS: {
      return {
        ...state,
        solutions: UtilsService.arrayUniqueObjects([...state.solutions, ...action.payload], "id")
      };
    }

    case AppActionTypes.LOAD_TELESCOPE_SUCCESS: {
      return {
        ...state,
        telescopes: [...state.telescopes.filter(i => i.pk !== action.payload.pk), action.payload]
      };
    }

    case AppActionTypes.LOAD_CAMERA_SUCCESS: {
      return {
        ...state,
        cameras: [...state.cameras.filter(i => i.pk !== action.payload.pk), action.payload]
      };
    }

    case AppActionTypes.CREATE_LOCATION_ADD_TAG: {
      return {
        ...state,
        createLocationAddTag: action.payload
      };
    }

    case AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS: {
      return {
        ...state,
        nestedComments: UtilsService.sortObjectsByProperty(
          UtilsService.arrayUniqueObjects([...state.nestedComments || [], ...action.payload.nestedComments], "id"),
          "created"
        )
      };
    }

    case AppActionTypes.LOAD_NESTED_COMMENT_SUCCESS:
    case AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS: {
      return {
        ...state,
        nestedComments: UtilsService.sortObjectsByProperty(
          UtilsService.arrayUniqueObjects([...state.nestedComments || [], ...[action.payload.nestedComment]], "id"),
          "created"
        )
      };
    }

    case AppActionTypes.LOAD_TOGGLE_PROPERTY_SUCCESS: {
      if (action.payload.toggleProperty !== null) {
        return {
          ...state,
          toggleProperties: UtilsService.arrayUniqueObjects(
            [...state.toggleProperties, action.payload.toggleProperty],
            "id"
          )
        };
      }

      return state;
    }

    case AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS: {
      return handleCreateTogglePropertySuccess(state, action);
    }

    case AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS: {
      return handleDeleteTogglePropertySuccess(state, action);
    }

    default: {
      return state;
    }
  }
}

