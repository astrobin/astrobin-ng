import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import * as fromIotd from "./iotd.reducer";
import { IotdState } from "./iotd.reducer";

export const selectIotdState = createFeatureSelector<fromIotd.IotdState>(fromIotd.iotdFeatureKey);

export const selectSubmissionQueue = createSelector(
  selectIotdState,
  (state: IotdState): PaginatedApiResultInterface<ImageInterface> => state.submissionQueue
);
