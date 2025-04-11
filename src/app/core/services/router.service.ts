import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router, UrlTree } from "@angular/router";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { WindowRefService } from "@core/services/window-ref.service";

@Injectable({ providedIn: "root" })
export class RouterService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    private readonly windowRefService: WindowRefService,
    private readonly location: Location
  ) {
    super(loadingService);
  }

  static getCurrentPath(route: ActivatedRoute): string {
    return route.snapshot.pathFromRoot
      .map(r => r.routeConfig?.path || "")
      .filter(segment => segment !== "")
      .join("/");
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
