import { VoteInterface } from "@features/iotd/services/review-queue-api.service";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";

export const iotdFeatureKey = "iotd";

// tslint:disable-next-line:no-empty-interface
export interface SubmissionImageInterface extends ImageInterface {}

// tslint:disable-next-line:no-empty-interface
export interface ReviewImageInterface extends ImageInterface {}

export type PromotionImageInterface = SubmissionImageInterface | ReviewImageInterface;

export interface IotdState {
  submissionQueue: PaginatedApiResultInterface<SubmissionImageInterface> | null;
  hiddenSubmissionEntries: number[];
  submissions: SubmissionInterface[];

  reviewQueue: PaginatedApiResultInterface<ReviewImageInterface> | null;
  hiddenReviewEntries: number[];
  votes: VoteInterface[];
}

export const initialIotdState: IotdState = {
  submissionQueue: null,
  hiddenSubmissionEntries: [],
  submissions: [],

  reviewQueue: null,
  hiddenReviewEntries: [],
  votes: []
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

    case IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS:
      return {
        ...state,
        reviewQueue: action.payload
      };

    case IotdActionTypes.LOAD_VOTES_SUCCESS:
      return {
        ...state,
        votes: action.payload
      };

    case IotdActionTypes.POST_VOTE_SUCCESS:
      return {
        ...state,
        votes: [...state.votes, ...[action.payload]]
      };

    case IotdActionTypes.DELETE_VOTE_SUCCESS:
      return {
        ...state,
        votes: state.votes.filter(review => review.id !== action.payload.id)
      };

    case IotdActionTypes.INIT_HIDDEN_REVIEW_ENTRIES_SUCCESS:
      return {
        ...state,
        hiddenReviewEntries: action.payload.ids
      };

    case IotdActionTypes.HIDE_REVIEW_ENTRY:
      return {
        ...state,
        hiddenReviewEntries: [...state.hiddenReviewEntries, action.payload.id]
      };

    default:
      return state;
  }
}
