import {
  DismissedImage,
  HiddenImage,
  IotdInterface,
  SubmissionInterface,
  SubmitterSeenImage,
  VoteInterface
} from "@features/iotd/services/iotd-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { StaffMemberSettingsInterface } from "@features/iotd/types/staff-member-settings.interface";
import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";

export const iotdFeatureKey = "iotd";

export interface IotdState {
  staffMemberSettings: StaffMemberSettingsInterface;
  hiddenImages: HiddenImage[];
  submitterSeenImages: SubmitterSeenImage[];
  dismissedImages: DismissedImage[];

  submissionQueue: PaginatedApiResultInterface<SubmissionImageInterface> | null;
  submissions: SubmissionInterface[];

  reviewQueue: PaginatedApiResultInterface<ReviewImageInterface> | null;
  votes: VoteInterface[];

  judgementQueue: PaginatedApiResultInterface<JudgementImageInterface> | null;
  futureIotds: IotdInterface[];
}

export const initialIotdState: IotdState = {
  staffMemberSettings: null,
  hiddenImages: [],
  submitterSeenImages: [],
  dismissedImages: [],

  submissionQueue: null,
  submissions: [],

  reviewQueue: null,
  votes: [],

  judgementQueue: null,
  futureIotds: []
};

export function reducer(state = initialIotdState, action: IotdActions): IotdState {
  switch (action.type) {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // GENERIC
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    case IotdActionTypes.LOAD_STAFF_MEMBER_SETTINGS_SUCCESS: {
      return {
        ...state,
        staffMemberSettings: action.payload.settings
      };
    }

    case IotdActionTypes.LOAD_HIDDEN_IMAGES_SUCCESS:
      return {
        ...state,
        hiddenImages: action.payload.hiddenImages
      };

    case IotdActionTypes.HIDE_IMAGE_SUCCESS:
      return {
        ...state,
        hiddenImages: [...state.hiddenImages, action.payload.hiddenImage]
      };

    case IotdActionTypes.LOAD_DISMISSED_IMAGES_SUCCESS:
      return {
        ...state,
        dismissedImages: action.payload.dismissedImages
      };

    case IotdActionTypes.LOAD_SUBMITTER_SEEN_IMAGES_SUCCESS:
      return {
        ...state,
        submitterSeenImages: action.payload.submitterSeenImages
      };

    case IotdActionTypes.MARK_SUBMITTER_SEEN_IMAGE_SUCCESS:
      return {
        ...state,
        submitterSeenImages: [...state.submitterSeenImages, action.payload.submitterSeenImage]
      };

    case IotdActionTypes.DISMISS_IMAGE_SUCCESS:
      return {
        ...state,
        dismissedImages: [...state.dismissedImages, action.payload.dismissedImage]
      };

    case IotdActionTypes.SHOW_IMAGE_SUCCESS:
      return {
        ...state,
        hiddenImages: state.hiddenImages.filter(hiddenImage => hiddenImage.image !== action.payload.id)
      };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SUBMISSIONS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    case IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS:
      return {
        ...state,
        submissionQueue: action.payload
      };

    case IotdActionTypes.CLEAR_SUBMISSION_QUEUE:
      return {
        ...state,
        submissionQueue: { count: 0, results: [], next: null, prev: null }
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // REVIEWS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    case IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS:
      return {
        ...state,
        reviewQueue: action.payload
      };

    case IotdActionTypes.CLEAR_REVIEW_QUEUE:
      return {
        ...state,
        reviewQueue: { count: 0, results: [], next: null, prev: null }
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // JUDGEMENT
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    case IotdActionTypes.LOAD_JUDGEMENT_QUEUE_SUCCESS:
      return {
        ...state,
        judgementQueue: action.payload
      };

    case IotdActionTypes.CLEAR_JUDGEMENT_QUEUE:
      return {
        ...state,
        judgementQueue: { count: 0, results: [], next: null, prev: null }
      };

    case IotdActionTypes.LOAD_FUTURE_IOTDS_SUCCESS:
      return {
        ...state,
        futureIotds: action.payload.futureIotds
      };

    case IotdActionTypes.POST_IOTD_SUCCESS:
      return {
        ...state,
        futureIotds: [...state.futureIotds, ...[action.payload]]
      };

    case IotdActionTypes.DELETE_IOTD_SUCCESS:
      return {
        ...state,
        futureIotds: state.futureIotds.filter(iotd => iotd.id !== action.payload.id)
      };

    default:
      return state;
  }
}
