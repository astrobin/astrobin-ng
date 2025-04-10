import { isPlatformBrowser, LocationStrategy } from "@angular/common";
import { Inject, PLATFORM_ID } from "@angular/core";
import type { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router";

interface RouteReuseConfig {
  onlyReuseOnBackNavigation?: boolean;
}

interface RouteCacheEntry {
  handle: DetachedRouteHandle;
  scrollPosition?: number;
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  routesToCache: Record<string, RouteReuseConfig> = {
    "": { onlyReuseOnBackNavigation: true },
    "/search": { onlyReuseOnBackNavigation: true },
    "/explore/constellations": {},
    "/explore/iotd-tp-archive": { onlyReuseOnBackNavigation: true }
  };

  private readonly _isBrowser: boolean;
  private _cache: Map<string, RouteCacheEntry> = new Map();
  private _isBackNavigation = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object, locationStrategy: LocationStrategy) {
    this._isBrowser = isPlatformBrowser(platformId);
    if (this._isBrowser) {
      locationStrategy.onPopState(() => {
        this._isBackNavigation = true;
        setTimeout(() => {
          this._isBackNavigation = false;
        }, 100);
      });
    }
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!this._isBrowser) {
      return false;
    }

    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];
    const cacheEntry = this._cache.get(path);
    const config = this.routesToCache[basePath];

    if (!cacheEntry || !route.component) {
      return false;
    }

    if (config?.onlyReuseOnBackNavigation && !this._isBackNavigation) {
      return false;
    }

    return this.shouldCachePath(path) && !!cacheEntry && !!route.component;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!this._isBrowser || !route.component) {
      return null;
    }

    const path = this.getPath(route);
    const cacheEntry = this._cache.get(path);

    if (this._isBackNavigation && cacheEntry?.scrollPosition) {
      const checkScrollHeight = () => {
        if (document.documentElement.scrollHeight >= cacheEntry.scrollPosition) {
          window.scrollTo(0, cacheEntry.scrollPosition);
        } else {
          setTimeout(checkScrollHeight, 25);
        }
      };
      setTimeout(checkScrollHeight, 25);
    }

    return cacheEntry?.handle || null;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!this._isBrowser || route.children.length > 0) {
      return false;
    }

    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];
    return basePath in this.routesToCache;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!this._isBrowser) {
      return;
    }

    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];

    if (basePath in this.routesToCache && handle) {
      this._cache.set(path, { handle, scrollPosition: window.scrollY });
    }
  }

  getPath(route: ActivatedRouteSnapshot): string {
    if (!route.routeConfig) {
      return "";
    }

    const paths = route.pathFromRoot
      .filter(r => r.routeConfig)
      .map(r => r.routeConfig!.path || "")
      .filter(Boolean);

    const basePath = "/" + paths.join("/").replace(/\/+/g, "/");
    return basePath.replace(/\/+$/g, "");
  }

  private shouldCachePath(path: string): boolean {
    const basePath = path.split(/[?#]/)[0];

    if (basePath in this.routesToCache) {
      return true;
    }

    for (const cacheablePath of Object.keys(this.routesToCache)) {
      if (cacheablePath.includes(":")) {
        const regex = new RegExp("^" + cacheablePath.replace(/:[^/]+/g, "[^/]+") + "$");
        if (regex.test(basePath)) {
          return true;
        }
      }
    }

    return false;
  }
}
