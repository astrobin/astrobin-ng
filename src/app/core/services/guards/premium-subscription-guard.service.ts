import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { MainState } from "@app/store/state";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { switchMap, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PremiumSubscriptionGuardService extends BaseService {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, redirect = true): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.store$
        .pipe(
          take(1),
          switchMap(storeState =>
            this.userSubscriptionService.hasValidSubscription$(storeState.auth.userProfile, [
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
            void this.router.navigateByUrl(this.router.createUrlTree(["/permission-denied"])).then(() => {
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
