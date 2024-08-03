import { BaseService } from "@shared/services/base.service";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";

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

  isMobileDevice(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.windowRefService.nativeWindow;
      return window.innerWidth < 768;
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
