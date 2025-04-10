import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { BaseService } from "@core/services/base.service";
import { PremiumSubscriptionGuardService } from "@core/services/guards/premium-subscription-guard.service";
import { UltimateSubscriptionGuardService } from "@core/services/guards/ultimate-subscription-guard.service";
import { LoadingService } from "@core/services/loading.service";
import { Observable, concat } from "rxjs";
import { reduce, tap } from "rxjs/operators";

@Injectable()
export class UploaderGuardService extends BaseService {
  constructor(
    public loadingService: LoadingService,
    public premiumGuard: PremiumSubscriptionGuardService,
    public ultimateGuard: UltimateSubscriptionGuardService,
    public router: Router
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return concat(
      this.premiumGuard.canActivate(route, state, false),
      this.ultimateGuard.canActivate(route, state, false)
    ).pipe(
      reduce((acc, val) => acc || val),
      tap(result => {
        if (!result) {
          this.router.navigateByUrl(this.router.createUrlTree(["/permission-denied"]));
          return false;
        }
      })
    );
  }
}
