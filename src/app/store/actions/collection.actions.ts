import { GetCollectionsParamsInterface } from "@shared/services/api/classic/collections/collection-api.service";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";

export class LoadCollections implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_COLLECTIONS;

  constructor(public payload: { params: GetCollectionsParamsInterface }) {
  }
}

export class LoadCollectionsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_COLLECTIONS_SUCCESS;

  constructor(public payload: { params: GetCollectionsParamsInterface, collections: CollectionInterface[] }) {
  }
}

export class LoadCollectionsFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_COLLECTIONS_FAILURE;

  constructor(public payload: { params: GetCollectionsParamsInterface, error: any }) {
  }
}

export class UpdateCollection implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_COLLECTION;

  constructor(public payload: { collection: CollectionInterface }) {
  }
}

export class UpdateCollectionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_COLLECTION_SUCCESS;

  constructor(public payload: { collection: CollectionInterface }) {
  }
}

export class UpdateCollectionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_COLLECTION_FAILURE;

  constructor(public payload: { collection: CollectionInterface, error: any }) {
  }
}

export class DeleteCollection implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_COLLECTION;

  constructor(public payload: { collectionId: CollectionInterface["id"] }) {
  }
}

export class DeleteCollectionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_COLLECTION_SUCCESS;

  constructor(public payload: { collectionId: CollectionInterface["id"] }) {
  }
}

export class DeleteCollectionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_COLLECTION_FAILURE;

  constructor(public payload: { collectionId: CollectionInterface["id"], error: any }) {
  }
}
