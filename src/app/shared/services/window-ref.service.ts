import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { DOCUMENT, isPlatformBrowser, Location } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Router } from "@angular/router";

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomWindowInterface extends Window {
}

@Injectable()
export class WindowRefService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    @Inject(DOCUMENT) private _doc: Document,
    public readonly utilsService: UtilsService,
    public readonly router: Router,
    private readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(loadingService);
  }

  get nativeWindow(): CustomWindowInterface {
    return this._doc.defaultView;
  }

  scroll(options: any) {
    if (!isPlatformBrowser(this.platformId) || typeof (this.nativeWindow?.scroll) === "undefined") {
      return;
    }

    this.nativeWindow.scroll(options);
  }

  scrollToElement(selector: string, options?: boolean | ScrollIntoViewOptions) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let attempts = 0;

    const _doScroll = () => {
      const timeout = 100;

      if (attempts >= 5) {
        return;
      }

      const $element = this.nativeWindow.document.querySelector(selector);
      if (!!$element) {
        this.utilsService.delay(timeout).subscribe(() => {
          $element.scrollIntoView(options);
        });
      } else {
        attempts++;
        this.utilsService.delay(timeout).subscribe(() => {
          _doScroll();
        });
      }
    };

    if (options === null || options === undefined) {
      options = { behavior: "smooth", block: "start", inline: "nearest" };
    }

    _doScroll();
  }

  focusElement(selector: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let attempts = 0;

    const _doFocus = () => {
      const timeout = 100;

      if (attempts >= 5) {
        return;
      }

      const $element = this.nativeWindow.document.querySelector(selector) as HTMLElement;
      if (!!$element) {
        this.utilsService.delay(timeout).subscribe(() => {
          $element.focus();
        });
      } else {
        attempts++;
        this.utilsService.delay(timeout).subscribe(() => {
          _doFocus();
        });
      }
    };

    _doFocus();
  }

  getCurrentUrl(): URL {
    return new URL(this.nativeWindow.document.URL);
  }

  locationAssign(url: string) {
    this.loadingService.setLoading(true);
    this.nativeWindow.location.assign(url);
  }

  routeTo404(fromUrl: string) {
    this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
      this.location.replaceState(fromUrl);
    });
  }
}
