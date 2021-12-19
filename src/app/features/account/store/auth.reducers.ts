import { All, AuthActionTypes } from "@features/account/store/auth.actions";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

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

export function reducer(state = initialAuthState, action: All): AuthState {
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
    default: {
      return state;
    }
  }
}
