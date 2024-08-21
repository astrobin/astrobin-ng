import { BaseService } from "@shared/services/base.service";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";

enum Breakpoint {
  XXS = 474,
  XS = 576,
  SM = 768,
  MD = 992,
  LG = 1200,
  XL = 1400
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

  xsMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XS;
    }

    return false;
  }

  smMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.SM;
    }

    return false;
  }

  mdMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.MD;
    }

    return false;
  }

  lgMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth > Breakpoint.LG;
    }

    return false;
  }

  lgMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.LG;
    }

    return false;
  }

  xlMax(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth <= Breakpoint.XL;
    }

    return false;
  }

  xlMin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth > Breakpoint.XL;
    }

    return false;
  }

  isTouchEnabled(): boolean {
    if (!this._isBrowser) {
      return false;
    }

    const _window = this.windowRefService.nativeWindow;
    const _navigator = window.navigator;
    return "ontouchstart" in _window || _navigator.maxTouchPoints > 0 || "msMaxTouchPoints" in _navigator;
  }
}
