import { PaymentInterface } from "@core/interfaces/payment.interface";
import { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { Observable } from "rxjs";

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
  deleteAvatar(): Observable<{ success: boolean; detail?: string }>;
}
