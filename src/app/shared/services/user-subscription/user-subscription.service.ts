import { Injectable } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UserSubscriptionServiceInterface } from "@shared/services/user-subscription/user-subscription.service-interface";
import { UserService } from "@shared/services/user.service";

@Injectable({
  providedIn: "root"
})
export class UserSubscriptionService extends BaseService implements UserSubscriptionServiceInterface {
  constructor(public loadingService: LoadingService, public userService: UserService) {
    super(loadingService);
  }

  public isUltimateSubscriber(user: UserInterface): boolean {
    return this.userService.isInGroup(user, "astrobin_ultimate_2020");
  }
}
