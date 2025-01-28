import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { DOCUMENT, isPlatformBrowser, isPlatformServer, Location } from "@angular/common";
import { UtilsService } from "@core/services/utils/utils.service";
import { Router } from "@angular/router";
import { BehaviorSubject, fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomWindowInterface extends Window {
}

@Injectable()
export class WindowRefService extends BaseService {
  private _isMobile = new BehaviorSubject<boolean>(false);

  constructor(
    public readonly loadingService: LoadingService,
    @Inject(DOCUMENT) private _doc: Document,
    public readonly utilsService: UtilsService,
    public readonly router: Router,
    private readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(loadingService);

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.nativeWindow, "resize")
        .pipe(
          debounceTime(300)
        )
        .subscribe(() => {
          this.checkDevice(window.innerWidth);
        });

      this.checkDevice(this.nativeWindow.innerWidth);
    }
  }

  get nativeWindow(): CustomWindowInterface {
    return this._doc.defaultView;
  }

  getViewPortAspectRatio(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1;
    }

    return window.innerWidth / window.innerHeight;
  }

  scroll(options: any) {
    if (!isPlatformBrowser(this.platformId) || typeof (this.nativeWindow?.scroll) === "undefined") {
      return;
    }

    if (!options) {
      options = { top: 0, left: 0, behavior: "auto" };
    }

    let overrideScrollBehavior = false;

    if (options.behavior === "auto" || options.behavior === undefined) {
      overrideScrollBehavior = true;
    }

    if (overrideScrollBehavior) {
      this.nativeWindow.document.documentElement.style.scrollBehavior = "auto";
    }

    this.nativeWindow.scroll(options);

    if (overrideScrollBehavior) {
      this.utilsService.delay(100).subscribe(() => {
        this.nativeWindow.document.documentElement.style.scrollBehavior = "";
      });
    }
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

  routeTo404(fromUrl?: string) {
    if (!fromUrl) {
      fromUrl = this.getCurrentUrl().pathname;
    }

    this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
      this.location.replaceState(fromUrl);
    });
  }

  checkDevice(width: number) {
    this._isMobile.next(width < 768);
  }

  pushState(data: any, url: string) {
    this._pushOrReplaceState("pushState", data, url);
  }

  replaceState(data: any, url: string) {
    this._pushOrReplaceState("replaceState", data, url);
  }

  changeBodyOverflow(value: "hidden" | "auto"): void {
    if (isPlatformBrowser(this.platformId)) {
      const _document = this.nativeWindow.document;
      if (_document) {
        _document.body.classList.toggle("overflow-hidden", value === "hidden");
      }
    }
  }

  private _pushOrReplaceState(method: "pushState" | "replaceState", data: any, url: string) {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const _history = this.nativeWindow.history;
    const currentState = JSON.parse(JSON.stringify(_history.state));

    if (
      currentState &&
      currentState.url === url &&
      JSON.stringify(currentState.data) === JSON.stringify(data)
    ) {
      return;
    }

    _history[method](data, "", url);
  }
}
