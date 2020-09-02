import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Constants } from "@shared/constants";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Injectable()
export class PremiumSubscriptionGuardService extends BaseService implements CanActivate {
  constructor(
    public loadingService: LoadingService,
    public appContextService: AppContextService,
    public router: Router
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, redirect = true): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.appContextService.context$.pipe(take(1)).subscribe(context => {
        const premium = context.subscriptions.filter(
          subscription => subscription.name === Constants.ASTROBIN_PREMIUM
        )[0];

        const premiumAutorenew = context.subscriptions.filter(
          subscription => subscription.name === Constants.ASTROBIN_PREMIUM_AUTORENEW
        )[0];

        if (
          context.currentUserSubscriptions.filter(userSubscription => {
            return (
              ((!!premium && userSubscription.subscription === premium.id) ||
                (premiumAutorenew && userSubscription.subscription === premiumAutorenew.id)) &&
              userSubscription.valid
            );
          }).length > 0
        ) {
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
