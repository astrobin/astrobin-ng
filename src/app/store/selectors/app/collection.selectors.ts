import { createSelector } from "@ngrx/store";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { GetCollectionsParamsInterface } from "@core/services/api/classic/collections/collection-api.service";
import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";

export const selectCollections = createSelector(
  selectApp,
  (state: AppState) => state.collections // Assuming collections are stored in AppState
);

export const selectCollectionsByParams = (params: GetCollectionsParamsInterface) => createSelector(
  selectCollections,
  (collections: CollectionInterface[]) => {
    if (!collections) {
      return null;
    }

    let result: CollectionInterface[] = collections;

    if (params.user !== undefined) {
      // Filter collections by the user id
      result = result.filter(collection => collection.user === params.user);
    }

    if (params.ids !== undefined && params.ids.length > 0) {
      // Filter collections by the ids
      result = result.filter(collection => params.ids.includes(collection.id));
    }

    if (params.parent !== undefined) {
      // Filter collections by the parent id
      result = result.filter(collection => collection.parent === params.parent);
    }

    return result;
  }
);
