import { AuthActionTypes } from "@features/account/store/auth.actions";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";

export interface AuthState {
  initialized: boolean;
  loggingOutViaBackend: boolean;

  // Current user
  user: UserInterface | null;
  userProfile: UserProfileInterface | null;
  userSubscriptions: UserSubscriptionInterface[];

  // Seen users
  users: UserInterface[];
  userProfiles: UserProfileInterface[];
}

export const initialAuthState: AuthState = {
  initialized: false,
  loggingOutViaBackend: false,
  user: null,
  userProfile: null,
  userSubscriptions: [],
  users: [],
  userProfiles: []
};

export function reducer(state = initialAuthState, action: PayloadActionInterface): AuthState {
  switch (action.type) {
    case AuthActionTypes.INITIALIZE_SUCCESS:
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        initialized: true,
        user: action.payload.user,
        userProfile: action.payload.userProfile,
        userSubscriptions: action.payload.userSubscriptions,
        users: action.payload.user
          ? UtilsService.arrayUniqueObjects([...state.users, ...[action.payload.user]], "id")
          : state.users,
        userProfiles: action.payload.userProfile
          ? UtilsService.arrayUniqueObjects([...state.userProfiles, ...[action.payload.userProfile]], "id")
          : state.userProfiles
      };
    case AuthActionTypes.LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOutViaBackend: true,
        user: null,
        userProfile: null,
        userSubscriptions: []
      };
    case AuthActionTypes.UPDATE_CURRENT_USER_PROFILE_SUCCESS:
      return {
        ...state,
        userProfile: action.payload
      };
    case AuthActionTypes.LOAD_USER_SUCCESS:
      return {
        ...state,
        users: UtilsService.arrayUniqueObjects([...state.users, ...[action.payload.user]], "id")
      };
    case AuthActionTypes.LOAD_USER_PROFILE_SUCCESS:
      return {
        ...state,
        userProfiles: UtilsService.arrayUniqueObjects([...state.userProfiles, ...[action.payload.userProfile]], "id")
      };
    case EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_SUCCESS:
      const feedback: MarketplaceFeedbackInterface = action.payload.feedback;
      const userIndex = state.users.findIndex(user => user.id === feedback.recipient);

      if (userIndex === -1) {
        return state;
      }

      // Update the user's feedback count
      const user = state.users[userIndex];
      const updatedUser = {
        ...user,
        marketplaceFeedbackCount: feedback.marketplaceFeedbackCount,
        marketplaceFeedback: feedback.marketplaceFeedback
      };

      return {
        ...state,
        users: [
          ...state.users.slice(0, userIndex),
          updatedUser,
          ...state.users.slice(userIndex + 1)
        ]
      };
    case EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS:
    case EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS:
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          agreedToMarketplaceTerms: new Date().toISOString()
        },
        userProfiles: UtilsService.arrayUniqueObjects([...state.userProfiles, ...[state.userProfile]], "id")
      };

    default: {
      return state;
    }
  }
}
