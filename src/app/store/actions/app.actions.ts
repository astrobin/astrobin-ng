/* eslint-disable max-classes-per-file */

import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { LoadCamera, LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { LoadContentType, LoadContentTypeSuccess } from "@app/store/actions/content-type.actions";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import {
  AcceptCollaboratorRequest, AcceptCollaboratorRequestFailure, AcceptCollaboratorRequestSuccess, DeleteImage, DeleteImageFailure, DeleteImageRevision, DeleteImageRevisionFailure, DeleteImageRevisionSuccess, DeleteImageSuccess, DeleteImageUncompressedSourceFile, DeleteImageUncompressedSourceFileFailure, DeleteImageUncompressedSourceFileSuccess, DeleteOriginalImage, DeleteOriginalImageFailure, DeleteOriginalImageSuccess, DenyCollaboratorRequest, DenyCollaboratorRequestFailure, DenyCollaboratorRequestSuccess, FindImages, FindImagesFailure, FindImagesSuccess, ForceCheckImageAutoLoad, ForceCheckTogglePropertyAutoLoad, LoadImage, LoadImageFailure, LoadImages, LoadImagesSuccess, LoadImageSuccess, MarkImageAsFinal, MarkImageAsFinalFailure, MarkImageAsFinalSuccess, PublishImage, PublishImageFailure, PublishImageSuccess, RemoveCollaborator, RemoveCollaboratorFailure, RemoveCollaboratorSuccess, SaveImage, SaveImageFailure, SaveImageRevision, SaveImageRevisionFailure, SaveImageRevisionSuccess, SaveImageSuccess, SetImage, SubmitImageForIotdTpConsideration, SubmitImageForIotdTpConsiderationFailure, SubmitImageForIotdTpConsiderationSuccess, UndeleteImage, UndeleteImageFailure, UndeleteImageSuccess, UnpublishImage, UnpublishImageFailure, UnpublishImageSuccess
} from "@app/store/actions/image.actions";
import { InitializeApp, InitializeAppSuccess } from "@app/store/actions/initialize-app.actions";
import { LoadSolution, LoadSolutionFailure, LoadSolutions, LoadSolutionsSuccess, LoadSolutionSuccess } from "@app/store/actions/solution.actions";
import { LoadTelescope, LoadTelescopeSuccess } from "@app/store/actions/telescope.actions";
import { LoadThumbnail, LoadThumbnailCancel, LoadThumbnailSuccess } from "@app/store/actions/thumbnail.actions";
import { CreateLocation, CreateLocationAddTag, CreateLocationSuccess } from "@app/store/actions/location.actions";
import { ApproveNestedComment, ApproveNestedCommentFailure, ApproveNestedCommentSuccess, CreateNestedComment, CreateNestedCommentFailure, CreateNestedCommentSuccess, DeleteNestedComment, DeleteNestedCommentFailure, DeleteNestedCommentSuccess, LoadNestedComment, LoadNestedCommentFailure, LoadNestedComments, LoadNestedCommentsSuccess, LoadNestedCommentSuccess } from "@app/store/actions/nested-comments.actions";
import { CreateToggleProperty, CreateTogglePropertyFailure, CreateTogglePropertySuccess, DeleteToggleProperty, DeleteTogglePropertyFailure, DeleteTogglePropertySuccess, LoadToggleProperty, LoadTogglePropertyFailure, LoadTogglePropertySuccess } from "@app/store/actions/toggle-property.actions";
import { LoadRemoteSourceAffiliates, LoadRemoteSourceAffiliatesFailure, LoadRemoteSourceAffiliatesSuccess } from "@app/store/actions/remote-source-affiliates.actions";
import { AddImageToCollection, AddImageToCollectionFailure, AddImageToCollectionSuccess, CreateCollection, CreateCollectionFailure, CreateCollectionSuccess, DeleteCollection, DeleteCollectionFailure, DeleteCollectionSuccess, FindCollections, FindCollectionsFailure, FindCollectionsSuccess, LoadCollections, LoadCollectionsFailure, LoadCollectionsSuccess, RemoveImageFromCollection, RemoveImageFromCollectionFailure, RemoveImageFromCollectionSuccess, SetCollectionCoverImage, SetCollectionCoverImageFailure, SetCollectionCoverImageSuccess, UpdateCollection, UpdateCollectionFailure, UpdateCollectionSuccess } from "@app/store/actions/collection.actions";
import { LoadGroups, LoadGroupsFailure, LoadGroupsSuccess } from "@app/store/actions/group.actions";

export enum AppActionTypes {
  INITIALIZE = "[App] Initialize",
  INITIALIZE_SUCCESS = "[App] Initialize success",

  SET_BREADCRUMB = "[App] Set breadcrumb",

  SHOW_FULLSCREEN_IMAGE = "[App] Show full screen image",
  HIDE_FULLSCREEN_IMAGE = "[App] Hide full screen image",

  LOAD_CONTENT_TYPE = "[App] Load content type",
  LOAD_CONTENT_TYPE_BY_ID = "[App] Load content type by id",
  LOAD_CONTENT_TYPE_SUCCESS = "[App] Load content type success",

  // Emit this to instruct images on a page to check for visibility and possibly autoload, for instance if items were
  // removed from the page, which might have caused images to become visible.
  FORCE_CHECK_IMAGE_AUTO_LOAD = "[App] Force check image auto load",
  FORCE_CHECK_TOGGLE_PROPERTY_AUTO_LOAD = "[App] Force check toggle property auto load",

  LOAD_IMAGE = "[App] Load image",
  LOAD_IMAGE_SUCCESS = "[App] Load image success",
  LOAD_IMAGE_FAILURE = "[App] Load image failure",

  SET_IMAGE = "[App] Set image",

  // This fetches images by ID(s)
  LOAD_IMAGES = "[App] Load images",
  LOAD_IMAGES_SUCCESS = "[App] Load images success",

  // This fetches images by various parameters.
  FIND_IMAGES = "[App] Find images",
  FIND_IMAGES_SUCCESS = "[App] Find images success",
  FIND_IMAGES_FAILURE = "[App] Find images failure",

  SAVE_IMAGE = "[App] Save image",
  SAVE_IMAGE_SUCCESS = "[App] Save image success",
  SAVE_IMAGE_FAILURE = "[App] Save image failure",

  LOAD_IMAGE_REVISIONS = "[App] Load image revisions",
  LOAD_IMAGE_REVISIONS_SUCCESS = "[App] Load image revisions success",

  SAVE_IMAGE_REVISION = "[App] Save image revision",
  SAVE_IMAGE_REVISION_SUCCESS = "[App] Save image revision success",
  SAVE_IMAGE_REVISION_FAILURE = "[App] Save image revision failure",

  PUBLISH_IMAGE = "[App] Publish image",
  PUBLISH_IMAGE_SUCCESS = "[App] Publish image success",
  PUBLISH_IMAGE_FAILURE = "[App] Publish image failure",

  UNPUBLISH_IMAGE = "[App] Unpublish image",
  UNPUBLISH_IMAGE_SUCCESS = "[App] Unpublish image success",
  UNPUBLISH_IMAGE_FAILURE = "[App] Unpublish image failure",

  MARK_IMAGE_AS_FINAL = "[App] Mark image as final",
  MARK_IMAGE_AS_FINAL_SUCCESS = "[App] Mark image as final success",
  MARK_IMAGE_AS_FINAL_FAILURE = "[App] Mark image as final failure",

  DELETE_ORIGINAL_IMAGE = "[App] Delete original image",
  DELETE_ORIGINAL_IMAGE_SUCCESS = "[App] Delete original image success",
  DELETE_ORIGINAL_IMAGE_FAILURE = "[App] Delete original image failure",

  DELETE_IMAGE_REVISION = "[App] Delete image revision",
  DELETE_IMAGE_REVISION_SUCCESS = "[App] Delete image revision success",
  DELETE_IMAGE_REVISION_FAILURE = "[App] Delete image revision failure",

  DELETE_IMAGE = "[App] Delete image",
  DELETE_IMAGE_SUCCESS = "[App] Delete image success",
  DELETE_IMAGE_FAILURE = "[App] Delete image failure",

  UNDELETE_IMAGE = "[App] Undelete image",
  UNDELETE_IMAGE_SUCCESS = "[App] Undelete image success",
  UNDELETE_IMAGE_FAILURE = "[App] Undelete image failure",

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

  LOAD_NESTED_COMMENT = "[App] Load nested comment",
  LOAD_NESTED_COMMENT_SUCCESS = "[App] Load nested comment success",
  LOAD_NESTED_COMMENT_FAILURE = "[App] Load nested comment failure",

  CREATE_NESTED_COMMENT = "[App] Save nested comment",
  CREATE_NESTED_COMMENT_SUCCESS = "[App] Save nested comment success",
  CREATE_NESTED_COMMENT_FAILURE = "[App] Save nested comment failure",

  APPROVE_NESTED_COMMENT = "[App] Approve nested comment",
  APPROVE_NESTED_COMMENT_SUCCESS = "[App] Approve nested comment success",
  APPROVE_NESTED_COMMENT_FAILURE = "[App] Approve nested comment failure",

  DELETE_NESTED_COMMENT = "[App] Delete nested comment",
  DELETE_NESTED_COMMENT_SUCCESS = "[App] Delete nested comment success",
  DELETE_NESTED_COMMENT_FAILURE = "[App] Delete nested comment failure",

  CREATE_TOGGLE_PROPERTY = "[App] Create toggle property",
  CREATE_TOGGLE_PROPERTY_SUCCESS = "[App] Create toggle property success",
  CREATE_TOGGLE_PROPERTY_FAILURE = "[App] Create toggle property failure",
  DELETE_TOGGLE_PROPERTY = "[App] Delete toggle property",
  DELETE_TOGGLE_PROPERTY_SUCCESS = "[App] Delete toggle property success",
  DELETE_TOGGLE_PROPERTY_FAILURE = "[App] Delete toggle property failure",
  LOAD_TOGGLE_PROPERTY = "[App] Load toggle property",
  LOAD_TOGGLE_PROPERTY_SUCCESS = "[App] Load toggle property success",
  LOAD_TOGGLE_PROPERTY_FAILURE = "[App] Load toggle property failure",

  LOAD_REMOTE_SOURCE_AFFILIATES = "[App] Load remote source affiliates",
  LOAD_REMOTE_SOURCE_AFFILIATES_SUCCESS = "[App] Load remote source affiliates success",
  LOAD_REMOTE_SOURCE_AFFILIATES_FAILURE = "[App] Load remote source affiliates failure",

  LOAD_GROUPS = "[App] Load groups",
  LOAD_GROUPS_SUCCESS = "[App] Load groups success",
  LOAD_GROUPS_FAILURE = "[App] Load groups failure",

  LOAD_COLLECTIONS = "[App] Load collections",
  LOAD_COLLECTIONS_SUCCESS = "[App] Load collections success",
  LOAD_COLLECTIONS_FAILURE = "[App] Load collections failure",

  FIND_COLLECTIONS = "[App] Find collections",
  FIND_COLLECTIONS_SUCCESS = "[App] Find collections success",
  FIND_COLLECTIONS_FAILURE = "[App] Find collections failure",

  CREATE_COLLECTION = "[App] Create collection",
  CREATE_COLLECTION_SUCCESS = "[App] Create collection success",
  CREATE_COLLECTION_FAILURE = "[App] Create collection failure",

  UPDATE_COLLECTION = "[App] Update collection",
  UPDATE_COLLECTION_SUCCESS = "[App] Update collection success",
  UPDATE_COLLECTION_FAILURE = "[App] Update collection failure",

  DELETE_COLLECTION = "[App] Delete collection",
  DELETE_COLLECTION_SUCCESS = "[App] Delete collection success",
  DELETE_COLLECTION_FAILURE = "[App] Delete collection failure",

  ADD_IMAGE_TO_COLLECTION = "[App] Add image to collection",
  ADD_IMAGE_TO_COLLECTION_SUCCESS = "[App] Add image to collection success",
  ADD_IMAGE_TO_COLLECTION_FAILURE = "[App] Add image to collection failure",

  SET_COLLECTION_COVER_IMAGE = "[App] Set collection cover image",
  SET_COLLECTION_COVER_IMAGE_SUCCESS = "[App] Set collection cover image success",
  SET_COLLECTION_COVER_IMAGE_FAILURE = "[App] Set collection cover image failure",

  REMOVE_IMAGE_FROM_COLLECTION = "[App] Remove image from collection",
  REMOVE_IMAGE_FROM_COLLECTION_SUCCESS = "[App] Remove image from collection success",
  REMOVE_IMAGE_FROM_COLLECTION_FAILURE = "[App] Remove image from collection failure",

  DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE = "[App] Delete image uncompressed source file",
  DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE_SUCCESS = "[App] Delete image uncompressed source file success",
  DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE_FAILURE = "[App] Delete image uncompressed source file failure",

  SUBMIT_IMAGE_FOR_IOTD_TP_CONSIDERATION = "[App] Submit image for IOTD/TP consideration",
  SUBMIT_IMAGE_FOR_IOTD_TP_CONSIDERATION_SUCCESS = "[App] Submit image for IOTD/TP consideration success",
  SUBMIT_IMAGE_FOR_IOTD_TP_CONSIDERATION_FAILURE = "[App] Submit image for IOTD/TP consideration failure",

  ACCEPT_COLLABORATOR_REQUEST = "[App] Accept collaborator request",
  ACCEPT_COLLABORATOR_REQUEST_SUCCESS = "[App] Accept collaborator request success",
  ACCEPT_COLLABORATOR_REQUEST_FAILURE = "[App] Accept collaborator request failure",
  DENY_COLLABORATOR_REQUEST = "[App] Deny collaborator request",
  DENY_COLLABORATOR_REQUEST_SUCCESS = "[App] Deny collaborator request success",
  DENY_COLLABORATOR_REQUEST_FAILURE = "[App] Deny collaborator request failure",
  REMOVE_COLLABORATOR = "[App] Remove collaborator",
  REMOVE_COLLABORATOR_SUCCESS = "[App] Remove collaborator success",
  REMOVE_COLLABORATOR_FAILURE = "[App] Remove collaborator failure"
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
  | ForceCheckTogglePropertyAutoLoad
  | LoadImage
  | LoadImageSuccess
  | LoadImageFailure
  | SetImage
  | SaveImage
  | SaveImageSuccess
  | SaveImageFailure
  | LoadImages
  | LoadImagesSuccess
  | FindImages
  | FindImagesSuccess
  | FindImagesFailure
  | SaveImageRevision
  | SaveImageRevisionSuccess
  | SaveImageRevisionFailure
  | PublishImage
  | PublishImageSuccess
  | PublishImageFailure
  | UnpublishImage
  | UnpublishImageSuccess
  | UnpublishImageFailure
  | MarkImageAsFinal
  | MarkImageAsFinalSuccess
  | MarkImageAsFinalFailure
  | DeleteOriginalImage
  | DeleteOriginalImageSuccess
  | DeleteOriginalImageFailure
  | DeleteImageRevision
  | DeleteImageRevisionSuccess
  | DeleteImageRevisionFailure
  | DeleteImage
  | DeleteImageSuccess
  | DeleteImageFailure
  | UndeleteImage
  | UndeleteImageSuccess
  | UndeleteImageFailure
  | LoadThumbnail
  | LoadThumbnailCancel
  | LoadThumbnailSuccess
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
  | LoadNestedComment
  | LoadNestedCommentSuccess
  | LoadNestedCommentFailure
  | CreateNestedComment
  | CreateNestedCommentSuccess
  | CreateNestedCommentFailure
  | ApproveNestedComment
  | ApproveNestedCommentSuccess
  | ApproveNestedCommentFailure
  | DeleteNestedComment
  | DeleteNestedCommentSuccess
  | DeleteNestedCommentFailure
  | CreateToggleProperty
  | CreateTogglePropertySuccess
  | CreateTogglePropertyFailure
  | DeleteToggleProperty
  | DeleteTogglePropertySuccess
  | DeleteTogglePropertyFailure
  | LoadToggleProperty
  | LoadTogglePropertySuccess
  | LoadTogglePropertyFailure
  | LoadRemoteSourceAffiliates
  | LoadRemoteSourceAffiliatesSuccess
  | LoadRemoteSourceAffiliatesFailure
  | LoadGroups
  | LoadGroupsSuccess
  | LoadGroupsFailure
  | LoadCollections
  | LoadCollectionsSuccess
  | LoadCollectionsFailure
  | FindCollections
  | FindCollectionsSuccess
  | FindCollectionsFailure
  | CreateCollection
  | CreateCollectionSuccess
  | CreateCollectionFailure
  | UpdateCollection
  | UpdateCollectionSuccess
  | UpdateCollectionFailure
  | AddImageToCollection
  | AddImageToCollectionSuccess
  | AddImageToCollectionFailure
  | RemoveImageFromCollection
  | RemoveImageFromCollectionSuccess
  | RemoveImageFromCollectionFailure
  | SetCollectionCoverImage
  | SetCollectionCoverImageSuccess
  | SetCollectionCoverImageFailure
  | DeleteCollection
  | DeleteCollectionSuccess
  | DeleteCollectionFailure
  | DeleteImageUncompressedSourceFile
  | DeleteImageUncompressedSourceFileSuccess
  | DeleteImageUncompressedSourceFileFailure
  | SubmitImageForIotdTpConsideration
  | SubmitImageForIotdTpConsiderationSuccess
  | SubmitImageForIotdTpConsiderationFailure
  | AcceptCollaboratorRequest
  | AcceptCollaboratorRequestSuccess
  | AcceptCollaboratorRequestFailure
  | DenyCollaboratorRequest
  | DenyCollaboratorRequestSuccess
  | DenyCollaboratorRequestFailure
  | RemoveCollaborator
  | RemoveCollaboratorSuccess
  | RemoveCollaboratorFailure;
