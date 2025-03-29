import { GetCollectionsParamsInterface } from "@core/services/api/classic/collections/collection-api.service";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ImageInterface } from "@core/interfaces/image.interface";

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

export class FindCollections implements PayloadActionInterface {
  readonly type = AppActionTypes.FIND_COLLECTIONS;

  constructor(public payload: { params: GetCollectionsParamsInterface }) {
  }
}

export class FindCollectionsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.FIND_COLLECTIONS_SUCCESS;

  constructor(public payload: {
    params: GetCollectionsParamsInterface,
    response: PaginatedApiResultInterface<CollectionInterface>
  }) {
  }
}

export class FindCollectionsFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.FIND_COLLECTIONS_FAILURE;

  constructor(public payload: { params: GetCollectionsParamsInterface, error: any }) {
  }
}

export class CreateCollection implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_COLLECTION;

  constructor(public payload: {
    parent: CollectionInterface["id"] | null,
    name: CollectionInterface["name"],
    description: CollectionInterface["description"] | null,
    orderByTag: CollectionInterface["orderByTag"] | null
  }) {
  }
}

export class CreateCollectionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_COLLECTION_SUCCESS;

  constructor(public payload: { collection: CollectionInterface }) {
  }
}

export class CreateCollectionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_COLLECTION_FAILURE;

  constructor(public payload: { error: any }) {
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

export class AddImageToCollection implements PayloadActionInterface {
  readonly type = AppActionTypes.ADD_IMAGE_TO_COLLECTION;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"] }) {
  }
}

export class AddImageToCollectionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.ADD_IMAGE_TO_COLLECTION_SUCCESS;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"] }) {
  }
}

export class AddImageToCollectionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.ADD_IMAGE_TO_COLLECTION_FAILURE;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"], error: any }) {
  }
}

export class RemoveImageFromCollection implements PayloadActionInterface {
  readonly type = AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"] }) {
  }
}

export class RemoveImageFromCollectionSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"] }) {
  }
}

export class RemoveImageFromCollectionFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_FAILURE;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"], error: any }) {
  }
}

export class SetCollectionCoverImage implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_COLLECTION_COVER_IMAGE;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"] }) {
  }
}

export class SetCollectionCoverImageSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_COLLECTION_COVER_IMAGE_SUCCESS;

  constructor(public payload: {
    collectionId: CollectionInterface["id"],
    imageId: ImageInterface["pk"],
    coverThumbnail: string,
    coverThumbnailHd: string
    squareCropping: string,
    w: number,
    h: number
  }) {
  }
}

export class SetCollectionCoverImageFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_COLLECTION_COVER_IMAGE_FAILURE;

  constructor(public payload: { collectionId: CollectionInterface["id"], imageId: ImageInterface["pk"], error: any }) {
  }
}
