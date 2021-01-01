import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";

export const iotdFeatureKey = "iotd";

// tslint:disable-next-line:no-empty-interface
export interface SubmissionImageInterface extends ImageInterface {}

export interface IotdState {
  submissionQueue: PaginatedApiResultInterface<SubmissionImageInterface> | null;
  hiddenSubmissionEntries: number[];
  submissions: SubmissionInterface[];
}

export const initialIotdState: IotdState = {
  submissionQueue: null,
  hiddenSubmissionEntries: [],
  submissions: []
};

export function reducer(state = initialIotdState, action: IotdActions): IotdState {
  switch (action.type) {
    case IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS:
      return {
        ...state,
        submissionQueue: action.payload
      };

    case IotdActionTypes.LOAD_SUBMISSIONS_SUCCESS:
      return {
        ...state,
        submissions: action.payload
      };

    case IotdActionTypes.POST_SUBMISSION_SUCCESS:
      return {
        ...state,
        submissions: [...state.submissions, ...[action.payload]]
      };

    case IotdActionTypes.DELETE_SUBMISSION_SUCCESS:
      return {
        ...state,
        submissions: state.submissions.filter(submission => submission.id !== action.payload.id)
      };

    case IotdActionTypes.INIT_HIDDEN_SUBMISSION_ENTRIES_SUCCESS:
      return {
        ...state,
        hiddenSubmissionEntries: action.payload.ids
      };

    case IotdActionTypes.HIDE_SUBMISSION_ENTRY:
      return {
        ...state,
        hiddenSubmissionEntries: [...state.hiddenSubmissionEntries, action.payload.id]
      };

    default:
      return state;
  }
}
