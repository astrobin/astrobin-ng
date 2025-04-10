import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import type { UserInterface } from "@core/interfaces/user.interface";

export interface InitializeAuthSuccessInterface {
  user: UserInterface;
  userProfile: UserProfileInterface;
  userSubscriptions: UserSubscriptionInterface[];
}

export interface LoginPayloadInterface {
  handle: string;
  password: string;
  redirectUrl?: string;
}

export interface LoginFailureInterface {
  error: string;
}

export interface LoginSuccessInterface {
  user: UserInterface;
  userProfile: UserProfileInterface;
  userSubscriptions: UserSubscriptionInterface[];
  redirectUrl?: string;
}
