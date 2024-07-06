import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Router, UrlTree } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Location } from "@angular/common";

@Injectable(
  { providedIn: "root" }
)
export class RouterService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    private readonly windowRefService: WindowRefService,
    private readonly location: Location
  ) {
    super(loadingService);
  }

  getLoginUrlTree(redirectUrl?: string): UrlTree {
    if (!redirectUrl) {
      redirectUrl = this.windowRefService.getCurrentUrl().toString();
    }

    return this.router.createUrlTree(["/account/logging-in"], {
      queryParams: {
        redirectUrl
      }
    });
  }

  getPermissionDeniedUrlTree(): UrlTree {
    return this.router.createUrlTree(["/permission-denied"]);
  }

  redirectToLogin(): Promise<boolean> {
    return this.router.navigateByUrl(this.getLoginUrlTree());
  }

  redirectToPermissionDenied(): Promise<boolean> {
    return this.router.navigateByUrl(this.getPermissionDeniedUrlTree());
  }

  redirectToUrl(url: string): void {
    this.windowRefService.nativeWindow.window.location.href = url;
  }

  updateQueryParams(queryParams: { [key: string]: any }): void {
    const url = this.location.path();
    const newUrl = url.split("?")[0] + "?" + new URLSearchParams(queryParams).toString();
    this.location.replaceState(newUrl);
  }
}
