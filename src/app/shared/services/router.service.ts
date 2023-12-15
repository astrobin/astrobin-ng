import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";

@Injectable(
  { providedIn: "root" }
)
export class RouterService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    private readonly windowRefService: WindowRefService
  ) {
    super(loadingService);
  }

  redirectToLogin(): Promise<boolean> {
    return this.router
      .navigateByUrl(
        this.router.createUrlTree(["/account/logging-in"], {
          queryParams: {
            redirectUrl: this.windowRefService.getCurrentUrl().toString()
          }
        })
      );
  }
}
