import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { SubmissionQueueActions, SubmissionQueueActionTypes } from "./submission-queue.actions";

export const submissionQueueFeatureKey = "submissionQueue";

// tslint:disable-next-line:no-empty-interface
export interface SubmissionQueueStoreEntryInterface extends ImageInterface {}

export interface State {
  entries: PaginatedApiResultInterface<SubmissionQueueStoreEntryInterface> | null;
}

export const initialState: State = {
  entries: null
};

export function reducer(state = initialState, action: SubmissionQueueActions): State {
  switch (action.type) {
    case SubmissionQueueActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS:
      return {
        ...state,
        ...action.payload.data
      };

    default:
      return state;
  }
}
