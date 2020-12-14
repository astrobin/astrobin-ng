import { All, AuthActionTypes } from "@features/account/store/auth.actions";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export interface State {
  initialized: boolean;
  user: UserInterface | null;
  userProfile: UserProfileInterface | null;
  userSubscriptions: UserSubscriptionInterface[];
}

export const initialState: State = {
  initialized: false,
  user: null,
  userProfile: null,
  userSubscriptions: []
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case AuthActionTypes.INITIALIZE_SUCCESS:
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        initialized: true,
        user: action.payload.user,
        userProfile: action.payload.userProfile,
        userSubscriptions: action.payload.userSubscriptions
      };
    default: {
      return state;
    }
  }
}
