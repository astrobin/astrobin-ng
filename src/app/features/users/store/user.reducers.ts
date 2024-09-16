import { UserActions } from "@features/users/store/user.actions";

export const userFeatureKey = "user";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserState {
}

export const initialUserState: UserState = {};

export function userReducer(state = initialUserState, action: UserActions): UserState {
  switch (action.type) {
    default:
      return state;
  }
}
