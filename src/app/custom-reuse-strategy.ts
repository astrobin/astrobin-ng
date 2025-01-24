import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router";
import { Inject, PLATFORM_ID } from "@angular/core";
import { LocationStrategy } from "@angular/common";

interface RouteReuseConfig {
  onlyReuseOnBackNavigation?: boolean;
}

interface RouteCacheEntry {
  handle: DetachedRouteHandle;
  scrollPosition?: number;
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  routesToCache: Record<string, RouteReuseConfig> = {
    '': { onlyReuseOnBackNavigation: true },
    '/search': { onlyReuseOnBackNavigation: true },
    '/explore/constellations': {},
    '/explore/iotd-tp-archive': { onlyReuseOnBackNavigation: true },
  };

  private cache: Map<string, RouteCacheEntry> = new Map();
  private isBackNavigation = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    locationStrategy: LocationStrategy
  ) {
    locationStrategy.onPopState(() => {
      this.isBackNavigation = true;
      setTimeout(() => {
        this.isBackNavigation = false;
      }, 100);
    });
  }

  private shouldCachePath(path: string): boolean {
    const basePath = path.split(/[?#]/)[0];

    // Check for exact matches first
    if (basePath in this.routesToCache) {
      console.log('✅ Exact match found for', basePath);
      return true;
    }

    // Check for parameterized routes
    for (const cacheablePath of Object.keys(this.routesToCache)) {
      if (cacheablePath.includes(':')) {
        const regex = new RegExp('^' + cacheablePath.replace(/:[^/]+/g, '[^/]+') + '$');
        if (regex.test(basePath)) {
          console.log('✅ Parameterized match found for', basePath);
          return true;
        }
      }
    }

    console.log('❌ No match found for', basePath);
    return false;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const shouldReuse = future.routeConfig === curr.routeConfig;
    console.log('🤔 shouldReuseRoute?', {
      current: this.getPath(curr),
      future: this.getPath(future),
      result: shouldReuse
    });
    return shouldReuse;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];
    const cacheEntry = this.cache.get(path);
    const config = this.routesToCache[basePath];

    if (!cacheEntry || !route.component) {
      return false;
    }

    if (config?.onlyReuseOnBackNavigation && !this.isBackNavigation) {
      console.log('🔍 shouldAttach? No - not back navigation with onlyReuseOnBackNavigation', {
        path,
        isBack: this.isBackNavigation
      });
      return false;
    }

    const canAttach = this.shouldCachePath(path) && !!cacheEntry && !!route.component;
    console.log('🔍 shouldAttach?', {
      path,
      cached: !!cacheEntry,
      hasComponent: !!route.component,
      result: canAttach
    });
    return canAttach;
  }


  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.component) {
      console.log('⚠️ retrieve: No component found');
      return null;
    }

    const path = this.getPath(route);
    const cacheEntry = this.cache.get(path);

    if (this.isBackNavigation && cacheEntry?.scrollPosition) {
      const checkScrollHeight = () => {
        if (document.documentElement.scrollHeight >= cacheEntry.scrollPosition) {
          window.scrollTo(0, cacheEntry.scrollPosition);
        } else {
          setTimeout(checkScrollHeight, 25);
        }
      };
      setTimeout(checkScrollHeight, 25);
    }

    console.log('📤 retrieve:', {
      path,
      foundHandle: !!cacheEntry,
      isBack: this.isBackNavigation,
      scrollPos: cacheEntry?.scrollPosition
    });

    return cacheEntry?.handle || null;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.children.length > 0) {
      console.log('💾 shouldDetach? No - has children:', {
        path: this.getPath(route),
        children: route.children.length
      });
      return false;
    }

    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];
    const shouldDetach = basePath in this.routesToCache;
    console.log('💾 shouldDetach?', {
      path,
      exactRoute: basePath,
      result: shouldDetach
    });
    return shouldDetach;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const path = this.getPath(route);
    const basePath = path.split(/[?#]/)[0];

    if (basePath in this.routesToCache && handle) {
      console.log('📥 storing route:', {
        path,
        exactRoute: basePath,
        currentCacheSize: this.cache.size,
        scrollPosition: window.scrollY
      });
      this.cache.set(path, { handle, scrollPosition: window.scrollY });
    } else {
      console.log('❌ not storing route:', {
        path,
        exactRoute: basePath,
        inRoutesToCache: basePath in this.routesToCache,
        hasHandle: !!handle
      });
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

    const basePath = '/' + paths.join("/").replace(/\/+/g, '/');
    return basePath.replace(/\/+$/g, '');
  }
}
