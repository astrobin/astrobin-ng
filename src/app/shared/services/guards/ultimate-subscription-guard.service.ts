import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Constants } from "@shared/constants";
import { AppContextService } from "@shared/services/app-context.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Injectable()
export class UltimateSubscriptionGuardService extends BaseService implements CanActivate {
  constructor(
    public loadingService: LoadingService,
    public appContextService: AppContextService,
    public router: Router
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.appContextService.context$.pipe(take(1)).subscribe(context => {
        const ultimate = context.subscriptions.filter(
          subscription => subscription.name === Constants.ASTROBIN_ULTIMATE_2020
        )[0];
        if (
          context.currentUserSubscriptions.filter(userSubscription => {
            return userSubscription.subscription === ultimate.id && userSubscription.valid;
          }).length > 0
        ) {
          observer.next(true);
          observer.complete();
          return;
        }

        this.router
          .navigateByUrl(
            this.router.createUrlTree(["/permission-denied"], {
              queryParams: {
                reason: "ultimate-subscription-required"
              }
            })
          )
          .then(() => {
            observer.next(false);
            observer.complete();
          });
      });
    });
  }
}
