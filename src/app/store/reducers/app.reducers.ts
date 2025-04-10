import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { CameraInterface } from "@core/interfaces/camera.interface";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import { FINAL_REVISION_LABEL, ORIGINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import type { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import type { RemoteSourceAffiliateInterface } from "@core/interfaces/remote-source-affiliate.interface";
import type { SolutionInterface } from "@core/interfaces/solution.interface";
import type { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import type { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { UtilsService } from "@core/services/utils/utils.service";
import type { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";

export interface AppState {
  // Weather the app has been initialized.
  initialized: boolean;

  breadcrumb: BreadcrumbInterface[];

  currentFullscreenImage: ImageInterface["pk"] | null;
  currentFullscreenImageEvent: MouseEvent | TouchEvent | null;

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

  // All seen remote source affiliates.
  remoteSourceAffiliates: RemoteSourceAffiliateInterface[] | null;

  // All seen groups.
  groups: GroupInterface[] | null;

  // All seen collections.
  collections: CollectionInterface[] | null;
}

export const initialAppState: AppState = {
  initialized: false,
  breadcrumb: [],
  currentFullscreenImage: null,
  currentFullscreenImageEvent: null,
  language: "en",
  subscriptions: [],
  backendConfig: null,
  requestCountry: null,
  contentTypes: [],
  images: [],
  thumbnails: [],
  solutions: [],
  telescopes: [],
  cameras: [],
  createLocationAddTag: null,
  nestedComments: null,
  toggleProperties: [],
  remoteSourceAffiliates: null,
  groups: null,
  collections: null
};

function handleCreateTogglePropertySuccess(state: AppState, action: any): AppState {
  let image: ImageInterface = null;

  const imageContentType = findImageContentType(state);

  if (imageContentType && action.payload.toggleProperty.contentType === imageContentType.id) {
    image = findImage(state, action.payload.toggleProperty.objectId);

    if (image) {
      image = updateImageCounts(image, action.payload.toggleProperty.propertyType, true);
    }
  }

  return {
    ...state,
    toggleProperties: UtilsService.arrayUniqueObjects([...state.toggleProperties, action.payload.toggleProperty], "id"),
    images: image ? updateImages(state.images, image) : state.images
  };
}

function handleDeleteTogglePropertySuccess(state: AppState, action: any): AppState {
  let image: ImageInterface = null;

  const imageContentType = findImageContentType(state);

  if (imageContentType && action.payload.toggleProperty.contentType === imageContentType.id) {
    image = findImage(state, action.payload.toggleProperty.objectId);

    if (image) {
      image = updateImageCounts(image, action.payload.toggleProperty.propertyType, false);
    }
  }

  return {
    ...state,
    toggleProperties: state.toggleProperties.filter(property => property.id !== action.payload.toggleProperty.id),
    images: image ? updateImages(state.images, image) : state.images
  };
}

// Helper functions
function findImageContentType(state: AppState): ContentTypeInterface | undefined {
  return state.contentTypes.find(contentType => contentType.appLabel === "astrobin" && contentType.model === "image");
}

function findImage(state: AppState, objectId: number): ImageInterface | undefined {
  return state.images.find(image => image.pk === objectId);
}

function updateImageCounts(image: ImageInterface, propertyType: string, increment: boolean): ImageInterface {
  const countChange = increment ? 1 : -1;
  if (propertyType === "like") {
    return {
      ...image,
      likeCount: image.likeCount + countChange
    };
  } else if (propertyType === "bookmark") {
    return {
      ...image,
      bookmarkCount: image.bookmarkCount + countChange
    };
  }
  return image; // Default to return the same image if no changes
}

function updateImages(images: ImageInterface[], updatedImage: ImageInterface): ImageInterface[] {
  const imageIndex = images.findIndex(i => i.pk === updatedImage.pk);

  if (imageIndex === -1) {
    return images;
  }

  return [...images.slice(0, imageIndex), updatedImage, ...images.slice(imageIndex + 1)];
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
        currentFullscreenImage: action.payload.imageId,
        currentFullscreenImageEvent: action.payload.event
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
    case AppActionTypes.LOAD_IMAGE_SUCCESS:
    case AppActionTypes.ACCEPT_COLLABORATOR_REQUEST_SUCCESS:
    case AppActionTypes.DENY_COLLABORATOR_REQUEST_SUCCESS:
    case AppActionTypes.REMOVE_COLLABORATOR_SUCCESS: {
      if (action.payload === null || action.payload === undefined) {
        return state;
      }

      const thumbnails = !!action.payload.thumbnails ? [...action.payload.thumbnails] : [];

      return {
        ...state,
        images: [...state.images.filter(i => i.pk !== action.payload.pk), action.payload],
        thumbnails: UtilsService.arrayUniqueObjects([...state.thumbnails, ...thumbnails], null, false),
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

      let thumbnails = [...state.thumbnails];

      action.payload.results.forEach(image => {
        if (!!image.thumbnails) {
          image.thumbnails.forEach(thumbnail => {
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
        telescopes,
        cameras
      };
    }

    case AppActionTypes.SAVE_IMAGE_REVISION_SUCCESS: {
      const imageIndex = state.images.findIndex(image => image.pk === action.payload.revision.image);
      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      const updatedImage = {
        ...state.images[imageIndex],
        revisions: [
          ...state.images[imageIndex].revisions.filter(revision => revision.pk !== action.payload.revision.pk),
          action.payload.revision
        ].sort((a, b) => (a.uploaded > b.uploaded ? -1 : 1))
      };

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), updatedImage, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.PUBLISH_IMAGE_SUCCESS: {
      const imageIndex = state.images.findIndex(image => image.pk === action.payload.pk);
      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      const updatedImage = {
        ...state.images[imageIndex],
        isWip: false
      };

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), updatedImage, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.UNPUBLISH_IMAGE_SUCCESS: {
      const imageIndex = state.images.findIndex(image => image.pk === action.payload.pk);
      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      const updatedImage = {
        ...state.images[imageIndex],
        isWip: true
      };

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), updatedImage, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.MARK_IMAGE_AS_FINAL_SUCCESS: {
      const imagePk = action.payload.pk;
      const revisionLabel = action.payload.revisionLabel;

      const imageIndex = state.images.findIndex(i => i.pk === imagePk);
      if (imageIndex < 0) {
        return state;
      } // If image not found, return the original state

      // Create a deep copy of the image object
      const image = {
        ...state.images[imageIndex],
        revisions: state.images[imageIndex].revisions.map(revision => ({ ...revision }))
      };

      if (revisionLabel === ORIGINAL_REVISION_LABEL) {
        image.isFinal = true;
        image.revisions.forEach(revision => {
          revision.isFinal = false;
        });
        image.thumbnails.forEach(thumbnail => {
          thumbnail.revision = FINAL_REVISION_LABEL;
        });
      } else {
        image.isFinal = false;
        image.thumbnails.forEach(thumbnail => {
          thumbnail.revision = ORIGINAL_REVISION_LABEL;
        });
        image.revisions.forEach(revision => {
          revision.isFinal = revision.label === revisionLabel;
        });
      }

      // Return new state with the updated image
      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), image, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.DELETE_ORIGINAL_IMAGE_SUCCESS:
    case AppActionTypes.DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE_SUCCESS:
    case AppActionTypes.SUBMIT_IMAGE_FOR_IOTD_TP_CONSIDERATION_SUCCESS: {
      const imageIndex = state.images.findIndex(image => image.pk === action.payload.image.pk);
      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), action.payload.image, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.DELETE_IMAGE_REVISION_SUCCESS: {
      const imageIndex = state.images.findIndex(image =>
        image.revisions.some(revision => revision.pk === action.payload.pk)
      );
      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      const image = { ...state.images[imageIndex] };
      const revision = image.revisions.find(revision => revision.pk === action.payload.pk);
      image.revisions = image.revisions.filter(revision => revision.pk !== action.payload.pk);
      image.thumbnails = image.thumbnails.filter(thumbnail => thumbnail.revision !== revision.label);

      if (revision.isFinal) {
        image.isFinal = true;
        image.thumbnails = image.thumbnails.filter(thumbnail => thumbnail.revision !== FINAL_REVISION_LABEL);
        image.thumbnails = image.thumbnails
          .filter(thumbnail => thumbnail.revision === ORIGINAL_REVISION_LABEL)
          .map(thumbnail => ({
            ...thumbnail,
            revision: FINAL_REVISION_LABEL
          }));
      }

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), image, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.DELETE_IMAGE_SUCCESS: {
      return {
        ...state,
        images: state.images.filter(image => image.pk !== action.payload.pk)
      };
    }

    case AppActionTypes.UNDELETE_IMAGE_SUCCESS: {
      const imageIndex = state.images.findIndex(image => image.pk === action.payload.pk);

      if (imageIndex === -1) {
        return state;
      } // If the image is not found, return the original state

      const image = { ...state.images[imageIndex] };
      image.deleted = null;

      return {
        ...state,
        images: [...state.images.slice(0, imageIndex), image, ...state.images.slice(imageIndex + 1)]
      };
    }

    case AppActionTypes.LOAD_THUMBNAIL_SUCCESS: {
      return {
        ...state,
        thumbnails: UtilsService.arrayUniqueObjects([...state.thumbnails, action.payload], null, false)
      };
    }

    case AppActionTypes.LOAD_SOLUTION_SUCCESS: {
      const imageContentType = findImageContentType(state);
      let image: ImageInterface = null;

      if (imageContentType && action.payload.contentType === imageContentType.id) {
        image = findImage(state, parseInt(action.payload.objectId, 10));
        if (image) {
          image = {
            ...image,
            solution: action.payload
          };
        }
      }

      return {
        ...state,
        images: image
          ? [
              ...state.images.slice(
                0,
                state.images.findIndex(i => i.pk === image.pk)
              ),
              image,
              ...state.images.slice(state.images.findIndex(i => i.pk === image.pk) + 1)
            ]
          : state.images,
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
          UtilsService.arrayUniqueObjects([...(state.nestedComments || []), ...action.payload.nestedComments], "id"),
          "created"
        )
      };
    }

    case AppActionTypes.LOAD_NESTED_COMMENT_SUCCESS:
    case AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS:
    case AppActionTypes.UPDATE_NESTED_COMMENT_SUCCESS: {
      return {
        ...state,
        nestedComments: UtilsService.sortObjectsByProperty(
          UtilsService.arrayUniqueObjects([...(state.nestedComments || []), ...[action.payload.nestedComment]], "id"),
          "created"
        )
      };
    }

    case AppActionTypes.APPROVE_NESTED_COMMENT_SUCCESS: {
      return {
        ...state,
        nestedComments: state.nestedComments.map(comment =>
          comment.id === action.payload.nestedComment.id
            ? {
                ...comment,
                pendingModeration: false
              }
            : comment
        )
      };
    }

    case AppActionTypes.DELETE_NESTED_COMMENT_SUCCESS: {
      return {
        ...state,
        nestedComments: state.nestedComments.filter(comment => comment.id !== action.payload.id)
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

    case AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES_SUCCESS: {
      return {
        ...state,
        remoteSourceAffiliates: action.payload.affiliates
      };
    }

    case AppActionTypes.LOAD_GROUPS_SUCCESS: {
      return {
        ...state,
        groups: action.payload.groups
      };
    }

    case AppActionTypes.LOAD_COLLECTIONS_SUCCESS: {
      return {
        ...state,
        collections: UtilsService.arrayUniqueObjects(
          [...(state.collections || []), ...action.payload.collections],
          "id"
        ).sort((a, b) => a.name.localeCompare(b.name))
      };
    }

    case AppActionTypes.FIND_COLLECTIONS_SUCCESS: {
      return {
        ...state,
        collections: UtilsService.arrayUniqueObjects(
          [...(state.collections || []), ...action.payload.response.results],
          "id"
        ).sort((a, b) => a.name.localeCompare(b.name))
      };
    }

    case AppActionTypes.CREATE_COLLECTION_SUCCESS: {
      return {
        ...state,
        collections: UtilsService.arrayUniqueObjects(
          [...(state.collections || []), action.payload.collection],
          "id"
        ).sort((a, b) => a.name.localeCompare(b.name))
      };
    }

    case AppActionTypes.UPDATE_COLLECTION_SUCCESS: {
      return {
        ...state,
        collections: UtilsService.arrayUniqueObjects(
          [...state.collections.filter(i => i.id !== action.payload.collection.id), action.payload.collection],
          "id"
        ).sort((a, b) => a.name.localeCompare(b.name))
      };
    }

    case AppActionTypes.ADD_IMAGE_TO_COLLECTION_SUCCESS: {
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.collectionId
            ? {
                ...collection,
                images: [...(collection.images || []), action.payload.imageId],
                imageCountIncludingWip: collection.imageCountIncludingWip + 1
              }
            : collection
        )
      };
    }

    case AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS: {
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.collectionId
            ? {
                ...collection,
                images: (collection.images || []).filter(i => i !== action.payload.imageId),
                imageCountIncludingWip: collection.imageCountIncludingWip - 1
              }
            : collection
        )
      };
    }

    case AppActionTypes.SET_COLLECTION_COVER_IMAGE_SUCCESS: {
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.collectionId
            ? {
                ...collection,
                coverThumbnail: action.payload.coverThumbnail,
                coverThumbnailHd: action.payload.coverThumbnailHd,
                squareCropping: action.payload.squareCropping,
                w: action.payload.w,
                h: action.payload.h
              }
            : collection
        )
      };
    }

    case AppActionTypes.DELETE_COLLECTION_SUCCESS: {
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload.collectionId)
      };
    }

    default: {
      return state;
    }
  }
}
