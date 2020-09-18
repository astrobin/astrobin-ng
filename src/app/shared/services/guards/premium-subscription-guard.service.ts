import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { Observable } from "rxjs";
import { switchMap, take } from "rxjs/operators";

@Injectable()
export class PremiumSubscriptionGuardService extends BaseService implements CanActivate {
  constructor(
    public loadingService: LoadingService,
    public appContextService: AppContextService,
    public userSubscriptionService: UserSubscriptionService,
    public router: Router
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, redirect = true): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.appContextService.context$
        .pipe(
          take(1),
          switchMap(context =>
            this.userSubscriptionService.hasValidSubscription(context.currentUserProfile, [
              SubscriptionName.ASTROBIN_PREMIUM,
              SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
            ])
          )
        )
        .subscribe(hasValidPremium => {
          if (hasValidPremium) {
            observer.next(true);
            observer.complete();
            return;
          }

          if (redirect) {
            this.router.navigateByUrl(this.router.createUrlTree(["/permission-denied"])).then(() => {
              observer.next(false);
              observer.complete();
            });
          } else {
            observer.next(false);
            observer.complete();
          }
        });
    });
  }
}
