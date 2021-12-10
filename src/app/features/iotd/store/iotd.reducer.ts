import {
  DismissedImage,
  HiddenImage,
  SubmissionInterface,
  VoteInterface
} from "@features/iotd/services/iotd-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { QueueSortOrder, StaffMemberSettingsInterface } from "@features/iotd/types/staff-member-settings.interface";

export const iotdFeatureKey = "iotd";

export interface IotdState {
  staffMemberSettings: StaffMemberSettingsInterface;
  submissionQueue: PaginatedApiResultInterface<SubmissionImageInterface> | null;
  submissions: SubmissionInterface[];

  reviewQueue: PaginatedApiResultInterface<ReviewImageInterface> | null;
  votes: VoteInterface[];

  hiddenImages: HiddenImage[];
  dismissedImages: DismissedImage[];
  dismissConfirmationSeen: boolean;
}

export const initialIotdState: IotdState = {
  staffMemberSettings: null,

  submissionQueue: null,
  submissions: [],

  reviewQueue: null,
  votes: [],

  hiddenImages: [],
  dismissedImages: [],
  dismissConfirmationSeen: false
};

export function reducer(state = initialIotdState, action: IotdActions): IotdState {
  switch (action.type) {
    case IotdActionTypes.LOAD_STAFF_MEMBER_SETTINGS_SUCCESS: {
      return {
        ...state,
        staffMemberSettings: action.payload.settings
      };
    }

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

    case IotdActionTypes.DISMISS_IMAGE_SUCCESS:
      return {
        ...state,
        dismissedImages: [...state.dismissedImages, action.payload.dismissedImage]
      };

    case IotdActionTypes.DISMISS_CONFIRMATION_SEEN:
      return {
        ...state,
        dismissConfirmationSeen: true
      };

    case IotdActionTypes.SHOW_IMAGE_SUCCESS:
      return {
        ...state,
        hiddenImages: state.hiddenImages.filter(hiddenImage => hiddenImage.image !== action.payload.id)
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

    default:
      return state;
  }
}
