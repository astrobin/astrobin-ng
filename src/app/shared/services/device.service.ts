import { BaseService } from "@shared/services/base.service";
import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PlatformService } from "@shared/services/platform.service";

// Keep in sync with _breakpoints.scss
export enum Breakpoint {
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
  constructor(
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly platformService: PlatformService
  ) {
    super(loadingService);
  }

  xxsMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XXS_MIN;
    }

    return false;
  }

  xxsMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XXS_MAX;
    }

    return false;
  }

  xsMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XS_MIN;
    }

    return false;
  }

  xsMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XS_MAX;
    }

    return false;
  }

  smMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.SM_MIN;
    }

    return false;
  }

  smMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.SM_MAX;
    }

    return false;
  }

  mdMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.MD_MIN;
    }

    return false;
  }

  mdMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.MD_MAX;
    }

    return false;
  }

  lgMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.LG_MIN;
    }

    return false;
  }

  lgMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.LG_MAX;
    }

    return false;
  }

  xlMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XL_MIN;
    }

    return false;
  }

  xlMax(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XL_MAX;
    }

    return false;
  }

  xxlMin(): boolean {
    if (!this.platformService.isServer) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth >= Breakpoint.XXL_MIN;
    }

    return false;
  }

  isBrowser(): boolean {
    return this.platformService.isBrowser;
  }

  isNative(): boolean {
    return this.platformService.isNative;
  }

  isTouchEnabled(): boolean {
    if (this.platformService.isServer) {
      return false;
    }

    const _window = this.windowRefService.nativeWindow;

    return (
      // Primary checks
      "ontouchstart" in _window ||
      navigator.maxTouchPoints > 0 ||
      // Secondary checks (media queries)
      (
        _window.matchMedia("(hover: none)").matches &&
        _window.matchMedia("(pointer: coarse)").matches
      ) ||
      // Older Android support
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  isHybridPC(): boolean {
    if (this.platformService.isServer) {
      return false;
    }

    const _window = this.windowRefService.nativeWindow;
    const hasTouch = "ontouchstart" in _window || navigator.maxTouchPoints > 0;
    const hasFinePointer = _window.matchMedia("(pointer: fine)").matches;

    return hasTouch && hasFinePointer;
  }

  isMobile(): boolean {
    if (this.platformService.isServer) {
      return false;
    }

    if (typeof navigator === "undefined") {
      return false;
    }

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  offcanvasPosition(): "bottom" | "end" {
    return this.smMax() ? "bottom" : "end";
  }
}
