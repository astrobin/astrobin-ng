import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { AuthState } from "@features/account/store/auth.reducers";
import { createSelector } from "@ngrx/store";

export const selectAuth = (state: MainState): AuthState => state.auth;

export const selectCurrentUser = createSelector(selectAuth, state => state.user);

export const selectCurrentUserProfile = createSelector(selectAuth, state => state.userProfile);

export const selectUsers = createSelector(selectAuth, state => state.users);

export const selectUser = createSelector(
  selectUsers,
  (users: UserInterface[], id: UserInterface["id"]): UserInterface => {
    const matching = users.filter(user => user.id === id);
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectUserByUsername = createSelector(
  selectUsers,
  (users: UserInterface[], username: UserInterface["username"]): UserInterface => {
    const matching = users.filter(user => user.username === username);
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectUserProfiles = createSelector(selectAuth, state => state.userProfiles);

export const selectUserProfile = createSelector(
  selectUserProfiles,
  (userProfiles: UserProfileInterface[], id: UserProfileInterface["id"]): UserProfileInterface => {
    const matching = userProfiles.filter(userProfile => userProfile.id === id);
    return matching.length > 0 ? matching[0] : null;
  }
);
