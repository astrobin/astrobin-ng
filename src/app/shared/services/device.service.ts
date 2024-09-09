import { BaseService } from "@shared/services/base.service";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";

// Keep in sync with _breakpoints.scss
enum Breakpoint {
  XXS_MIN = 0,
  XXS_MAX = 475.98,
  XS_MIN = 476,
  XS_MAX = 575.98,
  SM_MIN = 576,
  SM_MAX = 767.98,
  MD_MIN = 768,
  MD_MAX = 991.98,
  LG_MIN = 992,
  LG_MAX = 1199.98,
  XL_MIN = 1200,
  XL_MAX = 1399.98,
  XXL_MIN = 1400
}

@Injectable({
  providedIn: "root"
})
export class DeviceService extends BaseService {
  private readonly _isBrowser: boolean;

  constructor(
    public readonly loadingService: LoadingService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService
  ) {
    super(loadingService);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  xxsMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XXS_MIN;
    }

    return false;
  }

  xxsMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XXS_MAX;
    }

    return false;
  }

  xsMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XS_MIN;
    }

    return false;
  }

  xsMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XS_MAX;
    }

    return false;
  }

  smMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.SM_MIN;
    }

    return false;
  }

  smMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.SM_MAX;
    }

    return false;
  }

  mdMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.MD_MIN;
    }

    return false;
  }

  mdMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.MD_MAX;
    }

    return false;
  }

  lgMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.LG_MIN;
    }

    return false;
  }

  lgMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.LG_MAX;
    }

    return false;
  }

  xlMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XL_MIN;
    }

    return false;
  }

  xlMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XL_MAX;
    }

    return false;
  }

  xxlMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XXL_MIN;
    }

    return false;
  }

  isTouchEnabled(): boolean {
    if (!this._isBrowser) {
      return false;
    }

    const _window = this.windowRefService.nativeWindow;

    // Use media queries to check if the device is currently using touch-based input
    const hoverQuery = _window.matchMedia("(hover: none)");  // No hover, i.e., touch input
    const pointerQuery = _window.matchMedia("(pointer: coarse)");  // Coarse pointer, i.e., touch input (finger)

    // Return true if both media queries indicate touch-based input is active
    return hoverQuery.matches && pointerQuery.matches;
  }

  offcanvasPosition(): "bottom" | "end" {
    return this.smMax() ? "bottom" : "end";
  }
}
