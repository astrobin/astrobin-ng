/* eslint-disable max-classes-per-file */

import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { LoadCamera, LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { LoadContentType, LoadContentTypeSuccess } from "@app/store/actions/content-type.actions";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import {
  ForceCheckImageAutoLoad,
  LoadImage,
  LoadImageRevisions,
  LoadImageRevisionsSuccess,
  LoadImages,
  LoadImagesSuccess,
  LoadImageSuccess,
  SaveImage,
  SaveImageFailure,
  SaveImageSuccess,
  SetImage
} from "@app/store/actions/image.actions";
import { InitializeApp, InitializeAppSuccess } from "@app/store/actions/initialize-app.actions";
import {
  LoadSolution,
  LoadSolutionFailure,
  LoadSolutions,
  LoadSolutionsSuccess,
  LoadSolutionSuccess
} from "@app/store/actions/solution.actions";
import { LoadTelescope, LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import {
  LoadThumbnail,
  LoadThumbnailCancel,
  LoadThumbnailCanceled,
  LoadThumbnailSuccess
} from "@app/store/actions/thumbnail.actions";
import { CreateLocation, CreateLocationAddTag, CreateLocationSuccess } from "@app/store/actions/location.actions";
import {
  CreateNestedComment,
  CreateNestedCommentFailure,
  CreateNestedCommentSuccess,
  LoadNestedComments,
  LoadNestedCommentsSuccess
} from "@app/store/actions/nested-comments.actions";
import {
  CreateToggleProperty,
  CreateTogglePropertyFailure,
  CreateTogglePropertySuccess,
  DeleteToggleProperty,
  DeleteTogglePropertyFailure,
  DeleteTogglePropertySuccess,
  LoadToggleProperty,
  LoadTogglePropertyFailure,
  LoadTogglePropertySuccess
} from "@app/store/actions/toggle-property.actions";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success",

  SET_BREADCRUMB = "[App] Set breadcrumb",

  SHOW_FULLSCREEN_IMAGE = "[App] Show full screen image",
  HIDE_FULLSCREEN_IMAGE = "[App] Hide full screen image",

  LOAD_CONTENT_TYPE = "[App] Load content type",
  LOAD_CONTENT_TYPE_SUCCESS = "[App] Load content type success",

  // Emit this to instruct images on a page to check for visibility and possibly autoload, for instance if items were
  // removed from the page, which might have caused images to become visible.
  FORCE_CHECK_IMAGE_AUTO_LOAD = "[App] Force check image auto load",

  LOAD_IMAGE = "[App] Load image",
  LOAD_IMAGE_SUCCESS = "[App] Load image success",
  LOAD_IMAGE_FAILURE = "[App] Load image failure",

  SET_IMAGE = "[App] Set image",

  LOAD_IMAGES = "[App] Load images",
  LOAD_IMAGES_SUCCESS = "[App] Load images success",

  SAVE_IMAGE = "[App] Save image",
  SAVE_IMAGE_SUCCESS = "[App] Save image success",
  SAVE_IMAGE_FAILURE = "[App] Save image failure",

  LOAD_IMAGE_REVISIONS = "[App] Load image revisions",
  LOAD_IMAGE_REVISIONS_SUCCESS = "[App] Load image revisions success",

  LOAD_THUMBNAIL = "[App] Load thumbnail",
  LOAD_THUMBNAIL_CANCEL = "[App] Load thumbnail cancel",
  LOAD_THUMBNAIL_SUCCESS = "[App] Load thumbnail success",
  LOAD_THUMBNAIL_CANCELED = "[App] Load thumbnail canceled",

  LOAD_SOLUTION = "[App] Load solution",
  LOAD_SOLUTION_SUCCESS = "[App] Load solution success",
  LOAD_SOLUTION_FAILURE = "[App] Load solution failure",

  LOAD_SOLUTIONS = "[App] Load solutions",
  LOAD_SOLUTIONS_SUCCESS = "[App] Load solutions success",

  LOAD_TELESCOPE = "[App] Load telescope",
  LOAD_TELESCOPE_SUCCESS = "[App] Load telescope success",

  LOAD_CAMERA = "[App] Load camera",
  LOAD_CAMERA_SUCCESS = "[App] Load camera success",

  CREATE_LOCATION_ADD_TAG = "[App] Create location add tag",
  CREATE_LOCATION = "[App] Create location",
  CREATE_LOCATION_SUCCESS = "[App] Create location success",

  LOAD_NESTED_COMMENTS = "[App] Load nested comments",
  LOAD_NESTED_COMMENTS_SUCCESS = "[App] Load nested comments success",

  CREATE_NESTED_COMMENT = "[App] Save nested comment",
  CREATE_NESTED_COMMENT_SUCCESS = "[App] Save nested comment success",
  CREATE_NESTED_COMMENT_FAILURE = "[App] Save nested comment failure",

  CREATE_TOGGLE_PROPERTY = "[App] Create toggle property",
  CREATE_TOGGLE_PROPERTY_SUCCESS = "[App] Create toggle property success",
  CREATE_TOGGLE_PROPERTY_FAILURE = "[App] Create toggle property failure",
  DELETE_TOGGLE_PROPERTY = "[App] Delete toggle property",
  DELETE_TOGGLE_PROPERTY_SUCCESS = "[App] Delete toggle property success",
  DELETE_TOGGLE_PROPERTY_FAILURE = "[App] Delete toggle property failure",
  LOAD_TOGGLE_PROPERTY = "[App] Load toggle property",
  LOAD_TOGGLE_PROPERTY_SUCCESS = "[App] Load toggle property success",
  LOAD_TOGGLE_PROPERTY_FAILURE = "[App] Load toggle property failure"
}

export type All =
  | InitializeApp
  | InitializeAppSuccess
  | SetBreadcrumb
  | ShowFullscreenImage
  | HideFullscreenImage
  | LoadContentType
  | LoadContentTypeSuccess
  | ForceCheckImageAutoLoad
  | LoadImage
  | LoadImageSuccess
  | SetImage
  | SaveImage
  | SaveImageSuccess
  | SaveImageFailure
  | LoadImages
  | LoadImagesSuccess
  | LoadImageRevisions
  | LoadImageRevisionsSuccess
  | LoadThumbnail
  | LoadThumbnailCancel
  | LoadThumbnailSuccess
  | LoadThumbnailCanceled
  | LoadSolution
  | LoadSolutionSuccess
  | LoadSolutionFailure
  | LoadSolutions
  | LoadSolutionsSuccess
  | LoadTelescope
  | LoadTelescopeSuccess
  | LoadCamera
  | LoadCameraSuccess
  | CreateLocationAddTag
  | CreateLocation
  | CreateLocationSuccess
  | LoadNestedComments
  | LoadNestedCommentsSuccess
  | CreateNestedComment
  | CreateNestedCommentSuccess
  | CreateNestedCommentFailure
  | CreateToggleProperty
  | CreateTogglePropertySuccess
  | CreateTogglePropertyFailure
  | DeleteToggleProperty
  | DeleteTogglePropertySuccess
  | DeleteTogglePropertyFailure
  | LoadToggleProperty
  | LoadTogglePropertySuccess
  | LoadTogglePropertyFailure;
