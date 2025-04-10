import type { PaymentInterface } from "@core/interfaces/payment.interface";
import type { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { Observable } from "rxjs";

export interface CommonApiServiceInterface {
  getUser(id: number): Observable<UserInterface>;

  getCurrentUserProfile(): Observable<UserProfileInterface>;

  getSubscriptions(): Observable<SubscriptionInterface[]>;

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]>;

  getPayments(): Observable<PaymentInterface[]>;

  /**
   * Upload a new avatar for the current user
   * @param avatarFile The image file to upload as avatar
   * @returns Observable with the response containing success status and new avatar URL
   */
  uploadAvatar(avatarFile: File): Observable<{ success: boolean; avatar_url: string; errors?: any }>;

  /**
   * Delete all avatars for the current user
   * @returns Observable with the response containing success status
   */
  deleteAvatar(avatarId: UserInterface["avatarId"]): Observable<{ success: boolean; detail?: string }>;
}
